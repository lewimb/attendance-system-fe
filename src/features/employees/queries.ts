import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import type { EmployeeListParams, UpdateEmployeeInput } from './types'

export const employeeKeys = {
  all: ['employees'] as const,
  list: (params: EmployeeListParams) => ['employees', 'list', params] as const,
  detail: (id: string) => ['employees', 'detail', id] as const,
  search: ['employees', 'search'] as const,
  departments: ['departments'] as const,
}

export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: ({ signal }) => api.listEmployees(params, signal),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ''),
    queryFn: ({ signal }) => api.getEmployee(id!, signal),
    enabled: !!id,
  })
}

export function useDepartments() {
  return useQuery({
    queryKey: employeeKeys.departments,
    queryFn: ({ signal }) => api.listDepartments(signal),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  })
}

export const EMPLOYEE_SEARCH_KEY = employeeKeys.search

export async function searchEmployeeOptions(query: string, signal?: AbortSignal) {
  const page = await api.listEmployees(
    { page: 1, limit: 10, sortBy: 'fullName', order: 'asc', search: query },
    signal,
  )
  return page.items.map((e) => ({ value: e.id, label: e.fullName, description: e.employeeCode }))
}

function useInvalidateEmployees() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: employeeKeys.all })
}

export function useCreateEmployee() {
  const invalidate = useInvalidateEmployees()
  return useMutation({ mutationFn: api.createEmployee, onSuccess: invalidate })
}

export function useUpdateEmployee(id: string) {
  const invalidate = useInvalidateEmployees()
  return useMutation({ mutationFn: (input: UpdateEmployeeInput) => api.updateEmployee(id, input), onSuccess: invalidate })
}

export function useDeactivateEmployee() {
  const invalidate = useInvalidateEmployees()
  return useMutation({ mutationFn: api.deactivateEmployee, onSuccess: invalidate })
}
