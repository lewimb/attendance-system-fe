export type EmployeeSortField = 'id' | 'employeeCode' | 'fullName' | 'email' | 'createdAt'

export interface EmployeeListParams {
  page: number
  limit: number
  sortBy?: EmployeeSortField
  order?: 'asc' | 'desc'
  isActive?: boolean
  departmentId?: number
  search?: string
}

export interface CreateEmployeeInput {
  employeeCode: string
  fullName: string
  email: string
  password: string
  roleId: number
  departmentId: number
  phone?: string
}

export type UpdateEmployeeInput = Partial<Pick<CreateEmployeeInput, 'fullName' | 'email' | 'roleId' | 'departmentId' | 'phone'>>
