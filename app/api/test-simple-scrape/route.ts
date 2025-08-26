import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    const results = [];
    
    for (const url of urls) {
      try {
        console.log('Scraping URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BrewBookBot/1.0; +https://brewbook.app/bot)'
          }
        });
        
        if (!response.ok) {
          results.push({
            success: false,
            error: `HTTP ${response.status}`,
            source: {
              url,
              domain: new URL(url).hostname,
              content_type: 'other',
              robots_txt_allowed: true
            }
          });
          continue;
        }
        
        const html = await response.text();
        
        // Simple extraction
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';
        
        const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
        const excerpt = descMatch ? descMatch[1].trim() : '';
        
        // Very basic ingredient/step detection
        const hasIngredients = html.toLowerCase().includes('ingredient') || html.toLowerCase().includes('cup') || html.toLowerCase().includes('tbsp');
        const hasSteps = html.toLowerCase().includes('step') || html.toLowerCase().includes('instruction') || html.toLowerCase().includes('simmer');
        
        results.push({
          success: true,
          data: {
            title,
            excerpt,
            ingredients: hasIngredients ? ['Sample ingredient 1', 'Sample ingredient 2'] : [],
            steps: hasSteps ? ['Sample step 1', 'Sample step 2'] : [],
            image_url: null,
            prep_time: null,
            total_time: null,
            servings: null,
            difficulty: null,
            cuisine: null,
            course: null
          },
          source: {
            url,
            domain: new URL(url).hostname,
            content_type: 'recipe_site',
            robots_txt_allowed: true
          }
        });
        
      } catch (error) {
        console.error('Error scraping URL:', url, error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          source: {
            url,
            domain: new URL(url).hostname,
            content_type: 'other',
            robots_txt_allowed: true
          }
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      scraped: results.length,
      successful: results.filter(r => r.success).length,
      results
    });

  } catch (error) {
    console.error('Error in test-simple-scrape:', error);
    return NextResponse.json(
      { error: 'Failed to scrape URLs' },
      { status: 500 }
    );
  }
}
