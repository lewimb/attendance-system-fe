import type { ReactNode } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { CloudOff, FileQuestionMark, RefreshCw, ShieldX, TriangleExclamationPoint } from 'lucide-react'
import { friendlyMessage } from '@/shared/api/errors'
import { Button, ButtonLink } from '@/shared/components/Button'
import { PRODUCT_NAME } from '@/shared/lib/constants'

function StatusPage({
  icon,
  code,
  title,
  body,
  action,
  standalone,
}: {
  icon: ReactNode
  code?: string
  title: string
  body: ReactNode
  action: ReactNode
  standalone?: boolean
}) {
  const content = (
    <div className="flex max-w-md flex-col items-center gap-5 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-neutral-soft text-muted" aria-hidden="true">
        {icon}
      </span>
      <div className="flex flex-col gap-2">
        {code && <p className="font-mono text-label text-muted">{code}</p>}
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-base text-muted">{body}</p>
      </div>
      <div className="pt-1">{action}</div>
    </div>
  )

  if (!standalone) return <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">{content}</div>
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 px-4 py-12">
      <p className="text-lg font-semibold">{PRODUCT_NAME}</p>
      {content}
    </main>
  )
}

const toToday = (
  <ButtonLink to="/today" variant="primary">
    Go to Today
  </ButtonLink>
)

export function ForbiddenPage() {
  return (
    <StatusPage
      icon={<ShieldX size={26} />}
      code="403"
      title="You don't have access to this page"
      body="This page is for HR admins. If you think you need access, ask your HR team."
      action={toToday}
    />
  )
}

export function NotFoundPage() {
  return (
    <StatusPage
      icon={<FileQuestionMark size={26} />}
      code="404"
      title="Page not found"
      body="The address may be mistyped, or the page has moved."
      action={toToday}
    />
  )
}

export function RouteErrorPage() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <StatusPage
        standalone
        icon={<FileQuestionMark size={26} />}
        code="404"
        title="Page not found"
        body="The address may be mistyped, or the page has moved."
        action={toToday}
      />
    )
  }
  return <GenericErrorPage />
}

export function GenericErrorPage() {
  return (
    <StatusPage
      standalone
      icon={<TriangleExclamationPoint size={26} />}
      title="Something went wrong"
      body="The page ran into a problem. Reload it to try again."
      action={
        <Button variant="primary" onClick={() => window.location.reload()} icon={<RefreshCw size={18} aria-hidden="true" />}>
          Reload page
        </Button>
      }
    />
  )
}

export function ServerUnreachablePage({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <StatusPage
      standalone
      icon={<CloudOff size={26} />}
      title="Can't reach the server"
      body={friendlyMessage(error)}
      action={
        <Button variant="primary" onClick={onRetry} icon={<RefreshCw size={18} aria-hidden="true" />}>
          Retry
        </Button>
      }
    />
  )
}
