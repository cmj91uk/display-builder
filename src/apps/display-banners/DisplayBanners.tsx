import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router'
import { ColorField } from '../../components/ColorField'
import { FontPicker } from '../../components/FontPicker'
import {
  DEFAULT_FONT_ID,
  ensureDisplayFontsLoaded,
  getDisplayFont,
} from '../../lib/fonts'
import { useDocumentTitle } from '../../useDocumentTitle'
import { ShapePicker } from './components/ShapePicker'
import {
  BANNER_COLOR_PRESETS,
  DEFAULT_SHAPE_COLOR,
  DEFAULT_TEXT_COLOR,
} from './lib/colors'
import {
  BANNERS_PER_PAGE_OPTIONS,
  bannerContentIsRotated,
  getSlotRects,
  generateDisplayBannersPdf,
  type BannersPerPage,
} from './lib/pdf'
import { buildBannerSvg } from './lib/preview'
import { DEFAULT_SHAPE_ID, getBannerShape, type BannerShapeId } from './lib/shapes'

const A4_WIDTH_MM = 297
const A4_HEIGHT_MM = 210

export function DisplayBanners() {
  useDocumentTitle('Display Banners')

  const textId = useId()
  const bannersPerPageId = useId()
  const fontId = useId()
  const shapeIdLabel = useId()
  const colorsId = useId()

  const [text, setText] = useState('Welcome')
  const [bannersPerPage, setBannersPerPage] = useState<BannersPerPage>(1)
  const [fontOptionId, setFontOptionId] = useState(DEFAULT_FONT_ID)
  const [shapeId, setShapeId] = useState<BannerShapeId>(DEFAULT_SHAPE_ID)
  const [shapeColor, setShapeColor] = useState(DEFAULT_SHAPE_COLOR)
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedFont = getDisplayFont(fontOptionId)
  const selectedShape = getBannerShape(shapeId)
  const hasText = text.trim().length > 0
  const slots = getSlotRects(bannersPerPage, A4_WIDTH_MM, A4_HEIGHT_MM)

  useEffect(() => {
    ensureDisplayFontsLoaded()
  }, [])

  async function handleDownload() {
    setError(null)
    setIsGenerating(true)
    try {
      const slug =
        text
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 40) || 'banner'
      await generateDisplayBannersPdf({
        text,
        shapeId,
        fontFamily: selectedFont.family,
        shapeColor,
        textColor,
        bannersPerPage,
        filename: `${slug}-banners.pdf`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate PDF.')
    } finally {
      setIsGenerating(false)
    }
  }

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
          School display
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Display Banners
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted">
          Create posters for displays with shapes and text
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-8">
        <section className="flex flex-col gap-3">
          <label htmlFor={textId} className="text-sm font-medium text-ink">
            Banner text
          </label>
          <textarea
            id={textId}
            value={text}
            rows={3}
            maxLength={80}
            autoComplete="off"
            spellCheck={true}
            placeholder="e.g. Welcome"
            onChange={(event) => {
              setText(event.target.value)
              setError(null)
            }}
            className="w-full resize-y rounded-lg border border-beige-dark/40 bg-white px-4 py-3 text-lg text-ink outline-none ring-beige-dark/30 placeholder:text-muted/50 focus:ring-2"
          />
        </section>

        <section className="flex flex-col gap-3">
          <span id={shapeIdLabel} className="text-sm font-medium text-ink">
            Shape
          </span>
          <ShapePicker
            value={shapeId}
            shapeColor={shapeColor}
            labelledBy={shapeIdLabel}
            onChange={setShapeId}
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span
              id={bannersPerPageId}
              className="text-sm font-medium text-ink"
            >
              Banners per page
            </span>
            <div
              role="group"
              aria-labelledby={bannersPerPageId}
              className="flex rounded-lg border border-beige-dark/40 bg-white p-1"
            >
              {BANNERS_PER_PAGE_OPTIONS.map((count) => {
                const selected = bannersPerPage === count
                return (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setBannersPerPage(count)}
                    className={[
                      'flex-1 rounded-md px-3 py-2 text-sm font-medium transition',
                      selected
                        ? 'bg-ink text-white'
                        : 'text-muted hover:bg-beige/50 hover:text-ink',
                    ].join(' ')}
                  >
                    {count}
                  </button>
                )
              })}
            </div>
          </div>

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
              listLabel="Banner fonts"
            />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span id={colorsId} className="text-sm font-medium text-ink">
              Colours
            </span>
            <button
              type="button"
              onClick={() => {
                setShapeColor(DEFAULT_SHAPE_COLOR)
                setTextColor(DEFAULT_TEXT_COLOR)
              }}
              className="rounded-md border border-beige-dark/40 bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-beige/40"
            >
              Reset colours
            </button>
          </div>
          <div
            role="group"
            aria-labelledby={colorsId}
            className="grid grid-cols-2 gap-3"
          >
            <ColorField
              label="Outline"
              value={shapeColor}
              presetColors={BANNER_COLOR_PRESETS}
              onChange={setShapeColor}
            />
            <ColorField
              label="Text"
              value={textColor}
              presetColors={BANNER_COLOR_PRESETS}
              onChange={setTextColor}
            />
          </div>
        </section>

        <section aria-label="Page preview" className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-ink">Preview</h2>
          {hasText ? (
            <div className="overflow-hidden rounded-lg border border-beige-dark/30 bg-white shadow-sm">
              <div
                className="relative mx-auto aspect-[297/210] w-full bg-white"
              >
                {slots.map((slot, index) => {
                  const svg = buildBannerSvg({
                    text,
                    shapeId,
                    fontFamily: selectedFont.family,
                    shapeColor,
                    textColor,
                    width: slot.width * 4,
                    height: slot.height * 4,
                    rotate90: bannerContentIsRotated(bannersPerPage),
                  })
                  return (
                    <div
                      key={index}
                      className="absolute [&_svg]:h-full [&_svg]:w-full"
                      style={{
                        left: `${(slot.x / A4_WIDTH_MM) * 100}%`,
                        top: `${(slot.y / A4_HEIGHT_MM) * 100}%`,
                        width: `${(slot.width / A4_WIDTH_MM) * 100}%`,
                        height: `${(slot.height / A4_HEIGHT_MM) * 100}%`,
                      }}
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  )
                })}
              </div>
              <p className="border-t border-beige-dark/20 py-1.5 text-center text-xs text-muted">
                A4 landscape · {bannersPerPage} per page
              </p>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-beige-dark/50 bg-white/60 px-4 py-10 text-center text-muted">
              Enter some text to preview your banners.
            </p>
          )}
        </section>

        <section className="mt-auto flex flex-col gap-3 border-t border-beige-dark/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            {selectedShape.label} · {bannersPerPage}{' '}
            {bannersPerPage === 1 ? 'banner' : 'banners'} per A4 landscape
            page · {selectedFont.label}
          </p>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <button
              type="button"
              disabled={!hasText || isGenerating}
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
