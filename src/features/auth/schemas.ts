import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email address.').pipe(z.email('Enter an email address with an @.')),
  password: z.string().min(1, 'Enter your password.'),
})

export type LoginValues = z.infer<typeof loginSchema>
