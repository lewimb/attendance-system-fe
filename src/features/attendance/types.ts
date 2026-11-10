import type { YMD } from '@/shared/lib/dates'

export type AttendanceStatus = 'PRESENT' | 'LATE'

export interface Attendance {
  id: string
  employeeId: string
  workDate: YMD
  checkInAt: string
  checkOutAt: string | null
  status: AttendanceStatus
  createdAt: string
  updatedAt: string
}

export interface HrAttendance extends Attendance {
  employee: {
    id: string
    employeeCode: string
    fullName: string
    departmentId: number | null
    departmentName: string | null
  } | null
}

export interface DateRange {
  from: YMD
  to: YMD
}

export interface MyAttendanceParams extends DateRange {
  page: number
  limit: number
}

export interface AllAttendanceParams extends DateRange {
  page: number
  limit: number
  status?: AttendanceStatus
  departmentId?: number
  employeeId?: string
}
