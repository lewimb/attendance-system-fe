import { useState } from 'react'
import { Controller, useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { friendlyMessage, toApiError } from '@/shared/api/errors'
import { Button } from '@/shared/components/Button'
import { SelectField, TextField } from '@/shared/components/Field'
import { ROLE_IDS } from '@/shared/lib/constants'
import type { Department, Employee } from '@/shared/types'
import { createEmployeeSchema, editEmployeeSchema, EMPTY_EMPLOYEE_FORM, type EmployeeFormValues } from '../schemas'
import type { CreateEmployeeInput, UpdateEmployeeInput } from '../types'

type Props =
  | {
      mode: 'create'
      departments: Department[]
      onSubmit: (input: CreateEmployeeInput) => Promise<unknown>
      onCancel: () => void
    }
  | {
      mode: 'edit'
      employee: Employee
      isSelf: boolean
      departments: Department[]
      onSubmit: (input: UpdateEmployeeInput) => Promise<unknown>
      onCancel: () => void
    }

const ROLE_OPTIONS = [
  { value: String(ROLE_IDS.EMPLOYEE), label: 'Employee' },
  { value: String(ROLE_IDS.HR_ADMIN), label: 'HR admin' },
]

const FIELD_BY_WORD: Record<string, FieldPath<EmployeeFormValues>> = {
  employeecode: 'employeeCode',
  fullname: 'fullName',
  email: 'email',
  password: 'password',
  roleid: 'roleId',
  departmentid: 'departmentId',
  phone: 'phone',
}

function toFormValues(employee: Employee): EmployeeFormValues {
  return {
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
    email: employee.email,
    password: '',
    roleId: String(employee.roleId),
    departmentId: String(employee.departmentId),
    phone: employee.phone ?? '',
  }
}

export function EmployeeForm(props: Props) {
  const isEdit = props.mode === 'edit'
  const lockedRoleId = props.mode === 'edit' && props.isSelf ? String(props.employee.roleId) : null
  const lockRole = lockedRoleId !== null
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(isEdit ? editEmployeeSchema : createEmployeeSchema),
    defaultValues: props.mode === 'edit' ? toFormValues(props.employee) : EMPTY_EMPLOYEE_FORM,
  })

  function applyServerError(error: unknown) {
    const e = toApiError(error)
    const messages = e.serverMessages.map((m) => m.toLowerCase())

    if (e.status === 409) {
      if (messages.some((m) => m.includes('email'))) {
        setError('email', { message: 'Email already registered.' }, { shouldFocus: true })
        return
      }
      if (messages.some((m) => m.includes('code'))) {
        setError('employeeCode', { message: 'Employee code already exists.' }, { shouldFocus: true })
        return
      }
      setFormError('This email or employee code is already used.')
      return
    }

    if (e.status === 400 && messages.length > 0) {
      let first: FieldPath<EmployeeFormValues> | null = null
      for (const message of e.serverMessages) {
        const field = FIELD_BY_WORD[message.split(/\s+/)[0]?.toLowerCase() ?? '']
        if (field) {
          setError(field, { message: message.charAt(0).toUpperCase() + message.slice(1) + '.' })
          first ??= field
        }
      }
      if (first) {
        setFocus(first)
        return
      }
    }

    setFormError(friendlyMessage(error))
  }

  const submit = handleSubmit(async (values) => {
    setFormError(null)
    const phone = values.phone.trim()
    try {
      if (props.mode === 'create') {
        await props.onSubmit({
          employeeCode: values.employeeCode.trim(),
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          password: values.password,
          roleId: Number(values.roleId),
          departmentId: Number(values.departmentId),
          ...(phone ? { phone } : {}),
        })
      } else {
        const changes: UpdateEmployeeInput = {}
        if (dirtyFields.fullName) changes.fullName = values.fullName.trim()
        if (dirtyFields.email) changes.email = values.email.trim()
        if (dirtyFields.roleId && !lockRole) changes.roleId = Number(values.roleId)
        if (dirtyFields.departmentId) changes.departmentId = Number(values.departmentId)
        if (dirtyFields.phone && phone) changes.phone = phone
        await props.onSubmit(changes)
      }
    } catch (error) {
      applyServerError(error)
    }
  })

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <TextField
          label="Employee code"
          autoComplete="off"
          spellCheck={false}
          inputClassName="font-mono"
          readOnly={isEdit}
          hint={isEdit ? "Can't be changed." : 'For example EMP-014.'}
          error={errors.employeeCode?.message}
          {...register('employeeCode')}
        />
        <TextField label="Full name" autoComplete="off" error={errors.fullName?.message} {...register('fullName')} />
        <TextField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          error={errors.email?.message}
          {...register('email')}
        />
        {!isEdit && (
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters."
            error={errors.password?.message}
            {...register('password')}
          />
        )}
        {lockedRoleId !== null ? (
          <SelectField
            label="Role"
            disabled
            value={lockedRoleId}
            options={ROLE_OPTIONS}
            hint="You can't change your own role."
          />
        ) : (
          <Controller
            name="roleId"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Role"
                placeholder="Choose a role"
                options={ROLE_OPTIONS}
                error={errors.roleId?.message}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
        )}
        <Controller
          name="departmentId"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Department"
              placeholder="Choose a department"
              options={props.departments.map((d) => ({ value: String(d.id), label: d.name }))}
              error={errors.departmentId?.message}
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
        <TextField
          label="Phone"
          labelNote="optional"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      {formError && (
        <p role="alert" className="rounded-control bg-danger-soft px-4 py-3 text-base text-danger">
          {formError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={props.onCancel} disabled={isSubmitting} className="max-sm:w-full">
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting} loadingLabel="Saving" className="max-sm:w-full">
          Save employee
        </Button>
      </div>
    </form>
  )
}
