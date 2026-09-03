export const BANNER_FONT_WEIGHT = 700
export const BANNER_LINE_HEIGHT = 1.12

let measureCtx: CanvasRenderingContext2D | null = null

function getMeasureContext(): CanvasRenderingContext2D {
  if (measureCtx) {
    return measureCtx
  }
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas is not available')
  }
  measureCtx = ctx
  return ctx
}

export type TextLayout = {
  lines: string[]
  fontSize: number
}

function wrapLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const trimmed = text.trim()
  if (!trimmed) {
    return []
  }

  const words = trimmed.split(/\s+/)
  const lines: string[] = []
  let current = words[0]!

  for (const word of words.slice(1)) {
    const trial = `${current} ${word}`
    if (ctx.measureText(trial).width <= maxWidth) {
      current = trial
    } else {
      lines.push(current)
      current = word
    }
  }
  lines.push(current)
  return lines
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const paragraphs = text.replace(/\r\n/g, '\n').split('\n')
  const lines: string[] = []
  for (const paragraph of paragraphs) {
    const wrapped = wrapLine(ctx, paragraph, maxWidth)
    if (wrapped.length === 0) {
      continue
    }
    lines.push(...wrapped)
  }
  return lines
}

export function layoutBannerText(
  text: string,
  fontFamily: string,
  boxWidth: number,
  boxHeight: number,
): TextLayout {
  const source = text.trim()
  if (!source || boxWidth <= 0 || boxHeight <= 0) {
    return { lines: [], fontSize: 0 }
  }

  const ctx = getMeasureContext()
  const maxFontSize = Math.min(boxHeight * 0.92, boxWidth * 0.42)
  const minFontSize = Math.max(8, Math.min(boxHeight, boxWidth) * 0.08)

  let fontSize = maxFontSize

  while (fontSize > minFontSize) {
    ctx.font = `${BANNER_FONT_WEIGHT} ${fontSize}px ${fontFamily}`
    const lines = wrapText(ctx, source, boxWidth)
    if (lines.length === 0) {
      return { lines: [], fontSize: 0 }
    }
    const totalHeight = lines.length * fontSize * BANNER_LINE_HEIGHT
    const maxLineWidth = Math.max(
      ...lines.map((line) => ctx.measureText(line).width),
    )
    if (totalHeight <= boxHeight && maxLineWidth <= boxWidth) {
      break
    }
    fontSize -= 1
  }

  ctx.font = `${BANNER_FONT_WEIGHT} ${fontSize}px ${fontFamily}`
  return { lines: wrapText(ctx, source, boxWidth), fontSize }
}

export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
