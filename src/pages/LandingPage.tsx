import { Link } from 'react-router'
import { MINI_APPS } from '../apps/catalog'
import { useDocumentTitle } from '../useDocumentTitle'

export function LandingPage() {
  useDocumentTitle('Classroom apps')

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col px-4 py-10 sm:px-6">
      <header className="mb-12">
        <p className="mb-2 text-sm font-medium tracking-wide text-muted uppercase">
          Classroom tools
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Mini apps for displays and printables
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted">
          Pick an app to get started. More classroom tools will land here over
          time.
        </p>
      </header>

      <main>
        <ul className="grid gap-4 sm:grid-cols-2">
          {MINI_APPS.map((app) => (
            <li key={app.id}>
              <Link
                to={app.path}
                className="flex h-full flex-col rounded-xl border border-beige-dark/40 bg-white p-5 shadow-sm transition hover:border-beige-dark hover:shadow-md"
              >
                <h2 className="text-lg font-semibold text-ink">{app.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted">
                  {app.description}
                </p>
                <span className="mt-4 text-sm font-medium text-ink">
                  Open app →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
