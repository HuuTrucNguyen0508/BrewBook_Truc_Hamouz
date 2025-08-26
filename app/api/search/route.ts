import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/services/openaiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 10, type, temperature } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a string' },
        { status: 400 }
      );
    }

    // Search for similar recipes using vector similarity
    const similarRecipes = await OpenAIService.searchSimilarRecipes(
      query,
      limit,
      type,
      temperature
    );

    return NextResponse.json({
      success: true,
      query,
      results: similarRecipes,
      count: similarRecipes.length
    });

  } catch (error) {
    console.error('Error in search endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    );
  }
}
