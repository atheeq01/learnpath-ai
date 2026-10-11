import { z } from "zod";

export const aiPromptSchema = z
  .string()
  .trim()
  .min(10, "Your learning goal must contain at least 10 characters")
  .max(500, "Your learning goal must contain at most 500 characters");
