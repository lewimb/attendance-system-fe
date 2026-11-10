import { useState, type FormEvent } from 'react'
import { Button } from '@/shared/components/Button'
import { ComboboxField, type ComboboxOption } from '@/shared/components/Combobox'
import { DateField, SelectField } from '@/shared/components/Field'
import { MAX_RANGE_DAYS } from '@/shared/lib/constants'
import { addDays } from '@/shared/lib/dates'
import type { AttendanceStatus } from '../types'
import { validateRange } from '../validation'

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'LATE', label: 'Late' },
]

export interface AttendanceFilterValues {
  from: string
  to: string
  employeeId?: string
  employeeLabel?: string
  departmentId?: number
  status?: AttendanceStatus
}

export interface FilterOption<V> {
  value: V
  label: string
}

interface AttendanceFiltersProps {
  value: AttendanceFilterValues
  onApply: (next: AttendanceFilterValues) => void
  employeeSearch?: {
    queryKey: readonly unknown[]
    loadOptions: (query: string, signal: AbortSignal) => Promise<ComboboxOption[]>
  }
  departments?: FilterOption<number>[]
  showStatus?: boolean
  busy?: boolean
}

export function AttendanceFilters({ value, onApply, employeeSearch, departments, showStatus, busy }: AttendanceFiltersProps) {
  const [draft, setDraft] = useState(value)
  const [errors, setErrors] = useState<{ from?: string; to?: string }>({})

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validateRange(draft.from, draft.to)
    setErrors(next)
    if (next.from || next.to) {
      const field = event.currentTarget.elements.namedItem(next.from ? 'from' : 'to')
      if (field instanceof HTMLElement) field.focus()
      return
    }
    onApply(draft)
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-2 items-start gap-3 pb-6 sm:gap-4 lg:grid-cols-3" aria-label="Filters">
      <DateField
        label="From"
        name="from"
        value={draft.from}
        onChange={(from) => setDraft({ ...draft, from })}
        highlight={{ from: draft.from, to: draft.to }}
        error={errors.from}
      />
      <DateField
        label="To"
        name="to"
        value={draft.to}
        onChange={(to) => setDraft({ ...draft, to })}
        min={draft.from || undefined}
        max={draft.from ? addDays(draft.from, MAX_RANGE_DAYS - 1) : undefined}
        highlight={{ from: draft.from, to: draft.to }}
        error={errors.to}
      />
      {employeeSearch && (
        <ComboboxField
          label="Employee"
          placeholder="All employees"
          value={draft.employeeId ? { value: draft.employeeId, label: draft.employeeLabel ?? '' } : null}
          onChange={(option) => setDraft({ ...draft, employeeId: option?.value, employeeLabel: option?.label })}
          queryKey={employeeSearch.queryKey}
          loadOptions={employeeSearch.loadOptions}
          noResultsText={(query) => `No employees match “${query}”.`}
          className="col-span-2 sm:col-span-1"
        />
      )}
      {showStatus && (
        <SelectField
          label="Status"
          value={draft.status ?? ''}
          onValueChange={(next) => setDraft({ ...draft, status: (next || undefined) as AttendanceStatus | undefined })}
          emptyLabel="All statuses"
          options={STATUS_OPTIONS}
        />
      )}
      {departments && (
        <SelectField
          label="Department"
          value={draft.departmentId === undefined ? '' : String(draft.departmentId)}
          onValueChange={(next) => setDraft({ ...draft, departmentId: next ? Number(next) : undefined })}
          emptyLabel="All departments"
          options={departments.map((o) => ({ value: String(o.value), label: o.label }))}
        />
      )}
      <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
        <span aria-hidden="true" className="hidden text-sm font-medium sm:block">
          &nbsp;
        </span>
        <Button type="submit" variant="secondary" loading={busy} loadingLabel="Loading" className="w-full sm:w-fit">
          Show attendance
        </Button>
      </div>
    </form>
  )
}
