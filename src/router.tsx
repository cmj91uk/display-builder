import { createBrowserRouter } from 'react-router'
import { DisplayDesigner } from './apps/display-designer/DisplayDesigner'
import { DrawerLabels } from './apps/drawer-labels/DrawerLabels'
import { LabelDesigner } from './apps/label-designer/LabelDesigner'
import { App } from './App'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'

/** Vite `base` is `/classroom-apps/`; React Router basename has no trailing slash. */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: App,
      children: [
        { index: true, Component: LandingPage },
        { path: 'apps/display-designer', Component: DisplayDesigner },
        { path: 'apps/drawer-labels', Component: DrawerLabels },
        { path: 'apps/label-designer', Component: LabelDesigner },
        { path: '*', Component: NotFoundPage },
      ],
    },
  ],
  { basename },
)
