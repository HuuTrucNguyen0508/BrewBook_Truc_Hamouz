import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService, RAGGenerationRequest } from '@/lib/services/openaiService';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body: RAGGenerationRequest = await request.json();
    
    // Validate input
    if (!body.ingredients && !body.seedRecipeId && !body.style) {
      return NextResponse.json(
        { error: 'At least one of ingredients, seedRecipeId, or style must be provided' },
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

    // Generate recipes using RAG (without saving to database)
    const result = await OpenAIService.generateRecipesWithRAG({
      ...body,
      count: body.count || 3
    });

    // Return generated recipes without saving them (user will choose which to save)
    return NextResponse.json({
      success: true,
      recipes: result.recipes,
      seedRecipe: result.seedRecipe,
      similarRecipes: result.similarRecipes,
      tokensUsed: result.tokensUsed
    });

  } catch (error) {
    console.error('Error in generate endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    );
  }
}
