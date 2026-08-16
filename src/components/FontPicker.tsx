import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { DISPLAY_FONTS, type DisplayFont } from '../lib/fonts'

type FontPickerProps = {
  id?: string
  value: string
  onChange: (fontId: string) => void
  selectedFont: DisplayFont
}

export function FontPicker({
  id,
  value,
  onChange,
  selectedFont,
}: FontPickerProps) {
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      DISPLAY_FONTS.findIndex((font) => font.id === value),
    ),
  )

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }
    const option = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    )
    option?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  function selectFont(fontId: string) {
    onChange(fontId)
    setOpen(false)
  }

  function openList() {
    setActiveIndex(
      Math.max(
        0,
        DISPLAY_FONTS.findIndex((font) => font.id === value),
      ),
    )
    setOpen(true)
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!open) {
        openList()
        return
      }
    }

    if (!open) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % DISPLAY_FONTS.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(
        (index) => (index - 1 + DISPLAY_FONTS.length) % DISPLAY_FONTS.length,
      )
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(DISPLAY_FONTS.length - 1)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const font = DISPLAY_FONTS[activeIndex]
      if (font) {
        selectFont(font.id)
      }
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleTriggerKeyDown}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-beige-dark/40 bg-white px-3 py-2.5 text-left text-ink outline-none ring-beige-dark/30 focus:ring-2"
      >
        <span
          className="truncate text-lg leading-tight uppercase"
          style={{ fontFamily: selectedFont.family }}
        >
          {selectedFont.label}
        </span>
        <span className="shrink-0 text-muted" aria-hidden="true">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Letter fonts"
          aria-activedescendant={`${listboxId}-option-${activeIndex}`}
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-beige-dark/40 bg-white py-1 shadow-lg"
        >
          {DISPLAY_FONTS.map((font, index) => {
            const selected = font.id === value
            const active = index === activeIndex
            return (
              <li
                key={font.id}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={selected}
                data-index={index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectFont(font.id)}
                className={[
                  'cursor-pointer px-3 py-2.5 text-lg leading-tight uppercase',
                  active ? 'bg-beige/60' : '',
                  selected ? 'text-ink' : 'text-ink/90',
                ].join(' ')}
                style={{ fontFamily: font.family }}
              >
                {font.label}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
