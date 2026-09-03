import {
  BANNER_SHAPES,
  bannerShapeSvg,
  getShapeBounds,
  type BannerShapeId,
} from '../lib/shapes'

type ShapePickerProps = {
  value: BannerShapeId
  shapeColor: string
  labelledBy: string
  onChange: (id: BannerShapeId) => void
}

function shapePreviewSvg(shapeId: BannerShapeId, color: string): string {
  const frame = { x: 8, y: 8, width: 84, height: 84 }
  const bounds = getShapeBounds(shapeId, frame)
  const shape = bannerShapeSvg(shapeId, bounds, color)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true">${shape}</svg>`
}

export function ShapePicker({
  value,
  shapeColor,
  labelledBy,
  onChange,
}: ShapePickerProps) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {BANNER_SHAPES.map((shape) => {
        const selected = value === shape.id
        return (
          <button
            key={shape.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(shape.id)}
            className={[
              'overflow-hidden rounded-lg border bg-white text-left transition',
              selected
                ? 'border-ink ring-2 ring-ink/20'
                : 'border-beige-dark/40 hover:border-beige-dark',
            ].join(' ')}
          >
            <div
              className="aspect-square w-full bg-beige/40 p-3 [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{
                __html: shapePreviewSvg(shape.id, shapeColor),
              }}
            />
            <div className="border-t border-beige-dark/20 px-2 py-2">
              <p className="text-sm font-medium text-ink">{shape.label}</p>
              <p className="mt-0.5 text-xs text-muted">{shape.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
