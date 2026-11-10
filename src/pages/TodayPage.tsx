import { AttendanceActionCard } from '@/features/attendance'
import { useCurrentUser } from '@/features/auth'
import { businessToday, formatLongDate, greeting } from '@/shared/lib/dates'
import { firstName } from '@/shared/lib/format'

export function TodayPage() {
  const user = useCurrentUser()
  return (
    <div className="mx-auto flex w-full max-w-140 flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-base text-muted">{formatLongDate(businessToday())}</p>
        <h1 className="text-2xl font-semibold lg:text-3xl">
          {greeting()}, {firstName(user.fullName)}
        </h1>
      </header>
      <AttendanceActionCard />
    </div>
  )
}
