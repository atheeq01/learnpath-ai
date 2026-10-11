import { z } from "zod";

export const recommendationSchema = z
  .object({
    prompt: z
      .string()
      .trim()
      .min(10, "Prompt must contain at least 10 characters")
      .max(500, "Prompt is too long"),
  })
  .strict();