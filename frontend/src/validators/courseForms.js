import { z } from "zod";

export const courseFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Use at least 3 characters for the title.")
      .max(120, "Keep the title within 120 characters."),
    description: z
      .string()
      .trim()
      .min(10, "Describe your course in at least 10 characters.")
      .max(1500, "Keep the description within 1,500 characters."),
    content: z
      .string()
      .trim()
      .min(10, "Add at least 10 characters of course content.")
      .max(10000, "Keep the content within 10,000 characters."),
    category: z
      .string()
      .trim()
      .min(2, "Enter a category with at least 2 characters.")
      .max(60, "Keep the category within 60 characters."),
    level: z.enum(["beginner", "intermediate", "advanced"]),
  })
  .strict();
