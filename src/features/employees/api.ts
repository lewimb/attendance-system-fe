import { http } from '@/shared/api/client'
import type { Paginated } from '@/shared/api/types'
import type { Department, Employee, EmployeeWithRole } from '@/shared/types'
import type { CreateEmployeeInput, EmployeeListParams, UpdateEmployeeInput } from './types'

export function listEmployees(params: EmployeeListParams, signal?: AbortSignal): Promise<Paginated<EmployeeWithRole>> {
  return http.get<Paginated<EmployeeWithRole>>('/employees', { params, signal })
}

export function getEmployee(id: string, signal?: AbortSignal): Promise<Employee> {
  return http.get<Employee>(`/employees/${encodeURIComponent(id)}`, { signal })
}

export function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  return http.post<Employee>('/employees', input)
}

export function updateEmployee(id: string, input: UpdateEmployeeInput): Promise<Employee> {
  return http.patch<Employee>(`/employees/${encodeURIComponent(id)}`, input)
}

export async function deactivateEmployee(id: string): Promise<void> {
  await http.patch<unknown>(`/employees/${encodeURIComponent(id)}/deactivate`)
}

export function listDepartments(signal?: AbortSignal): Promise<Department[]> {
  return http.get<Department[]>('/departments', { signal })
}
