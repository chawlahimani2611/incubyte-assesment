import { z } from 'zod';

/**
 * Shared Client-Side Employee Validation Schema
 *
 * Utilizes Zod to enforce strict boundary conditions on inputs prior to API transmission.
 * Provides localized user-friendly error copy matching backend validations cleanly.
 */
export const employeeSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  email: z.string().trim().email('Invalid email address format').optional().or(z.literal('')),
  jobTitle: z.string().trim().min(1, 'Job title/role is required'),
  department: z.string().trim().min(1, 'Department is required'),
  country: z.string().trim().min(1, 'Country selection is required'),
  salary: z.coerce
    .number({ invalid_type_error: 'Salary must be a valid number' })
    .positive('Salary must be greater than zero'),
  hireDate: z.string().min(1, 'Hire date is required'),
});
