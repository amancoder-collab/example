import { z } from "zod";

/**
 * Login DTO schema with detailed error messages
 */
export const loginDtoSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Email format is invalid"),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(6, "Password must be at least 6 characters")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(/[a-zA-Z]/, "Password must contain at least 1 letter"),
});

export type LoginDto = z.infer<typeof loginDtoSchema>;

/**
 * Register DTO schema with name field and detailed error messages
 */
export const registerDtoSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Email format is invalid"),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(6, "Password must be at least 6 characters")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(/[a-zA-Z]/, "Password must contain at least 1 letter"),
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(2, "Name must be at least 2 characters")
    .optional(),
});

export type RegisterDto = z.infer<typeof registerDtoSchema>;

/**
 * Update profile DTO schema with detailed error messages
 */
export const updateProfileDtoSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Name must be a string",
    })
    .min(2, "Name must be at least 2 characters")
    .optional(),
  address: z
    .string({
      invalid_type_error: "Address must be a string",
    })
    .optional(),
  phone: z
    .string({
      invalid_type_error: "Phone must be a string",
    })
    .regex(
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      "Phone number format is invalid"
    )
    .optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileDtoSchema>;
