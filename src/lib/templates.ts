import bookmarkSvg from '../assets/templates/bookmark.svg?raw'
import pennantSvg from '../assets/templates/pennant.svg?raw'
import ribbonSvg from '../assets/templates/ribbon.svg?raw'
import scallopSvg from '../assets/templates/scallop.svg?raw'

export type TemplateId = 'bookmark' | 'pennant' | 'scallop' | 'ribbon'

export type DisplayTemplate = {
  id: TemplateId
  label: string
  description: string
  /** Accent colour control label (dots / stripes / zigzags). */
  patternLabel: string
  svg: string
}

export const DISPLAY_TEMPLATES: DisplayTemplate[] = [
  {
    id: 'bookmark',
    label: 'Bookmark',
    description: 'Pointed classroom banner with polka dots',
    patternLabel: 'Dots',
    svg: bookmarkSvg,
  },
  {
    id: 'pennant',
    label: 'Pennant',
    description: 'Triangle bunting flag with diagonal stripes',
    patternLabel: 'Stripes',
    svg: pennantSvg,
  },
  {
    id: 'scallop',
    label: 'Scallop',
    description: 'Festive scalloped flag with zigzags',
    patternLabel: 'Zigzag',
    svg: scallopSvg,
  },
  {
    id: 'ribbon',
    label: 'Ribbon',
    description: 'Award ribbon with horizontal lines',
    patternLabel: 'Lines',
    svg: ribbonSvg,
  },
]

export const DEFAULT_TEMPLATE_ID: TemplateId = 'bookmark'

export function getDisplayTemplate(id: string): DisplayTemplate {
  return (
    DISPLAY_TEMPLATES.find((template) => template.id === id) ??
    DISPLAY_TEMPLATES[0]!
  )
}
