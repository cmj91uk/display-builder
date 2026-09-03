import type { jsPDF } from 'jspdf'

export const CLASSROOM_APPS_URL = 'https://cmj91uk.github.io/classroom-apps/'
export const PDF_ATTRIBUTION_TEXT =
  'Generated with Classroom Apps — https://cmj91uk.github.io/classroom-apps/'

const GREY = 176
/** ~5mm keeps the line inside typical printer printable areas. */
const EDGE_INSET_MM = 5
const MIN_GAP_FROM_CONTENT_MM = 1.6

type AttributionOptions = {
  /**
   * Bottom edge of sheet content in mm from the page top.
   * Used to keep Avery credits in the leftover gutter, not on labels.
   */
  contentBottomMm?: number
  /**
   * Top edge of sheet content in mm from the page top.
   * Fallback if the bottom gutter is too tight.
   */
  contentTopMm?: number
  fontSizePt?: number
}

function drawLinkedAttribution(
  doc: jsPDF,
  x: number,
  y: number,
  fontSizePt: number,
): void {
  const text = PDF_ATTRIBUTION_TEXT
  const textWidth = doc.getTextWidth(text)
  const heightMm = fontSizePt * 0.352778

  doc.text(text, x, y, { align: 'center', baseline: 'middle' })
  doc.link(x - textWidth / 2, y - heightMm / 2, textWidth, heightMm, {
    url: CLASSROOM_APPS_URL,
  })
}

function drawOnCurrentPage(doc: jsPDF, options: AttributionOptions): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const fontSizePt = options.fontSizePt ?? 7
  const x = pageWidth / 2

  const prevColor = doc.getTextColor()
  const prevSize = doc.getFontSize()

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(fontSizePt)
  doc.setTextColor(GREY, GREY, GREY)

  const bottomY = pageHeight - EDGE_INSET_MM
  const topY = EDGE_INSET_MM
  const contentBottom = options.contentBottomMm
  const contentTop = options.contentTopMm

  let y = bottomY
  if (
    contentBottom != null &&
    bottomY < contentBottom + MIN_GAP_FROM_CONTENT_MM
  ) {
    if (
      contentTop != null &&
      topY + MIN_GAP_FROM_CONTENT_MM <= contentTop
    ) {
      y = topY
    } else {
      doc.setTextColor(prevColor)
      doc.setFontSize(prevSize)
      return
    }
  }

  drawLinkedAttribution(doc, x, y, fontSizePt)

  doc.setTextColor(prevColor)
  doc.setFontSize(prevSize)
}

export function addPdfAttributionToAllPages(
  doc: jsPDF,
  options: AttributionOptions = {},
): void {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    drawOnCurrentPage(doc, options)
  }
}
