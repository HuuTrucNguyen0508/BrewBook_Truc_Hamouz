import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/services/openaiService';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId, style } = body;

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

    // Get the recipe data
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Generate image using DALL-E 3
    const imageUrl = await OpenAIService.generateRecipeImage(recipe, style);

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    // Update the recipe with the generated image
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ image_url: imageUrl })
      .eq('id', recipeId);

    if (updateError) {
      console.warn('Failed to update recipe with image URL:', updateError);
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      recipeId
    });

  } catch (error) {
    console.error('Error in generate-image endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
