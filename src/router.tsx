import { createBrowserRouter } from 'react-router'
import { DisplayDesigner } from './apps/display-designer/DisplayDesigner'
import { App } from './App'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'

/** Vite `base` is `/display-builder/`; React Router basename has no trailing slash. */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: App,
      children: [
        { index: true, Component: LandingPage },
        { path: 'apps/display-designer', Component: DisplayDesigner },
        { path: '*', Component: NotFoundPage },
      ],
    },
  ],
  { basename },
)
