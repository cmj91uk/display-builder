import { Link } from 'react-router'
import { useDocumentTitle } from '../useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center px-4 py-10 sm:px-6">
      <p className="mb-2 text-sm font-medium tracking-wide text-muted uppercase">
        404
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        This page isn’t here
      </h1>
      <p className="mt-3 max-w-xl text-base text-muted">
        That link doesn’t match any of the classroom apps.
      </p>
      <Link
        to="/"
        className="mt-8 w-fit rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
      >
        Back to all apps
      </Link>
    </div>
  )
}
