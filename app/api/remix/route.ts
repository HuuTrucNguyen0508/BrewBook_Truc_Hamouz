import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/services/openaiService';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId } = body;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Check authentication
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the original recipe
    const { data: originalRecipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (recipeError || !originalRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Generate remixed recipes using RAG
    const remixedRecipes = await OpenAIService.remixRecipe(originalRecipe);

    // Store remixed recipes in database
    const storedRecipes = [];
    for (const recipe of remixedRecipes) {
      const { data: storedRecipe, error: storeError } = await supabase
        .from('recipes')
        .insert({
          title: recipe.title,
          description: recipe.description,
          tags: recipe.tags || [],
          type: recipe.type,
          temperature: recipe.temperature,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          difficulty: recipe.difficulty,
          prep_time_minutes: recipe.prep_time_minutes,
          total_time_minutes: recipe.total_time_minutes,
          servings: recipe.servings,
          equipment: recipe.equipment || [],
          seasonal_tags: recipe.seasonal_tags || [],
          flavor_profile: recipe.flavor_profile || [],
          author_id: user.id
        })
        .select()
        .single();

      if (!storeError && storedRecipe) {
        // Generate and store embedding for the remixed recipe
        await OpenAIService.generateAndStoreRecipeEmbedding(storedRecipe.id);
        storedRecipes.push(storedRecipe);
      }
    }

    return NextResponse.json({
      success: true,
      originalRecipe,
      remixedRecipes: storedRecipes,
      count: storedRecipes.length
    });

  } catch (error) {
    console.error('Error in remix endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to remix recipe' },
      { status: 500 }
    );
  }
}
