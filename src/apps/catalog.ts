export type MiniApp = {
  id: string
  title: string
  description: string
  path: string
}

export const MINI_APPS: MiniApp[] = [
  {
    id: 'display-designer',
    title: 'Display Designer',
    description:
      'Turn a short message into printable A4 letter pages for classroom displays.',
    path: '/apps/display-designer',
  },
  {
    id: 'drawer-labels',
    title: 'Drawer Labels',
    description:
      'Print four name labels per A4 page for classroom drawers and storage.',
    path: '/apps/drawer-labels',
  },
  {
    id: 'label-designer',
    title: 'Label Designer',
    description:
      'Print lesson-objective stickers with dates and icons on A4 label sheets.',
    path: '/apps/label-designer',
  },
]
