import { http } from '@/shared/api/client'
import type { Paginated } from '@/shared/api/types'
import { API_BASE_URL } from '@/shared/lib/constants'
import type { AllAttendanceParams, Attendance, HrAttendance, MyAttendanceParams } from './types'

export function checkIn(photo: File, onProgress?: (percent: number) => void): Promise<Attendance> {
  const body = new FormData()
  body.append('photo', photo)
  return http.post<Attendance>('/attendance/check-in', body, {
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100))
    },
  })
}

export function checkOut(): Promise<Attendance> {
  return http.post<Attendance>('/attendance/check-out')
}

export function listMyAttendance(params: MyAttendanceParams, signal?: AbortSignal): Promise<Paginated<Attendance>> {
  return http.get<Paginated<Attendance>>('/attendance/me', { params, signal })
}

export function listAllAttendance(params: AllAttendanceParams, signal?: AbortSignal): Promise<Paginated<HrAttendance>> {
  return http.get<Paginated<HrAttendance>>('/attendance', { params, signal })
}

export function attendancePhotoUrl(attendanceId: string): string {
  return `${API_BASE_URL}/attendance/${encodeURIComponent(attendanceId)}/photo`
}
