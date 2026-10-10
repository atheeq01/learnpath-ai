
import { z } from "zod";

export const registerSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Name must contain at least 2 characters.")
            .max(80, "Name is too long."),

        username: z
            .string()
            .trim()
            .toLowerCase()
            .min(3, "Username must contain at least 3 characters.")
            .max(30, "Username is too long.")
            .regex(
                /^[a-z0-9_]+$/,
                "Username can contain only letters, numbers and underscores."
            ),

        email: z
            .email("Invalid email address")
            .trim()
            .toLowerCase(),

        password: z
            .string()
            .min(8, "Password must contain at least 8 characters.")
            .max(128, "Password is too long."),

        role: z.enum(["student", "instructor"]),
    })
    .strict();


export const loginSchema = z
  .object({
    identifier: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username or email must contain at least 3 characters")
      .max(100, "Username or email is too long"),

    password: z
      .string()
      .min(1, "Password is required")
      .max(128, "Password is too long"),
  })
  .strict();