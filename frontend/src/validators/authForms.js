import { z } from "zod";

export const loginFormSchema = z.object({
  identifier: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Enter your username or email (at least 3 characters).")
    .max(100, "Use at most 100 characters."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(128, "Use at most 128 characters."),
});

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter at least 2 characters.")
      .max(80, "Use at most 80 characters."),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Use at least 3 characters.")
      .max(30, "Use at most 30 characters.")
      .regex(/^[a-z0-9_]+$/, "Use only letters, numbers, and underscores."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Enter a valid email address.")),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128, "Use at most 128 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
    role: z.enum(["student", "instructor"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
