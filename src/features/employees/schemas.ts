import { z } from 'zod'

const shared = {
  fullName: z.string().trim().min(1, 'Enter the full name.').max(100, 'Use 100 characters or fewer.'),
  email: z.string().trim().min(1, 'Enter an email address.').pipe(z.email('Enter an email address with an @.')),
  roleId: z.string().min(1, 'Choose a role.'),
  departmentId: z.string().min(1, 'Choose a department.'),
  phone: z.string().trim().max(20, 'Use 20 characters or fewer.'),
}

export const createEmployeeSchema = z.object({
  ...shared,
  employeeCode: z.string().trim().min(1, 'Enter the employee code.').max(20, 'Use 20 characters or fewer.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
})

export const editEmployeeSchema = z.object({
  ...shared,
  employeeCode: z.string(),
  password: z.string(),
})

export type EmployeeFormValues = z.infer<typeof createEmployeeSchema>

export const EMPTY_EMPLOYEE_FORM: EmployeeFormValues = {
  employeeCode: '',
  fullName: '',
  email: '',
  password: '',
  roleId: '',
  departmentId: '',
  phone: '',
}
