import { z } from "zod";

export const recipeSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["coffee", "matcha", "ube", "tea"]),
  temperature: z.enum(["hot", "iced"]),
  ingredients: z.array(z.string().min(1, "Ingredient cannot be empty")).min(1, "At least one ingredient is required"),
  steps: z.array(z.string().min(1, "Step cannot be empty")).min(1, "At least one step is required"),
  tags: z.array(z.string()).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  video_url: z.string().url().optional().or(z.literal("")),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;
