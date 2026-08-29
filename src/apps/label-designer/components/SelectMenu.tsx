import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'

export type SelectMenuOption<T extends string> = {
  value: T
  label: string
  description?: string
  leading?: ReactNode
}

type SelectMenuProps<T extends string> = {
  id?: string
  value: T
  options: readonly SelectMenuOption<T>[]
  listLabel: string
  onChange: (value: T) => void
}

export const CONTROL_SHELL_CLASS =
  'relative h-[3.25rem] rounded-lg border border-beige-dark/40 bg-white outline-none ring-beige-dark/30 focus-within:ring-2'

export const SELECT_MENU_TRIGGER_CLASS =
  'flex h-full w-full appearance-none items-center justify-between gap-3 bg-transparent px-3 text-left text-sm font-medium text-ink'

export function SelectMenu<T extends string>({
  id,
  value,
  options,
  listLabel,
  onChange,
}: SelectMenuProps<T>) {
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(selectedIndex)
  const selectedOption = options[selectedIndex] ?? options[0]

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

  function selectValue(nextValue: T) {
    onChange(nextValue)
    setOpen(false)
  }

  function openList() {
    setActiveIndex(selectedIndex)
    setOpen(true)
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (
      event.key === 'ArrowDown' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
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
      setActiveIndex((index) => (index + 1) % options.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + options.length) % options.length)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(options.length - 1)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const option = options[activeIndex]
      if (option) {
        selectValue(option.value)
      }
    }
  }

  return (
    <div ref={rootRef} className={CONTROL_SHELL_CLASS}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleTriggerKeyDown}
        className={SELECT_MENU_TRIGGER_CLASS}
      >
        <span className="flex min-w-0 items-center gap-3">
          {selectedOption?.leading}
          <span className="truncate text-sm font-medium text-ink">
            {selectedOption?.label}
          </span>
        </span>
        <span className="shrink-0 text-muted" aria-hidden="true">
          <svg
            viewBox="0 0 12 12"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {open ? (
              <path d="M2 8l4-4 4 4" />
            ) : (
              <path d="M2 4l4 4 4-4" />
            )}
          </svg>
        </span>
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={listLabel}
          aria-activedescendant={`${listboxId}-option-${activeIndex}`}
          className="absolute top-full right-0 left-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-beige-dark/40 bg-white py-1 shadow-lg font-picker-scroll"
        >
          {options.map((option, index) => {
            const selected = option.value === value
            const active = index === activeIndex
            return (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={selected}
                data-index={index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectValue(option.value)}
                className={[
                  'flex cursor-pointer items-center gap-3 px-3 py-2.5',
                  active ? 'bg-beige/60' : '',
                  selected ? 'text-ink' : 'text-ink/90',
                ].join(' ')}
              >
                {option.leading}
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{option.label}</span>
                  {option.description ? (
                    <span className="block text-xs text-muted">
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
