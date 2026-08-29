import {
  LABEL_FORMATS,
  LABELS_PER_SHEET_OPTIONS,
  type LabelFormat,
} from '../lib/formats'
import { SelectMenu, type SelectMenuOption } from './SelectMenu'

function layoutSummary(format: LabelFormat): string {
  return `${format.countX} × ${format.countY} on A4`
}

function LayoutPreview({ format }: { format: LabelFormat }) {
  return (
    <span
      className="grid size-8 shrink-0 gap-px rounded-md border border-beige-dark/40 bg-white p-0.5"
      style={{
        gridTemplateColumns: `repeat(${format.countX}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${format.countY}, minmax(0, 1fr))`,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: format.countX * format.countY }, (_, index) => (
        <span key={index} className="rounded-[1px] bg-beige-dark/80" />
      ))}
    </span>
  )
}

const SHEET_OPTIONS: SelectMenuOption<string>[] = LABELS_PER_SHEET_OPTIONS.map(
  (option) => {
    const format = LABEL_FORMATS[option.value]
    return {
      value: option.value,
      label: option.label,
      description: format ? layoutSummary(format) : undefined,
      leading: format ? <LayoutPreview format={format} /> : undefined,
    }
  },
)

type SheetLayoutPickerProps = {
  id?: string
  value: string
  onChange: (value: string) => void
}

export function SheetLayoutPicker({
  id,
  value,
  onChange,
}: SheetLayoutPickerProps) {
  return (
    <SelectMenu
      id={id}
      value={value}
      options={SHEET_OPTIONS}
      listLabel="Labels per sheet"
      onChange={onChange}
    />
  )
}
