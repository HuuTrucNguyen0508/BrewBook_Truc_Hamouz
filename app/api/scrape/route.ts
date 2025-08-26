import { NextRequest, NextResponse } from 'next/server';
import { WebScraperService } from '@/lib/services/webScraper';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SCRAPE API START ===');
    
    const body = await request.json();
    const { urls } = body;
    
    console.log('Received URLs:', urls);

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      console.log('Invalid URLs input');
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Check authentication - try bearer token first, then fallback to session
    console.log('Checking authentication...');
    const authHeader = request.headers.get('authorization');
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    
    console.log('Bearer token available:', !!bearer);
    
    const supabase = await createSupabaseServer();
    let user = null;
    let authError = null;
    
    if (bearer) {
      // Try to get user from bearer token
      const { data, error } = await supabase.auth.getUser(bearer);
      user = data?.user ?? null;
      authError = error ?? null;
      console.log('Bearer auth result:', { user: !!user, error: !!authError });
    } else {
      // Fallback to session-based auth
      const { data, error } = await supabase.auth.getUser();
      user = data?.user ?? null;
      authError = error ?? null;
      console.log('Session auth result:', { user: !!user, error: !!authError });
    }
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log('User authenticated:', user.id);

    // Scrape the URLs
    console.log('Starting web scraping...');
    const scrapingResults = await WebScraperService.scrapeMultipleUrls(urls);
    
    console.log('Scraping completed. Results:', scrapingResults.length);
    console.log('Successful scrapes:', scrapingResults.filter(r => r.success).length);
    console.log('Failed scrapes:', scrapingResults.filter(r => !r.success).length);
    
    // Save successful scrapes to database
    const savedRecipes = [];
    for (const result of scrapingResults) {
      if (result.success && result.data) {
        try {
          console.log('Saving recipe:', result.data.title);
          
          // Save to recipes table
          const { data: recipe, error: recipeError } = await supabase
            .from('recipes')
            .insert({
              title: result.data.title,
              description: result.data.excerpt || '',
              ingredients: result.data.ingredients || [],
              steps: result.data.steps || [],
              type: 'coffee', // Default type
              temperature: 'iced', // Default temperature based on recipe name
              author_id: user.id
            })
            .select()
            .single();
          
          if (recipeError) {
            console.error('Error saving recipe:', recipeError);
            result.error = `Failed to save recipe: ${recipeError.message}`;
            result.success = false;
          } else {
            console.log('Recipe saved with ID:', recipe.id);
            
            // TODO: Save to external_sources table when it's created
            console.log('External source tracking will be added when external_sources table is created');
            
            // TODO: Generate embedding for the recipe when recipe_embeddings table is available
            console.log('Recipe saved successfully. Embedding generation will be added when RAG system is fully implemented.');
            
            savedRecipes.push({
              id: recipe.id,
              title: recipe.title,
              url: result.source.url
            });
          }
        } catch (saveError) {
          console.error('Error in save process:', saveError);
          result.error = `Failed to save recipe: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`;
          result.success = false;
        }
      }
    }
    
    // Log any errors
    scrapingResults.forEach((result, index) => {
      if (!result.success) {
        console.log(`URL ${index + 1} failed:`, result.error);
      }
    });
    
    return NextResponse.json({
      success: true,
      scraped: scrapingResults.length,
      successful: scrapingResults.filter(r => r.success).length,
      saved: savedRecipes.length,
      results: scrapingResults,
      savedRecipes
    });

  } catch (error) {
    console.error('=== SCRAPE API ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', error);
    
    return NextResponse.json(
      { error: 'Failed to scrape URLs' },
      { status: 500 }
    );
  }
}
