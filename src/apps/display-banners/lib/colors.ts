export const DEFAULT_SHAPE_COLOR = '#000000'
export const DEFAULT_TEXT_COLOR = '#000000'

/** Stronger colours for readable outlines and lettering. */
export const BANNER_COLOR_PRESETS = [
  '#000000',
  '#1f2937',
  '#7c2d12',
  '#b91c1c',
  '#c2410c',
  '#a16207',
  '#166534',
  '#0f766e',
  '#1d4ed8',
  '#5b21b6',
  '#9d174d',
  '#374151',
  '#ffffff',
]

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const value = hex.replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value
  if (full.length !== 6) {
    return null
  }
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) {
    return null
  }
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function channel(value: number): number {
  const s = value / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) {
    return 0
  }
  return (
    0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
  )
}

function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Outline letters that would disappear on the white page. */
export function textStrokeForContrast(textColor: string): string | null {
  if (contrastRatio('#ffffff', textColor) >= 2.6) {
    return null
  }
  return '#000000'
}
