import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { OpenAIService, RecipeInput } from '@/lib/services/openaiService';

export async function POST(request: NextRequest) {
  try {
    const body: RecipeInput = await request.json();
    
    // Validate required fields
    if (!body.title || !body.ingredients || !body.steps || !body.type || !body.temperature) {
      return NextResponse.json(
        { error: 'Missing required fields: title, ingredients, steps, type, temperature' },
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

    // Create the recipe
    const { data: recipe, error: createError } = await supabase
      .from('recipes')
      .insert({
        title: body.title,
        description: body.description,
        tags: body.tags || [],
        type: body.type,
        temperature: body.temperature,
        ingredients: body.ingredients,
        steps: body.steps,
        difficulty: body.difficulty || 'medium',
        prep_time_minutes: body.prep_time_minutes,
        total_time_minutes: body.total_time_minutes,
        servings: body.servings || 1,
        equipment: body.equipment || [],
        seasonal_tags: body.seasonal_tags || [],
        flavor_profile: body.flavor_profile || [],
        author_id: user.id
      })
      .select()
      .single();

    if (createError || !recipe) {
      return NextResponse.json(
        { error: 'Failed to create recipe' },
        { status: 500 }
      );
    }

    // Generate and store embedding for the new recipe
    try {
      await OpenAIService.generateAndStoreRecipeEmbedding(recipe.id);
    } catch (embeddingError) {
      console.warn('Failed to generate embedding for recipe:', embeddingError);
      // Don't fail the request if embedding generation fails
    }

    return NextResponse.json({
      success: true,
      recipe
    });

  } catch (error) {
    console.error('Error in create endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}
