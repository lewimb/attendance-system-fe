import { useId, type ComponentProps, type ReactNode, type Ref } from 'react'
import { CircleExclamationPoint } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { DatePicker, type DatePickerProps } from './DatePicker'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export interface FieldControlProps {
  id: string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

interface FieldProps {
  label: string
  labelNote?: string
  hint?: ReactNode
  error?: string
  className?: string
  children: (control: FieldControlProps) => ReactNode
}

export function Field({ label, labelNote, hint, error, className, children }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  return (
    <div data-slot="field" className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id}>
        {label}
        {labelNote && <span className="font-normal text-muted"> ({labelNote})</span>}
      </Label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger">
          <CircleExclamationPoint aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}

type FieldShared = Omit<FieldProps, 'children'>

export function TextField({
  label,
  labelNote,
  hint,
  error,
  className,
  inputClassName,
  ...input
}: FieldShared & ComponentProps<typeof Input> & { inputClassName?: string }) {
  return (
    <Field label={label} labelNote={labelNote} hint={hint} error={error} className={className}>
      {(control) => <Input {...control} {...input} className={inputClassName} />}
    </Field>
  )
}

export function DateField({
  label,
  labelNote,
  hint,
  error,
  className,
  ...picker
}: FieldShared & Omit<DatePickerProps, 'id' | 'aria-invalid' | 'aria-describedby'>) {
  return (
    <Field label={label} labelNote={labelNote} hint={hint} error={error} className={className}>
      {(control) => <DatePicker {...control} {...picker} />}
    </Field>
  )
}

export interface SelectOption {
  value: string
  label: string
}

const EMPTY = '__empty__'

interface SelectFieldProps extends FieldShared {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  emptyLabel?: string
  disabled?: boolean
  name?: string
  ref?: Ref<HTMLButtonElement>
}

export function SelectField({
  label,
  labelNote,
  hint,
  error,
  className,
  options,
  value = '',
  onValueChange,
  onBlur,
  placeholder,
  emptyLabel,
  disabled,
  name,
  ref,
}: SelectFieldProps) {
  const selected = value === '' && emptyLabel ? EMPTY : value

  return (
    <Field label={label} labelNote={labelNote} hint={hint} error={error} className={className}>
      {(control) => (
        <Select
          value={selected}
          onValueChange={(next) => onValueChange?.(next === EMPTY ? '' : next)}
          disabled={disabled}
          name={name}
        >
          <SelectTrigger ref={ref} onBlur={onBlur} {...control}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {emptyLabel && <SelectItem value={EMPTY}>{emptyLabel}</SelectItem>}
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  )
}
