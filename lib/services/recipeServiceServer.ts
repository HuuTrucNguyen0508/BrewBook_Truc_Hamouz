import { createSupabaseServer } from "@/lib/supabase/server";
import { Recipe } from "@/types";
// import { recipeSchema } from "@/lib/validators";

export class RecipeServiceServer {
  // Get all recipes
  static async getAllRecipes(): Promise<Recipe[]> {
    const supabase = await createSupabaseServer();
    
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
    const supabase = await createSupabaseServer();
    
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

  // Get saved recipes for a user (server-side)
  static async getSavedRecipes(userId: string): Promise<Recipe[]> {
    const supabase = await createSupabaseServer();
    
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
}
