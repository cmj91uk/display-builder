export type DisplayFont = {
  id: string
  label: string
  /** CSS font-family stack used in SVG / canvas. */
  family: string
  /** Google Fonts family query segment, e.g. `Fredoka:wght@700`. */
  google?: string
}

export const DISPLAY_FONTS: DisplayFont[] = [
  {
    id: 'rubik',
    label: 'Rubik',
    family: 'Rubik, sans-serif',
    google: 'Rubik:wght@400;600;700',
  },
  {
    id: 'passion',
    label: 'Passion One',
    family: '"Passion One", sans-serif',
    google: 'Passion+One:wght@400;700',
  },
  {
    id: 'baloo',
    label: 'Baloo 2',
    family: '"Baloo 2", sans-serif',
    google: 'Baloo+2:wght@400;600;700;800',
  },
  {
    id: 'nunito',
    label: 'Nunito',
    family: 'Nunito, sans-serif',
    google: 'Nunito:wght@400;600;700;800',
  },
  {
    id: 'fredoka',
    label: 'Fredoka',
    family: 'Fredoka, sans-serif',
    google: 'Fredoka:wght@400;600;700',
  },
  {
    id: 'courier',
    label: 'Courier New',
    family: 'Courier New, Courier, monospace',
  },
  {
    id: 'comic',
    label: 'Comic Sans',
    family: 'Comic Sans MS, Comic Sans, cursive',
  },
  {
    id: 'trebuchet',
    label: 'Trebuchet MS',
    family: 'Trebuchet MS, Helvetica, sans-serif',
  },
  {
    id: 'verdana',
    label: 'Verdana',
    family: 'Verdana, Geneva, sans-serif',
  },
  {
    id: 'times',
    label: 'Times New Roman',
    family: 'Times New Roman, Times, serif',
  },
  {
    id: 'georgia',
    label: 'Georgia',
    family: 'Georgia, Times New Roman, Times, serif',
  },
  {
    id: 'impact',
    label: 'Impact',
    family: 'Impact, Haettenschweiler, Arial Narrow, sans-serif',
  },
  {
    id: 'arial-black',
    label: 'Arial Black',
    family: 'Arial Black, Arial, Helvetica, sans-serif',
  },
  {
    id: 'arial-rounded',
    label: 'Arial Rounded',
    family: 'Arial Rounded MT Bold, Arial Black, Arial, Helvetica, sans-serif',
  },
]

export const DEFAULT_FONT_ID = 'baloo'

export function getDisplayFont(id: string): DisplayFont {
  return (
    DISPLAY_FONTS.find((font) => font.id === id) ??
    DISPLAY_FONTS.find((font) => font.id === DEFAULT_FONT_ID) ??
    DISPLAY_FONTS[0]!
  )
}

/** Primary family name for document.fonts.load / canvas. */
export function primaryFontName(family: string): string {
  const first = family.split(',')[0]?.trim() ?? family
  return first.replace(/^["']|["']$/g, '')
}

const GOOGLE_LINK_ID = 'display-designer-google-fonts'

/** Ensure Google Fonts used by the picker are available on the page. */
export function ensureDisplayFontsLoaded(): void {
  const families = DISPLAY_FONTS.filter((font) => font.google).map(
    (font) => font.google!,
  )
  if (families.length === 0) {
    return
  }

  const href = `https://fonts.googleapis.com/css2?${families
    .map((family) => `family=${family}`)
    .join('&')}&display=swap`

  const existing = document.getElementById(GOOGLE_LINK_ID) as HTMLLinkElement | null
  if (existing) {
    existing.href = href
    return
  }

  const link = document.createElement('link')
  link.id = GOOGLE_LINK_ID
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

export async function waitForFont(family: string): Promise<void> {
  const name = primaryFontName(family)
  try {
    await document.fonts.load(`700 640px "${name}"`)
    await document.fonts.load(`600 640px "${name}"`)
  } catch {
    // Fall through — canvas will use the next font in the stack.
  }
  await document.fonts.ready
}
