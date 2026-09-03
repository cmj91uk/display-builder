import {
  bannerShapeSvg,
  getShapeBounds,
  getTextBox,
  insetRect,
  type BannerShapeId,
  type Rect,
} from './shapes'
import { textStrokeForContrast } from './colors'
import {
  BANNER_FONT_WEIGHT,
  BANNER_LINE_HEIGHT,
  escapeXml,
  layoutBannerText,
} from './text'

function bannerMarkup(options: {
  text: string
  shapeId: BannerShapeId
  fontFamily: string
  shapeColor: string
  textColor: string
  width: number
  height: number
}): string {
  const frame = insetRect(
    { x: 0, y: 0, width: options.width, height: options.height },
    0.04,
  )
  const shapeBounds = getShapeBounds(options.shapeId, frame)
  const textBox = getTextBox(options.shapeId, shapeBounds)
  const layout = layoutBannerText(
    options.text,
    options.fontFamily,
    textBox.width,
    textBox.height,
  )
  const stroke = textStrokeForContrast(options.textColor)
  const strokeWidth = layout.fontSize * 0.12
  const shape = bannerShapeSvg(options.shapeId, shapeBounds, options.shapeColor)
  const textSvg = bannerTextSvg(
    layout,
    textBox,
    options.fontFamily,
    options.textColor,
    stroke,
    strokeWidth,
  )
  return `${shape}${textSvg}`
}

export function buildBannerSvg(options: {
  text: string
  shapeId: BannerShapeId
  fontFamily: string
  shapeColor: string
  textColor: string
  width: number
  height: number
  rotate90?: boolean
}): string {
  const rotate90 = options.rotate90 ?? false
  const contentWidth = rotate90 ? options.height : options.width
  const contentHeight = rotate90 ? options.width : options.height
  const inner = bannerMarkup({
    ...options,
    width: contentWidth,
    height: contentHeight,
  })
  const rotated = rotate90
    ? `<g transform="translate(${options.width} 0) rotate(90)">${inner}</g>`
    : inner

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${options.width} ${options.height}" width="${options.width}" height="${options.height}" role="img">${rotated}</svg>`
}

function bannerTextSvg(
  layout: ReturnType<typeof layoutBannerText>,
  box: Rect,
  fontFamily: string,
  fill: string,
  stroke: string | null,
  strokeWidth: number,
): string {
  if (layout.lines.length === 0 || layout.fontSize <= 0) {
    return ''
  }

  const totalHeight = layout.lines.length * layout.fontSize * BANNER_LINE_HEIGHT
  const startY =
    box.y + (box.height - totalHeight) / 2 + layout.fontSize * 0.78
  const x = box.x + box.width / 2
  const strokeAttrs = stroke
    ? ` stroke="${stroke}" stroke-width="${strokeWidth}" paint-order="stroke fill" stroke-linejoin="round"`
    : ''

  const tspans = layout.lines
    .map((line, index) => {
      const y = startY + index * layout.fontSize * BANNER_LINE_HEIGHT
      return `<tspan x="${x}" y="${y}">${escapeXml(line)}</tspan>`
    })
    .join('')

  return `<text text-anchor="middle" font-weight="${BANNER_FONT_WEIGHT}" font-size="${layout.fontSize}" font-family="${escapeXml(fontFamily)}" fill="${fill}"${strokeAttrs}>${tspans}</text>`
}
