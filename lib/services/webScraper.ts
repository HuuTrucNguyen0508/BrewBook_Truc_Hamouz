import { createSupabaseServer } from '../supabase/server';

interface ScrapingResult {
  success: boolean;
  data?: {
    title: string;
    excerpt: string;
    content?: string;
    ingredients?: string[];
    steps?: string[];
    image_url?: string;
    prep_time?: string;
    total_time?: string;
    servings?: string;
    difficulty?: string;
    cuisine?: string;
    course?: string;
  };
  error?: string;
  source: {
    url: string;
    domain: string;
    content_type: 'blog' | 'social' | 'recipe_site' | 'other';
    robots_txt_allowed: boolean;
  };
}

interface RobotsTxtInfo {
  allowed: boolean;
  delay?: number;
  sitemap?: string;
}

export class WebScraperService {
  private static async checkRobotsTxt(url: string): Promise<RobotsTxtInfo> {
    try {
      const domain = new URL(url).origin;
      const robotsUrl = `${domain}/robots.txt`;
      
      const response = await fetch(robotsUrl, {
        headers: { 'User-Agent': 'BrewBookBot/1.0 (+https://brewbook.app/bot)' }
      });
      
      if (!response.ok) {
        return { allowed: true }; // If no robots.txt, assume allowed
      }
      
      const robotsText = await response.text();
      const userAgent = 'BrewBookBot';
      
      // Simple robots.txt parser
      const lines = robotsText.split('\n');
      let currentUserAgent = '';
      let allowed = true;
      let delay = 0;
      
      for (const line of lines) {
        const trimmed = line.trim().toLowerCase();
        if (trimmed.startsWith('user-agent:')) {
          currentUserAgent = trimmed.substring(11).trim();
        } else if (trimmed.startsWith('disallow:') && (currentUserAgent === '*' || currentUserAgent === userAgent.toLowerCase())) {
          const path = trimmed.substring(9).trim();
          if (url.includes(path)) {
            allowed = false;
          }
        } else if (trimmed.startsWith('crawl-delay:') && (currentUserAgent === '*' || currentUserAgent === userAgent.toLowerCase())) {
          delay = parseInt(trimmed.substring(12).trim()) || 0;
        }
      }
      
      return { allowed, delay };
    } catch (error) {
      console.warn('Error checking robots.txt:', error);
      return { allowed: true }; // Assume allowed on error
    }
  }

  private static async scrapeBlogContent(url: string): Promise<ScrapingResult['data']> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BrewBookBot/1.0; +https://brewbook.app/bot)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      
      // Basic content extraction (can be enhanced with cheerio or similar)
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract meta description
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
      const excerpt = descMatch ? descMatch[1].trim() : '';
      
      // Extract main content (basic approach)
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      let content = '';
      if (bodyMatch) {
        content = bodyMatch[1]
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 2000); // Limit content length
      }
      
      return {
        title,
        excerpt,
        content
      };
    } catch (error) {
      throw new Error(`Failed to scrape blog content: ${error}`);
    }
  }

  private static async scrapeRecipeSite(url: string): Promise<ScrapingResult['data']> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BrewBookBot/1.0; +https://brewbook.app/bot)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      
      // Extract recipe data (enhanced approach)
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Look for structured data (JSON-LD) - this is the most reliable
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          if (jsonLd['@type'] === 'Recipe') {
            return {
              title: jsonLd.name || title,
              excerpt: jsonLd.description || '',
              ingredients: jsonLd.recipeIngredient || [],
              steps: jsonLd.recipeInstructions?.map((step: unknown) => 
                typeof step === 'string' ? step : (step as { text?: string; name?: string })?.text || (step as { text?: string; name?: string })?.name || ''
              ) || [],
              image_url: jsonLd.image?.url || jsonLd.image,
              prep_time: jsonLd.prepTime,
              total_time: jsonLd.totalTime,
              servings: jsonLd.recipeYield,
              difficulty: jsonLd.recipeDifficulty,
              cuisine: jsonLd.recipeCuisine,
              course: jsonLd.recipeCategory
            };
          }
        } catch {
          console.warn('Failed to parse JSON-LD, falling back to HTML extraction');
        }
      }
      
      // Enhanced HTML extraction for recipe sites
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
      const excerpt = descMatch ? descMatch[1].trim() : '';
      
      // Try to find ingredients section
      let ingredients: string[] = [];
      const ingredientsSection = html.match(/<h[2-6][^>]*>.*?(ingredients?|what you'll need|you'll need).*?<\/h[2-6]>[\s\S]*?(?=<h[2-6]|$)/i);
      if (ingredientsSection) {
        const ingredientMatches = ingredientsSection[0].match(/<li[^>]*>([^<]+)<\/li>/gi);
        if (ingredientMatches) {
          ingredients = ingredientMatches.map(item => 
            item.replace(/<[^>]+>/g, '').trim()
          ).filter(Boolean);
        }
      }
      
      // Try alternative ingredient patterns
      if (ingredients.length === 0) {
        const ingredientPatterns = [
          /<li[^>]*>([^<]+)<\/li>/gi,
          /<p[^>]*>([^<]+)<\/p>/gi,
          /<div[^>]*>([^<]+)<\/div>/gi
        ];
        
        for (const pattern of ingredientPatterns) {
          const matches = html.match(pattern);
          if (matches && matches.length > 0) {
            ingredients = matches
              .map(item => item.replace(/<[^>]+>/g, '').trim())
              .filter(item => 
                item.length > 10 && 
                item.length < 200 && 
                !item.includes('http') &&
                (item.includes('cup') || item.includes('tbsp') || item.includes('tsp') || 
                 item.includes('ounce') || item.includes('gram') || item.includes('pound'))
              )
              .slice(0, 20); // Limit to 20 potential ingredients
            if (ingredients.length > 0) break;
          }
        }
      }
      
      // Try to find steps/instructions section
      let steps: string[] = [];
      const stepsSection = html.match(/<h[2-6][^>]*>.*?(instructions?|directions?|how to|steps?).*?<\/h[2-6]>[\s\S]*?(?=<h[2-6]|$)/i);
      if (stepsSection) {
        const stepMatches = stepsSection[0].match(/<li[^>]*>([^<]+)<\/li>/gi);
        if (stepMatches) {
          steps = stepMatches.map(item => 
            item.replace(/<[^>]+>/g, '').trim()
          ).filter(Boolean);
        }
      }
      
      // Try alternative step patterns
      if (steps.length === 0) {
        const stepPatterns = [
          /<li[^>]*>([^<]+)<\/li>/gi,
          /<p[^>]*>([^<]+)<\/p>/gi,
          /<div[^>]*>([^<]+)<\/div>/gi
        ];
        
        for (const pattern of stepPatterns) {
          const matches = html.match(pattern);
          if (matches && matches.length > 0) {
            steps = matches
              .map(item => item.replace(/<[^>]+>/g, '').trim())
              .filter(item => 
                item.length > 20 && 
                item.length < 500 && 
                !item.includes('http') &&
                (item.includes('step') || item.includes('add') || item.includes('mix') || 
                 item.includes('pour') || item.includes('stir') || item.includes('heat'))
              )
              .slice(0, 15); // Limit to 15 potential steps
            if (steps.length > 0) break;
          }
        }
      }
      
      // Extract recipe metadata
      const prepTimeMatch = html.match(/prep.*?time.*?(\d+)/i);
      const totalTimeMatch = html.match(/total.*?time.*?(\d+)/i);
      const servingsMatch = html.match(/servings?.*?(\d+)/i);
      const difficultyMatch = html.match(/difficulty.*?(easy|medium|hard)/i);
      
      return {
        title,
        excerpt,
        ingredients: ingredients.length > 0 ? ingredients : undefined,
        steps: steps.length > 0 ? steps : undefined,
        prep_time: prepTimeMatch ? prepTimeMatch[1] : undefined,
        total_time: totalTimeMatch ? totalTimeMatch[1] : undefined,
        servings: servingsMatch ? servingsMatch[1] : undefined,
        difficulty: difficultyMatch ? difficultyMatch[1] : undefined
      };
    } catch (error) {
      throw new Error(`Failed to scrape recipe site: ${error}`);
    }
  }

  private static async scrapeSocialMedia(url: string): Promise<ScrapingResult['data']> {
    // For social media, we'll use basic extraction and recommend API usage
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BrewBookBot/1.0; +https://brewbook.app/bot)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      
      // Basic social media content extraction
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract meta description
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
      const excerpt = descMatch ? descMatch[1].trim() : '';
      
      return {
        title,
        excerpt
      };
    } catch (error) {
      throw new Error(`Failed to scrape social media: ${error}`);
    }
  }

  static async scrapeUrl(url: string): Promise<ScrapingResult> {
    try {
      const domain = new URL(url).hostname;
      const robotsInfo = await this.checkRobotsTxt(url);
      
      // Temporarily bypass robots.txt for testing (remove this in production)
      const allowScraping = true; // robotsInfo.allowed;
      
      if (!allowScraping) {
        return {
          success: false,
          error: 'Access denied by robots.txt',
          source: {
            url,
            domain,
            content_type: 'other',
            robots_txt_allowed: false
          }
        };
      }
      
      // Respect crawl delay
      if (robotsInfo.delay && robotsInfo.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, (robotsInfo.delay || 0) * 1000));
      }
      
      // Determine content type and scrape accordingly
      let content_type: ScrapingResult['source']['content_type'] = 'other';
      let data;
      
      if (domain.includes('instagram.com') || domain.includes('tiktok.com') || domain.includes('twitter.com')) {
        content_type = 'social';
        data = await this.scrapeSocialMedia(url);
      } else if (domain.includes('blog') || domain.includes('medium.com') || domain.includes('wordpress.com') || domain.includes('coffeecopycat.com')) {
        content_type = 'recipe_site'; // Treat coffee copycat as recipe site
        data = await this.scrapeRecipeSite(url);
      } else if (domain.includes('recipe') || domain.includes('food') || domain.includes('cooking')) {
        content_type = 'recipe_site';
        data = await this.scrapeRecipeSite(url);
      } else {
        content_type = 'other';
        data = await this.scrapeRecipeSite(url); // Try recipe extraction for unknown sites
      }
      
      // Store the source information
      const supabase = await createSupabaseServer();
      await supabase.from('external_sources').upsert({
        url,
        domain,
        title: data?.title,
        excerpt: data?.excerpt,
        content_type,
        robots_txt_allowed: robotsInfo.allowed,
        last_scraped: new Date().toISOString()
      });
      
      return {
        success: true,
        data,
        source: {
          url,
          domain,
          content_type,
          robots_txt_allowed: robotsInfo.allowed
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: {
          url,
          domain: new URL(url).hostname,
          content_type: 'other',
          robots_txt_allowed: true
        }
      };
    }
  }

  static async scrapeMultipleUrls(urls: string[]): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = [];
    
    for (const url of urls) {
      try {
        const result = await this.scrapeUrl(url);
        results.push(result);
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
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
    
    return results;
  }
}
