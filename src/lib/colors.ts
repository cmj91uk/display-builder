export type DisplayColors = {
  /** Beige bookmark / banner frame. */
  beige: string
  /** Polka-dot fill. */
  dot: string
  /** Display letter fill. */
  letter: string
  /** Page / panel background. */
  background: string
}

export const DEFAULT_DISPLAY_COLORS: DisplayColors = {
  beige: '#ddd0bd',
  dot: '#e7ded2',
  letter: '#000000',
  background: '#ffffff',
}

export type DisplayColorKey = keyof DisplayColors

export const DISPLAY_COLOR_FIELDS: {
  key: DisplayColorKey
  label: string
}[] = [
  { key: 'beige', label: 'Frame' },
  { key: 'dot', label: 'Dots' },
  { key: 'letter', label: 'Letter' },
  { key: 'background', label: 'Background' },
]

/** Soft pastels in the same family as the default frame / dots. */
const PASTEL_SWATCHES = [
  '#ddd0bd', // default frame beige
  '#e7ded2', // default dots
  '#f3e6d8', // warm cream
  '#edd9c8', // peach sand
  '#f0d5d0', // blush
  '#e6d5e4', // soft lilac
  '#d5e3f0', // powder blue
  '#d6ebe3', // mint
  '#e8edd4', // sage mist
  '#f2e7c4', // butter
  '#e4d2c4', // soft taupe
  '#cfdccb', // muted sage
  '#e2d8ef', // lavender
  '#f5dcc8', // apricot
]

/** Stronger colours for readable display letters. */
const LETTER_SWATCHES = [
  '#000000', // default letter
  '#1f2937', // charcoal
  '#7c2d12', // rust brown
  '#b91c1c', // red
  '#c2410c', // burnt orange
  '#a16207', // gold brown
  '#166534', // forest
  '#0f766e', // teal
  '#1d4ed8', // blue
  '#5b21b6', // purple
  '#9d174d', // magenta
  '#374151', // slate
  '#ffffff', // white
]

/** Preset swatches for a colour field; the field default is always first. */
export function getPresetColors(key: DisplayColorKey): string[] {
  const defaultHex = DEFAULT_DISPLAY_COLORS[key]
  const defaultLower = defaultHex.toLowerCase()
  const palette = key === 'letter' ? LETTER_SWATCHES : PASTEL_SWATCHES
  const rest = palette.filter((swatch) => swatch.toLowerCase() !== defaultLower)
  return [defaultHex, ...rest]
}
