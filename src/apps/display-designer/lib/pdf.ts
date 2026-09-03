import { addPdfAttributionToAllPages } from '../../../lib/pdfAttribution'
import {
  DEFAULT_DISPLAY_COLORS,
  type DisplayColors,
} from './colors'
import { waitForFont } from './fonts'
import { extractDisplayCharacters } from './letters'
import {
  DEFAULT_TEMPLATE_ID,
  getDisplayTemplate,
  type TemplateId,
} from './templates'

export type LettersPerPage = 1 | 2 | 4

export const LETTERS_PER_PAGE_OPTIONS: LettersPerPage[] = [1, 2, 4]

/** Template coordinate space (matches the SVG viewBox). */
const SVG_SIZE = 1248
const PAGE_MARGIN_MM = 12
const SLOT_GAP_MM = 6
const LETTER_FONT_WEIGHT = 700
const DEFAULT_LETTER_FONT_SIZE_PX = 640
const DEFAULT_LETTER_CENTER_X = 624
const DEFAULT_LETTER_CENTER_Y = 530

/** Enough detail for A4 classroom printouts without oversized embeds. */
const PRINT_DPI = 150
const JPEG_QUALITY = 0.82
const MIN_RENDER_PX = 360
const MAX_RENDER_PX = 1100

/** Inline CSS vars so SVG→canvas/img rendering is reliable across browsers. */
function applyColors(svgMarkup: string, colors: DisplayColors): string {
  return svgMarkup
    .replaceAll('var(--beige)', colors.beige)
    .replaceAll('var(--dot)', colors.dot)
    .replaceAll('var(--letter)', colors.letter)
    .replaceAll('var(--background)', colors.background)
}

function applyFontFamily(styleText: string, fontFamily: string): string {
  if (/font-family\s*:/.test(styleText)) {
    return styleText.replace(/font-family\s*:[^;]+;/, `font-family: ${fontFamily};`)
  }
  return styleText.replace(
    /\.letter\s*\{/,
    `.letter {\n        font-family: ${fontFamily};`,
  )
}

function uniqueSvgIds(svgMarkup: string, suffix: string): string {
  const ids = [...svgMarkup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]!)
  let result = svgMarkup
  for (const id of ids) {
    result = result.replaceAll(`id="${id}"`, `id="${id}-${suffix}"`)
    result = result.replaceAll(`url(#${id})`, `url(#${id}-${suffix})`)
  }
  return result
}

type LetterMetrics = {
  x: number
  y: number
  fontSize: number
}

function readLetterMetrics(doc: Document): LetterMetrics {
  const textEl = doc.getElementById('display-character')
  const x = Number(textEl?.getAttribute('x') ?? DEFAULT_LETTER_CENTER_X)
  const y = Number(textEl?.getAttribute('y') ?? DEFAULT_LETTER_CENTER_Y)
  const styleText = doc.querySelector('style')?.textContent ?? ''
  const fontSizeMatch = styleText.match(/font-size:\s*([\d.]+)px/)
  const fontSize = fontSizeMatch
    ? Number(fontSizeMatch[1])
    : DEFAULT_LETTER_FONT_SIZE_PX
  return { x, y, fontSize }
}

type SvgBuildOptions = {
  character: string
  fontFamily: string
  colors: DisplayColors
  templateSvg: string
  /** Hide glyph so canvas can paint text with page-loaded fonts. */
  hideCharacter?: boolean
  idSuffix?: string
}

function buildLetterSvg({
  character,
  fontFamily,
  colors,
  templateSvg,
  hideCharacter = false,
  idSuffix,
}: SvgBuildOptions): { markup: string; metrics: LetterMetrics } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(templateSvg, 'image/svg+xml')
  const textEl = doc.getElementById('display-character')
  if (!textEl) {
    throw new Error('SVG template missing #display-character')
  }
  textEl.textContent = character
  if (hideCharacter) {
    textEl.setAttribute('opacity', '0')
  }

  const styleEl = doc.querySelector('style')
  if (styleEl?.textContent) {
    styleEl.textContent = applyFontFamily(styleEl.textContent, fontFamily)
  }

  const metrics = readLetterMetrics(doc)
  let markup = applyColors(
    new XMLSerializer().serializeToString(doc.documentElement),
    colors,
  )
  if (idSuffix) {
    markup = uniqueSvgIds(markup, idSuffix)
  }
  return { markup, metrics }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to render letter SVG'))
    img.src = src
  })
}

function slotSizeToPixels(slotSizeMm: number): number {
  const px = Math.round((slotSizeMm / 25.4) * PRINT_DPI)
  return Math.min(MAX_RENDER_PX, Math.max(MIN_RENDER_PX, px))
}

function colorCacheKey(colors: DisplayColors): string {
  return `${colors.beige}|${colors.dot}|${colors.letter}|${colors.background}`
}

