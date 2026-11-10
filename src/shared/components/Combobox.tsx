import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { cn } from '@/shared/lib/utils'
import { Field } from './Field'
import { Spinner } from './Spinner'
import { Input } from './ui/input'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
}

export interface ComboboxProps {
  value: ComboboxOption | null
  onChange: (option: ComboboxOption | null) => void
  queryKey: readonly unknown[]
  loadOptions: (query: string, signal: AbortSignal) => Promise<ComboboxOption[]>
  placeholder?: string
  minChars?: number
  delay?: number
  maxLength?: number
  noResultsText?: (query: string) => string
  disabled?: boolean
  id?: string
  'aria-invalid'?: true | undefined
  'aria-describedby'?: string | undefined
}

export function Combobox({
  value,
  onChange,
  queryKey,
  loadOptions,
  placeholder,
  minChars = 1,
  delay = 300,
  maxLength = 100,
  noResultsText = (query) => `No matches for “${query}”.`,
  disabled,
  ...control
}: ComboboxProps) {
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState(value?.label ?? '')
  const [shown, setShown] = useState(value)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  if (value?.value !== shown?.value || value?.label !== shown?.label) {
    setShown(value)
    setText(value?.label ?? '')
  }

  const query = text.trim()
  const debounced = useDebouncedValue(query, delay)
  const typing = !value || text !== value.label
  const listVisible = open && typing && query.length >= minChars

  const results = useQuery({
    queryKey: [...queryKey, debounced],
    queryFn: ({ signal }) => loadOptions(debounced, signal),
    enabled: listVisible && debounced.length >= minChars,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const options = results.data ?? []
  const loading = debounced !== query || results.isFetching
  const activeIndex = Math.min(active, options.length - 1)
  const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined

  function select(option: ComboboxOption) {
    setShown(option)
    setText(option.label)
    setOpen(false)
    onChange(option)
  }

  function clear() {
    setShown(null)
    setText('')
    setOpen(false)
    onChange(null)
    inputRef.current?.focus()
  }

  function onTextChange(next: string) {
    setText(next)
    setOpen(true)
    setActive(0)
    if (value) {
      setShown(null)
      onChange(null)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) setOpen(true)
      else setActive(Math.min(activeIndex + 1, options.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(Math.max(activeIndex - 1, 0))
    } else if (event.key === 'Enter') {
      if (listVisible && activeOption) {
        event.preventDefault()
        select(activeOption)
      }
    } else if (event.key === 'Escape') {
      if (listVisible) {
        event.preventDefault()
        setOpen(false)
      } else if (text) {
        event.preventDefault()
        clear()
      }
    }
  }

  function onBlur() {
    setOpen(false)
    if (typing) setText(value?.label ?? '')
  }

  const status = !listVisible
    ? ''
    : loading && options.length === 0
      ? 'Searching'
      : results.isError
        ? 'Search failed'
        : options.length === 0
          ? noResultsText(query)
          : `${options.length} ${options.length === 1 ? 'match' : 'matches'}`

  return (
    <div className="relative">
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
      <Input
        ref={inputRef}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={listVisible}
        aria-controls={listVisible ? listId : undefined}
        aria-activedescendant={listVisible && activeOption ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        spellCheck={false}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={onBlur}
        className={cn('pl-10', text && 'pr-11')}
        {...control}
      />
      {listVisible && loading ? (
        <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted">
          <Spinner size={16} />
        </span>
      ) : (
        text && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-control text-muted transition-colors duration-150 hover:bg-neutral-soft hover:text-ink"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )
      )}

      {listVisible && (
        <div className="glass-strong absolute inset-x-0 top-full z-40 mt-1.5 overflow-hidden rounded-panel p-1 animate-pop-in">
          {options.length > 0 ? (
            <ul
              role="listbox"
              id={listId}
              aria-label="Matches"
              className={cn('max-h-72 overflow-y-auto transition-opacity duration-150', loading && 'opacity-60')}
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => setActive(index)}
                  onClick={() => select(option)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 rounded-control px-2.5 py-2 text-base pointer-coarse:py-2.5',
                    index === activeIndex && 'bg-action-soft text-action-text',
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.description && (
                    <span className="shrink-0 font-mono text-label text-muted">{option.description}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p id={listId} className="flex items-center gap-2 px-2.5 py-2 text-sm text-muted">
              {loading ? (
                <>
                  <Spinner size={14} />
                  Searching
                </>
              ) : results.isError ? (
                "Couldn't load matches. Check your connection and type again."
              ) : (
                noResultsText(query)
              )}
            </p>
          )}
        </div>
      )}

      <p role="status" className="sr-only">
        {status}
      </p>
    </div>
  )
}

export function ComboboxField({
  label,
  hint,
  error,
  className,
  ...combobox
}: Omit<ComboboxProps, 'id' | 'aria-invalid' | 'aria-describedby'> & {
  label: string
  hint?: string
  error?: string
  className?: string
}) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {(control) => <Combobox {...control} {...combobox} />}
    </Field>
  )
}
