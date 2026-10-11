import { z } from "zod";

// create the course 
export const createCourseSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must contain at least 3 characters")
      .max(120, "Title is too long"),

    description: z
      .string()
      .trim()
      .min(10, "Description must contain at least 10 characters")
      .max(1500, "Description is too long"),

    content: z
      .string()
      .trim()
      .min(10, "Content must contain at least 10 characters")
      .max(10000, "Content is too long"),

    category: z
      .string()
      .trim()
      .min(2, "Category must contain at least 2 characters")
      .max(60, "Category is too long"),

    level: z.enum([
      "beginner",
      "intermediate",
      "advanced",
    ]),
  })
  .strict();

// for update the course 
export const updateCourseSchema = createCourseSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required",
    }
  );