import { z } from 'zod';

// Login DTO schema
export const loginDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[a-zA-Z]/, 'Password must contain at least 1 letter'),
});

export type LoginDto = z.infer<typeof loginDtoSchema>;

// Register DTO schema
export const registerDtoSchema = loginDtoSchema.extend({
  name: z.string().optional(),
});

export type RegisterDto = z.infer<typeof registerDtoSchema>;

// Update profile DTO schema
export const updateProfileDtoSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileDtoSchema>; 