import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Field } from './Field'
import { Input } from './ui/input'

interface SearchFieldProps {
  label: string
  value: string
  onSearch: (value: string) => void
  placeholder?: string
  delay?: number
  maxLength?: number
  className?: string
}

export function SearchField({
  label,
  value,
  onSearch,
  placeholder,
  delay = 350,
  maxLength = 100,
  className,
}: SearchFieldProps) {
  const [text, setText] = useState(value)
  const [applied, setApplied] = useState(value)
  const timer = useRef<number | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  if (value !== applied) {
    setApplied(value)
    if (value !== text.trim()) setText(value)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function apply(next: string) {
    window.clearTimeout(timer.current)
    const trimmed = next.trim()
    if (trimmed !== value) onSearch(trimmed)
  }

  function onChange(next: string) {
    setText(next)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => apply(next), delay)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      apply(text)
    }
    if (event.key === 'Escape' && text) {
      event.preventDefault()
      setText('')
      apply('')
    }
  }

  function clear() {
    setText('')
    apply('')
    inputRef.current?.focus()
  }

  return (
    <Field label={label} className={className}>
      {(control) => (
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
          />
          <Input
            ref={inputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            maxLength={maxLength}
            placeholder={placeholder}
            value={text}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            className={cn('pl-10 [&::-webkit-search-cancel-button]:hidden', text && 'pr-11')}
            {...control}
          />
          {text && (
            <button
              type="button"
              onClick={clear}
              aria-label={`Clear ${label.toLowerCase()}`}
              className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-control text-muted transition-colors duration-150 hover:bg-neutral-soft hover:text-ink"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
      )}
    </Field>
  )
}
