import jsPDF from 'jspdf'
import { formatDate } from './dateFormatter'
import type { LabelFormat } from './formats'
import { getLabelDetails } from './getLabelDetails'
import type { LabelSpec } from './label-spec'

type Coords = {
  x: number
  y: number
  height: number
  width: number
}

type TextLayout = {
  fontSize: number
  lineHeight: number
  maxLines: number
}

type ImageLayout = {
  width: number
  spacing: number
  topOffset: number
}

export type MultiLabelSpec = {
  specs: (LabelSpec | null)[]
}

function isDebugMode(): boolean {
  return window.DEBUG === 'true'
}

function drawOuterBox(doc: jsPDF, coords: Coords): void {
  if (!isDebugMode()) {
    return
  }
  const { x, y, width, height } = coords
  const rectRadius = 5
  doc.roundedRect(x, y, width, height, rectRadius, rectRadius, 'S')
}

function calculateTextLayout(height: number, hasImages: boolean): TextLayout {
  const baseLayout = {
    fontSize: 12,
    lineHeight: 1.2,
    maxLines: Math.floor(height / (12 * 1.2)),
  }

  if (hasImages) {
    return {
      ...baseLayout,
      maxLines: Math.floor(baseLayout.maxLines * 0.6),
    }
  }

  return baseLayout
}

function calculateImageLayout(
  coords: Coords,
  imageCount: number,
  imageSize: number,
  hasText: boolean,
): ImageLayout {
  const totalImageWidth = imageSize * imageCount
  const remainingSpace = coords.width - totalImageWidth
  const spacing =
    imageCount > 1 ? remainingSpace / (imageCount + 1) : remainingSpace / 2

  return {
    width: imageSize,
    spacing,
    topOffset: hasText
      ? coords.height * 0.6
      : (coords.height - imageSize) / 2,
  }
}

function addLabelText(
  doc: jsPDF,
  coords: Coords,
  text: string[],
  layout: TextLayout,
): void {
  const { x, y, width } = coords
  doc.setFontSize(layout.fontSize)
  const textContent = text.join('\n')
  doc.text(textContent, x, y, {
    maxWidth: width,
    align: 'left',
    baseline: 'top',
    lineHeightFactor: layout.lineHeight,
  })
}

function addLabelImages(
  doc: jsPDF,
  coords: Coords,
  images: string[],
  layout: ImageLayout,
): void {
  images.forEach((img, index) => {
    try {
      const imageX =
        coords.x + layout.spacing + index * (layout.width + layout.spacing)
      const imageY = coords.y + layout.topOffset
      const src = img.startsWith('data:')
        ? img
        : `data:image/png;base64,${img}`
      doc.addImage(src, 'PNG', imageX, imageY, layout.width, layout.width)
    } catch (error) {
      console.error(`Failed to add image at index ${index}:`, error)
    }
  })
}

async function buildLabel(
  doc: jsPDF,
  labelFormat: LabelFormat,
  labelSpec: LabelSpec,
  coords: Coords,
): Promise<void> {
  drawOuterBox(doc, coords)

  const margin = 4
  const usableCoords: Coords = {
    x: coords.x + margin,
    y: coords.y + margin,
    width: coords.width - 2 * margin,
    height: coords.height - 2 * margin,
  }

  const text: string[] = []
  if (labelSpec.date != null) {
    text.push(formatDate(labelSpec.dateFormat, labelSpec.date))
  }
  if (labelSpec.objective.length > 0) {
    text.push(labelSpec.objective)
  }

  const hasText = text.length > 0
  const textLayout = calculateTextLayout(
    usableCoords.height,
    labelSpec.images.length > 0,
  )
  const imageLayout =
    labelSpec.images.length > 0
      ? calculateImageLayout(
          usableCoords,
          labelSpec.images.length,
          labelFormat.imageSize,
          hasText,
        )
      : null

  if (hasText) {
    addLabelText(doc, usableCoords, text, textLayout)
  }
  if (imageLayout && labelSpec.images.length > 0) {
    addLabelImages(doc, usableCoords, labelSpec.images, imageLayout)
  }
}

export async function buildPdf(
  format: LabelFormat,
  labelSpecs: LabelSpec | MultiLabelSpec,
  fontColor: string,
): Promise<jsPDF> {
  const doc = new jsPDF({
    format: 'a4',
    orientation: 'p',
    unit: 'mm',
  })

  doc.setFontSize(format.fontSize)
  doc.setTextColor(fontColor || '#000000')

  const { countX, countY } = format
  const labelsPerPage = countX * countY

  if ('specs' in labelSpecs) {
    const totalLabels = labelSpecs.specs.filter((spec) => spec !== null).length
    const totalPages = Math.ceil(totalLabels / labelsPerPage)

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        doc.addPage()
      }

      const startIdx = page * labelsPerPage
      const endIdx = Math.min((page + 1) * labelsPerPage, labelSpecs.specs.length)
      const pageSpecs = labelSpecs.specs.slice(startIdx, endIdx)

      for (let y = 0; y < countY; y++) {
        for (let x = 0; x < countX; x++) {
          const position = y * countX + x
          if (position >= pageSpecs.length) break

          const spec = pageSpecs[position]
          if (spec) {
            if (spec.images.length > 3) {
              throw new Error(
                `Maximum of 3 images allowed per label at position ${position + startIdx}`,
              )
            }
            const { top, left, width, height } = getLabelDetails(format, x, y)
            await buildLabel(doc, format, spec, {
              x: left,
              y: top,
              width,
              height,
            })
          }
        }
      }
    }
  } else {
    if (labelSpecs.images.length > 3) {
      throw new Error('Maximum of 3 images allowed per label')
    }

    for (let y = 0; y < countY; y++) {
      for (let x = 0; x < countX; x++) {
        const { top, left, width, height } = getLabelDetails(format, x, y)
        await buildLabel(doc, format, labelSpecs, {
          x: left,
          y: top,
          width,
          height,
        })
      }
    }
  }

  doc.save('label-sheet.pdf')
  return doc
}
