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
]