async function renderLetterJpeg(
  character: string,
  fontFamily: string,
  colors: DisplayColors,
  templateSvg: string,
  pixelSize: number,
): Promise<string> {
  await waitForFont(fontFamily)

  // Frame via SVG image (no glyph); paint letter with canvas so web fonts work.
  const { markup: frameSvg, metrics } = buildLetterSvg({
    character,
    fontFamily,
    colors,
    templateSvg,
    hideCharacter: true,
  })
  const blob = new Blob([frameSvg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const scale = pixelSize / SVG_SIZE

  try {
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = pixelSize
    canvas.height = pixelSize
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas is not available')
    }

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, pixelSize, pixelSize)
    ctx.drawImage(img, 0, 0, pixelSize, pixelSize)

    ctx.fillStyle = colors.letter
    ctx.font = `${LETTER_FONT_WEIGHT} ${metrics.fontSize * scale}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(character, metrics.x * scale, metrics.y * scale)

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  } finally {
    URL.revokeObjectURL(url)
  }
}

type SlotRect = { x: number; y: number; size: number }

function getSlotRects(
  lettersPerPage: LettersPerPage,
  pageWidth: number,
  pageHeight: number,
  countOnPage: number,
): SlotRect[] {
  const margin = PAGE_MARGIN_MM
  const gap = SLOT_GAP_MM

  if (lettersPerPage === 1) {
    const size = Math.min(pageWidth - margin * 2, pageHeight - margin * 2)
    return [{ x: (pageWidth - size) / 2, y: (pageHeight - size) / 2, size }]
  }

  if (lettersPerPage === 2) {
    const rows = 2
    const availW = pageWidth - margin * 2
    const availH = pageHeight - margin * 2 - gap * (rows - 1)
    const size = Math.min(availW, availH / rows)
    const totalH = size * countOnPage + gap * Math.max(0, countOnPage - 1)
    const startY = (pageHeight - totalH) / 2
    const x = (pageWidth - size) / 2
    return Array.from({ length: countOnPage }, (_, i) => ({
      x,
      y: startY + i * (size + gap),
      size,
    }))
  }

  // 4 letters: 2×2 grid (partial last page still left-to-right, top-to-bottom)
  const cols = 2
  const availW = pageWidth - margin * 2 - gap
  const availH = pageHeight - margin * 2 - gap
  const size = Math.min(availW / cols, availH / cols)
  const rowCount = Math.ceil(countOnPage / cols)
  const totalW =
    size * Math.min(cols, countOnPage) + gap * Math.max(0, Math.min(cols, countOnPage) - 1)
  const totalH = size * rowCount + gap * Math.max(0, rowCount - 1)
  const startX = (pageWidth - totalW) / 2
  const startY = (pageHeight - totalH) / 2

  return Array.from({ length: countOnPage }, (_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const colsInRow =
      row === rowCount - 1 && countOnPage % cols !== 0 ? countOnPage % cols : cols
    const rowWidth = size * colsInRow + gap * Math.max(0, colsInRow - 1)
    const rowStartX = (pageWidth - rowWidth) / 2
    return {
      x: (colsInRow < cols ? rowStartX : startX) + col * (size + gap),
      y: startY + row * (size + gap),
      size,
    }
  })
}

export type GenerateDisplayPdfOptions = {
  text: string
  lettersPerPage?: LettersPerPage
  fontFamily?: string
  colors?: DisplayColors
  templateId?: TemplateId
  filename?: string
}

export async function generateDisplayPdf({
  text,
  lettersPerPage = 1,
  fontFamily = '"Baloo 2", sans-serif',
  colors = DEFAULT_DISPLAY_COLORS,
  templateId = DEFAULT_TEMPLATE_ID,
  filename = 'display-letters.pdf',
}: GenerateDisplayPdfOptions): Promise<void> {
  const characters = extractDisplayCharacters(text)
  if (characters.length === 0) {
    throw new Error('Enter at least one letter or digit to generate a PDF.')
  }

  const template = getDisplayTemplate(templateId)
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const sampleSlots = getSlotRects(lettersPerPage, pageWidth, pageHeight, 1)
  const pixelSize = slotSizeToPixels(sampleSlots[0]!.size)
  const imageCache = new Map<string, string>()

  for (
    let pageStart = 0;
    pageStart < characters.length;
    pageStart += lettersPerPage
  ) {
    if (pageStart > 0) {
      pdf.addPage()
    }

    const chunk = characters.slice(pageStart, pageStart + lettersPerPage)
    const slots = getSlotRects(
      lettersPerPage,
      pageWidth,
      pageHeight,
      chunk.length,
    )

    for (let i = 0; i < chunk.length; i++) {
      const character = chunk[i]!
      const cacheKey = `${template.id}|${character}|${fontFamily}|${colorCacheKey(colors)}|${pixelSize}`
      let imageData = imageCache.get(cacheKey)
      if (!imageData) {
        imageData = await renderLetterJpeg(
          character,
          fontFamily,
          colors,
          template.svg,
          pixelSize,
        )
        imageCache.set(cacheKey, imageData)
      }
      const slot = slots[i]!
      pdf.addImage(imageData, 'JPEG', slot.x, slot.y, slot.size, slot.size)
    }
  }

  addPdfAttributionToAllPages(pdf)
  pdf.save(filename)
}

export function buildLetterSvgPreview(
  character: string,
  fontFamily: string,
  colors: DisplayColors,
  templateId: TemplateId,
  idSuffix: string,
): string {
  const template = getDisplayTemplate(templateId)
  return buildLetterSvg({
    character: character.toUpperCase(),
    fontFamily,
    colors,
    templateSvg: template.svg,
    idSuffix,
  }).markup
}

export function pageCountFor(text: string, lettersPerPage: LettersPerPage): number {
  const count = extractDisplayCharacters(text).length
  if (count === 0) {
    return 0
  }
  return Math.ceil(count / lettersPerPage)
}
