import { z } from "zod";

export const loginFormSchema = z.object({
  identifier: z.string().trim().toLowerCase().min(3),
  password: z.string().min(1, "Password is required"),
});

export const registerFormSchema = z
  .object({
    name: z.string().trim().min(2).max(80),

    username: z.string()
      .trim()
      .toLowerCase()
      .min(3)
      .max(30)
      .regex(/^[a-z0-9_]+$/, "Invalid username"),

    email: z.string()
      .trim()
      .toLowerCase()
      .pipe(z.email()),

    password: z.string().min(8).max(128),

    confirmPassword: z.string().min(1),

    role: z.enum(["student", "instructor"]),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );