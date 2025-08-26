import { NextRequest, NextResponse } from 'next/server';
import { WebScraperService } from '@/lib/services/webScraper';

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

    // Test scraping without authentication
    const scrapingResults = await WebScraperService.scrapeMultipleUrls(urls);
    
    return NextResponse.json({
      success: true,
      scraped: scrapingResults.length,
      successful: scrapingResults.filter(r => r.success).length,
      results: scrapingResults
    });

  } catch (error) {
    console.error('Error in test-scrape endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to scrape URLs' },
      { status: 500 }
    );
  }
}
