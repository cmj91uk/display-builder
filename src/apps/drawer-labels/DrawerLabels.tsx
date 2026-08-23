import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ColorField } from '../display-designer/components/ColorField'
import { FontPicker } from '../display-designer/components/FontPicker'
import {
  DEFAULT_FONT_ID,
  ensureDisplayFontsLoaded,
  getDisplayFont,
} from '../display-designer/lib/fonts'
import { useDocumentTitle } from '../../useDocumentTitle'
import { DEFAULT_LABEL_COLOR, LABEL_COLOR_PRESETS } from './lib/colors'
import {
  generateDrawerLabelsPdf,
  LABEL_HEIGHT_MM,
  LABELS_PER_PAGE,
  PAGE_MARGIN_X_MM,
  SLOT_GAP_MM,
  pageCountFor,
  type DrawerLabel,
} from './lib/pdf'

function createLabel(name: string, color: string): DrawerLabel {
  return {
    id: crypto.randomUUID(),
    name,
    color,
  }
}

export function DrawerLabels() {
  useDocumentTitle('Drawer Labels')

  const nameId = useId()
  const fontId = useId()
  const nameInputRef = useRef<HTMLInputElement>(null)

  const [draftName, setDraftName] = useState('')
  const [fontOptionId, setFontOptionId] = useState(DEFAULT_FONT_ID)
  const [defaultColor, setDefaultColor] = useState(DEFAULT_LABEL_COLOR)
  const [labels, setLabels] = useState<DrawerLabel[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedFont = getDisplayFont(fontOptionId)
  const pageCount = pageCountFor(labels.length)
  const canAdd = draftName.trim().length > 0

  useEffect(() => {
    ensureDisplayFontsLoaded()
  }, [])

  function addLabel() {
    const name = draftName.trim()
    if (!name) {
      return
    }
    setLabels((current) => [...current, createLabel(name, defaultColor)])
    setDraftName('')
    setError(null)
    nameInputRef.current?.focus()
  }

  function updateLabel(id: string, patch: Partial<Pick<DrawerLabel, 'name' | 'color'>>) {
    setLabels((current) =>
      current.map((label) => (label.id === id ? { ...label, ...patch } : label)),
    )
  }

  function removeLabel(id: string) {
    setLabels((current) => current.filter((label) => label.id !== id))
  }

  async function handleDownload() {
    setError(null)
    setIsGenerating(true)
    try {
      await generateDrawerLabelsPdf({
        labels,
        fontFamily: selectedFont.family,
        filename: 'drawer-labels.pdf',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate PDF.')
    } finally {
      setIsGenerating(false)
    }
  }

  const pages = Array.from({ length: pageCount }, (_, pageIndex) =>
    labels.slice(
      pageIndex * LABELS_PER_PAGE,
      pageIndex * LABELS_PER_PAGE + LABELS_PER_PAGE,
    ),
  )

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col px-4 py-10 sm:px-6">
      <header className="mb-10">
        <Link
          to="/"
          className="mb-4 inline-block text-sm font-medium text-muted transition hover:text-ink"
        >
          ← All apps
        </Link>
        <p className="mb-2 text-sm font-medium tracking-wide text-muted uppercase">
          Classroom printables
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Drawer Labels
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted">
          Add names, pick a font and colour, then print four labels per A4 page.
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-8">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor={fontId} className="text-sm font-medium text-ink">
              Font
            </label>
            <FontPicker
              id={fontId}
              value={fontOptionId}
              selectedFont={selectedFont}
              onChange={setFontOptionId}
              uppercasePreview={false}
              listLabel="Label fonts"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">Default colour</span>
            <ColorField
              label="Default colour"
              value={defaultColor}
              presetColors={LABEL_COLOR_PRESETS}
              onChange={setDefaultColor}
              showLabel={false}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <label htmlFor={nameId} className="text-sm font-medium text-ink">
            Add a name
          </label>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              addLabel()
            }}
          >
            <input
              ref={nameInputRef}
              id={nameId}
              type="text"
              value={draftName}
              autoComplete="off"
              spellCheck={false}
              placeholder="e.g. Pencils"
              onChange={(event) => {
                setDraftName(event.target.value)
                setError(null)
              }}
              className="w-full rounded-lg border border-beige-dark/40 bg-white px-4 py-3 text-lg text-ink outline-none ring-beige-dark/30 placeholder:text-muted/50 focus:ring-2"
            />
            <button
              type="submit"
              disabled={!canAdd}
              aria-label="Add label"
              className="flex size-[3.25rem] shrink-0 items-center justify-center rounded-lg bg-ink text-2xl font-semibold text-white transition enabled:hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-3" aria-label="Labels">
          {labels.length === 0 ? (
            <p className="rounded-lg border border-dashed border-beige-dark/50 bg-white/60 px-4 py-10 text-center text-muted">
              Add a name to start your sheet of drawer labels.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {labels.map((label, index) => (
                <li
                  key={label.id}
                  className="flex items-center gap-2 rounded-lg border border-beige-dark/30 bg-white p-2"
                >
                  <span className="w-6 shrink-0 text-center text-xs text-muted">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={label.name}
                    aria-label={`Label ${index + 1} name`}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) =>
                      updateLabel(label.id, { name: event.target.value })
                    }
                    className="min-w-0 flex-1 rounded-md border border-beige-dark/30 bg-white px-3 py-2 text-base text-ink outline-none ring-beige-dark/30 focus:ring-2"
                    style={{ fontFamily: selectedFont.family, color: label.color }}
                  />
                  <ColorField
                    compact
                    label={`Label ${index + 1} colour`}
                    value={label.color}
                    presetColors={LABEL_COLOR_PRESETS}
                    onChange={(hex) => updateLabel(label.id, { color: hex })}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${label.name || `label ${index + 1}`}`}
                    onClick={() => removeLabel(label.id)}
                    className="rounded-md px-2 py-2 text-sm font-medium text-muted transition hover:bg-beige/50 hover:text-ink"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Page preview" className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-ink">Preview</h2>
          {pages.length === 0 ? (
            <p className="rounded-lg border border-dashed border-beige-dark/50 bg-white/60 px-4 py-10 text-center text-muted">
              Labels will preview four to an A4 page, stacked vertically.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {pages.map((pageLabels, pageIndex) => (
                <li
                  key={pageIndex}
                  className="overflow-hidden rounded-lg border border-beige-dark/30 bg-white shadow-sm"
                >
                  <div
                    className="flex aspect-[210/297] flex-col justify-center"
                    style={{
                      paddingLeft: `${(PAGE_MARGIN_X_MM / 210) * 100}%`,
                      paddingRight: `${(PAGE_MARGIN_X_MM / 210) * 100}%`,
                      gap: `${(SLOT_GAP_MM / 297) * 100}%`,
                    }}
                  >
                    {Array.from({ length: LABELS_PER_PAGE }, (_, slotIndex) => {
                      const label = pageLabels[slotIndex]
                      return (
                        <div
                          key={label?.id ?? `empty-${slotIndex}`}
                          className="flex w-full shrink-0 items-center justify-center rounded-md border-2 px-2"
                          style={{
                            aspectRatio: `${210 - PAGE_MARGIN_X_MM * 2} / ${LABEL_HEIGHT_MM}`,
                            borderColor: label?.color ?? '#e7ded2',
                            borderStyle: label ? 'solid' : 'dashed',
                          }}
                        >
                          {label ? (
                            <p
                              className="max-w-full truncate text-center text-2xl leading-none sm:text-3xl"
                              style={{
                                fontFamily: selectedFont.family,
                                color: label.color,
                              }}
                            >
                              {label.name}
                            </p>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                  <p className="border-t border-beige-dark/20 py-1.5 text-center text-xs text-muted">
                    Page {pageIndex + 1}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-auto flex flex-col gap-3 border-t border-beige-dark/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            4 labels per A4 page · {selectedFont.label}
            {pageCount > 0
              ? ` · ${pageCount} page${pageCount === 1 ? '' : 's'}`
              : ''}
          </p>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <button
              type="button"
              disabled={labels.length === 0 || isGenerating}
              onClick={handleDownload}
              className="rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition enabled:hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isGenerating ? 'Generating PDF…' : 'Download PDF'}
            </button>
            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}
