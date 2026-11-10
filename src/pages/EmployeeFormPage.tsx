import { Link, useNavigate, useParams } from 'react-router'
import { ChevronLeft, UserX } from 'lucide-react'
import { useCurrentUser } from '@/features/auth'
import { EmployeeForm, EmployeeStatusBadge, useCreateEmployee, useDepartments, useEmployee, useUpdateEmployee } from '@/features/employees'
import { ApiError } from '@/shared/api/errors'
import { ButtonLink } from '@/shared/components/Button'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState, ErrorState, Skeleton } from '@/shared/components/States'
import { useToast } from '@/shared/components/toast-context'

export function EmployeeFormPage() {
  const { id } = useParams()
  return id ? <EditEmployee id={id} /> : <CreateEmployee />
}

function BackLink() {
  return (
    <Link
      to="/hr/employees"
      className="-ml-1 inline-flex h-11 items-center gap-1 self-start rounded-control px-1 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink"
    >
      <ChevronLeft size={18} aria-hidden="true" />
      Employees
    </Link>
  )
}

function FormCard({ children }: { children: React.ReactNode }) {
  return <div className="glass max-w-200 rounded-card p-5 sm:p-8">{children}</div>
}

function CreateEmployee() {
  const navigate = useNavigate()
  const toast = useToast()
  const departments = useDepartments()
  const create = useCreateEmployee()
  const back = () => navigate('/hr/employees')

  return (
    <div className="flex flex-col">
      <BackLink />
      <PageHeader title="Add employee" description="They log in with this email and password. Share the password with them directly." />
      <FormCard>
        {departments.isPending ? (
          <FormSkeleton />
        ) : departments.isError ? (
          <ErrorState error={departments.error} title="Couldn't load the departments" onRetry={() => void departments.refetch()} retrying={departments.isFetching} />
        ) : (
          <EmployeeForm
            mode="create"
            departments={departments.data}
            onCancel={back}
            onSubmit={async (input) => {
              const created = await create.mutateAsync(input)
              toast.success(`${created?.fullName ?? input.fullName} is added.`)
              back()
            }}
          />
        )}
      </FormCard>
    </div>
  )
}

function EditEmployee({ id }: { id: string }) {
  const navigate = useNavigate()
  const toast = useToast()
  const user = useCurrentUser()
  const departments = useDepartments()
  const employee = useEmployee(id)
  const update = useUpdateEmployee(id)
  const back = () => navigate('/hr/employees')

  const notFound = employee.error instanceof ApiError && employee.error.status === 404
  const name = employee.data?.fullName

  return (
    <div className="flex flex-col">
      <BackLink />
      <PageHeader
        title={name ? `Edit ${name}` : 'Edit employee'}
        description={
          employee.data ? (
            <span className="flex items-center gap-2">
              <span className="font-mono text-sm">{employee.data.employeeCode}</span>
              <EmployeeStatusBadge active={employee.data.isActive} />
            </span>
          ) : undefined
        }
      />
      <FormCard>
        {notFound ? (
          <EmptyState
            icon={<UserX size={22} />}
            title="Employee not found"
            body="This employee may have been removed."
            action={<ButtonLink to="/hr/employees">Go to Employees</ButtonLink>}
          />
        ) : employee.isPending || departments.isPending ? (
          <FormSkeleton />
        ) : employee.isError || departments.isError ? (
          <ErrorState
            error={employee.error ?? departments.error}
            title="Couldn't load this employee"
            onRetry={() => {
              void employee.refetch()
              void departments.refetch()
            }}
            retrying={employee.isFetching || departments.isFetching}
          />
        ) : (
          <EmployeeForm
            mode="edit"
            employee={employee.data}
            isSelf={employee.data.id === user.id}
            departments={departments.data}
            onCancel={back}
            onSubmit={async (changes) => {
              if (Object.keys(changes).length === 0) {
                back()
                return
              }
              await update.mutateAsync(changes)
              toast.success(`Changes to ${employee.data.fullName} are saved.`)
              back()
            }}
          />
        )}
      </FormCard>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2" aria-busy="true">
      <span className="sr-only" role="status">
        Loading
      </span>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  )
}
