import type { LabelFormat } from './formats'

export function getLabelDetails(
  format: LabelFormat,
  x: number,
  y: number,
): { top: number; left: number; width: number; height: number } {
  const left = x * format.horizontalPitch + format.leftMargin
  const top = y * format.verticalPitch + format.topMargin

  return {
    top,
    left,
    width: format.width,
    height: format.height,
  }
}
