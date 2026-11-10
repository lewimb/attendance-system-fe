import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { businessToday } from '@/shared/lib/dates'
import * as api from './api'
import type { AllAttendanceParams, Attendance, MyAttendanceParams } from './types'

export const attendanceKeys = {
  all: ['attendance'] as const,
  today: (date: string) => ['attendance', 'today', date] as const,
  mine: (params: MyAttendanceParams) => ['attendance', 'me', params] as const,
  list: (params: AllAttendanceParams) => ['attendance', 'list', params] as const,
}

export function useTodayAttendance() {
  const today = businessToday()
  return useQuery({
    queryKey: attendanceKeys.today(today),
    queryFn: async ({ signal }) => {
      const page = await api.listMyAttendance({ from: today, to: today, page: 1, limit: 1 }, signal)
      return page.items[0] ?? null
    },
  })
}

export function useMyAttendance(params: MyAttendanceParams) {
  return useQuery({
    queryKey: attendanceKeys.mine(params),
    queryFn: ({ signal }) => api.listMyAttendance(params, signal),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

export function useAllAttendance(params: AllAttendanceParams) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: ({ signal }) => api.listAllAttendance(params, signal),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

function useStoreToday() {
  const queryClient = useQueryClient()
  return (record: Attendance) => {
    queryClient.setQueryData(attendanceKeys.today(record.workDate), record)
    void queryClient.invalidateQueries({
      queryKey: attendanceKeys.all,
      predicate: (query) => query.queryKey[1] !== 'today',
    })
  }
}

export function useCheckIn() {
  const storeToday = useStoreToday()
  const [progress, setProgress] = useState<number | null>(null)
  const mutation = useMutation({
    mutationFn: (photo: File) => api.checkIn(photo, setProgress),
    onSuccess: storeToday,
    onSettled: () => setProgress(null),
  })
  return { ...mutation, progress }
}

export function useCheckOut() {
  const storeToday = useStoreToday()
  return useMutation({ mutationFn: api.checkOut, onSuccess: storeToday })
}

export function useRefreshToday() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['attendance', 'today'] })
}
