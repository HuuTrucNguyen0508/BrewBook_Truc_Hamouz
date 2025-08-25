import { supabase } from "@/lib/supabase/client";
import { Recipe } from "@/types";
import { recipeSchema } from "@/lib/validators";

export class RecipeService {
  // Create a new recipe
  static async createRecipe(recipeData: Omit<Recipe, 'id' | 'created_at'>): Promise<Recipe> {
    const validatedData = recipeSchema.parse(recipeData);
    
    const { data, error } = await supabase
      .from('recipes')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create recipe: ${error.message}`);
    }

    return data as Recipe;
  }

  // Get all recipes
  static async getAllRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recipes: ${error.message}`);
    }

    return data as Recipe[];
  }

  // Get recipe by ID
  static async getRecipeById(id: string): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch recipe: ${error.message}`);
    }

    return data as Recipe;
  }

  // Update recipe
  static async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update recipe: ${error.message}`);
    }

    return data as Recipe;
  }

  // Delete recipe
  static async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`);
    }
  }

  // Save recipe to favorites (client-side)
  static async saveRecipe(recipeId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_recipes')
      .insert([{ recipe_id: recipeId, user_id: userId }]);

    if (error) {
      throw new Error(`Failed to save recipe: ${error.message}`);
    }
  }

  // Remove recipe from favorites (client-side)
  static async unsaveRecipe(recipeId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to unsave recipe: ${error.message}`);
    }
  }

  // Get saved recipes for a user
  static async getSavedRecipes(userId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select(`
        recipe_id,
        recipes (*)
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch saved recipes: ${error.message}`);
    }

    const recipes = data?.map(item => item.recipes).filter(Boolean) || [];
    return recipes as unknown as Recipe[];
  }

  // Check if recipe is saved by user
  static async isRecipeSaved(recipeId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('user_id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check saved status: ${error.message}`);
    }

    return !!data;
  }
}
