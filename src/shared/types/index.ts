export type Role = 'HR_ADMIN' | 'EMPLOYEE'

export interface RoleModel {
  id: number
  roleName: Role
  createdAt: string
}

export interface Employee {
  id: string
  employeeCode: string
  fullName: string
  email: string
  roleId: number
  departmentId: number
  phone: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EmployeeWithRole extends Employee {
  role: RoleModel
}

export type AuthUser = EmployeeWithRole

export interface Department {
  id: number
  name: string
}

export const ROLE_LABELS: Record<Role, string> = {
  HR_ADMIN: 'HR admin',
  EMPLOYEE: 'Employee',
}
