# AI Agent for BrewBook

A vertical AI agent that ingests coffee/matcha/ube recipes from web sources, stores them in Supabase, and generates new recipes using Retrieval-Augmented Generation (RAG).

## Features

### 🕷️ Web Scraping with Ethics
- **Robots.txt Compliance**: Automatically checks and respects robots.txt files
- **Content Type Detection**: Identifies blogs, social media, and recipe sites
- **Attribution Storage**: Stores source URLs and metadata for all scraped content
- **Rate Limiting**: Respects crawl delays and implements polite scraping practices
- **Legal Compliance**: Only scrapes publicly accessible content with proper attribution

### 🧠 RAG Recipe Generation
- **Vector Search**: Uses OpenAI's text-embedding-3-large for semantic similarity
- **Context-Aware Generation**: Leverages existing recipes to generate new variations
- **Multi-Modal Input**: Accepts ingredients, style preferences, and seed recipes
- **Quality Control**: Generates recipes with precise measurements and clear steps

### 🎨 AI-Powered Features
- **Recipe Remixing**: Create variations of existing recipes
- **Drink of the Day**: Automated daily recipe generation
- **Image Generation**: Optional DALL-E 3 integration for recipe visuals
- **Smart Search**: Semantic search across recipe database

## Architecture

### Database Schema
```sql
-- Core tables
recipes (enhanced with metadata)
recipe_embeddings (vector storage)
external_sources (attribution tracking)
recipe_generations (AI generation history)

-- Vector search enabled with pgvector extension
```

### API Endpoints
- `POST /api/generate` - RAG recipe generation
- `POST /api/search` - Vector similarity search
- `POST /api/create` - Create new recipes
- `POST /api/remix` - Remix existing recipes
- `GET /api/drink-of-day` - Daily featured recipe
- `POST /api/scrape` - Web content ingestion

### Services
- `WebScraperService` - Ethical web scraping
- `OpenAIService` - AI integration and RAG pipeline
- `SupabaseService` - Database operations

## Setup

### 1. Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORG_ID=your_organization_id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Migration
Run the RAG system migration to set up the required tables:
```bash
# Apply the migration in Supabase
supabase db push
```

### 3. Enable Vector Extension
Ensure the `vector` extension is enabled in your Supabase project:
```sql
create extension if not exists vector;
```

## Usage

### Web Scraping
```typescript
import { WebScraperService } from '@/lib/services/webScraper';

// Scrape a single URL
const result = await WebScraperService.scrapeUrl('https://example.com/recipe');

// Scrape multiple URLs
const results = await WebScraperService.scrapeMultipleUrls([
  'https://example.com/recipe1',
  'https://example.com/recipe2'
]);
```

### RAG Recipe Generation
```typescript
import { OpenAIService } from '@/lib/services/openaiService';

// Generate recipes from ingredients
const recipes = await OpenAIService.generateRecipesWithRAG({
  ingredients: ['coffee', 'vanilla', 'cinnamon'],
  style: 'sweet and creamy',
  type: 'coffee',
  temperature: 'hot',
  count: 3
});

// Generate from seed recipe
const variations = await OpenAIService.remixRecipe(existingRecipe);
```

### Vector Search
```typescript
// Search for similar recipes
const similar = await OpenAIService.searchSimilarRecipes(
  'sweet coffee with vanilla',
  5,
  'coffee',
  'hot'
);
```

## Admin Interface

Access the AI Agent admin panel at `/admin/ai-agent` to:
- Manage web scraping operations
- Generate recipes using RAG
- Search and explore the recipe database
- Monitor AI generation metrics

## Ethical Guidelines

### Web Scraping
- ✅ Respect robots.txt files
- ✅ Implement appropriate crawl delays
- ✅ Store attribution and source links
- ✅ Only scrape publicly accessible content
- ❌ Avoid private/blocked social media content
- ❌ Don't overload servers with requests

### Content Usage
- Store only titles, excerpts, and links for blogs without permission
- Full content only for permissive sources
- Always maintain attribution to original creators
- Respect licensing terms and copyright

### AI Generation
- Use RAG to enhance creativity, not replace human input
- Maintain recipe quality and safety standards
- Provide clear attribution for AI-generated content
- Allow human review and editing

## Performance Considerations

### Vector Search
- Uses IVFFlat index for efficient similarity search
- Embeddings generated on recipe creation/update
- Caching implemented for frequently accessed content

### Rate Limiting
- Respects robots.txt crawl delays
- Implements polite delays between requests
- Batch processing for multiple URLs

### Database Optimization
- Proper indexing on search fields
- Efficient vector operations with pgvector
- Row-level security for user data

## Monitoring and Analytics

### Generation Tracking
- Token usage monitoring
- Recipe generation history
- User interaction patterns
- Quality metrics tracking

### Error Handling
- Comprehensive error logging
- Graceful fallbacks for failed operations
- User-friendly error messages
- Retry mechanisms for transient failures

## Security

### Authentication
- All API endpoints require authentication
- User-specific data isolation
- Row-level security policies

### Data Privacy
- No personal data in embeddings
- Secure API key management
- Audit logging for admin operations

## Future Enhancements

### Planned Features
- **Multi-language Support**: International recipe generation
- **Advanced Content Parsing**: Better extraction from complex sites
- **Recipe Validation**: AI-powered quality assessment
- **Community Features**: User feedback and rating systems
- **Mobile Optimization**: Enhanced mobile admin interface

### Technical Improvements
- **Batch Processing**: Efficient bulk operations
- **Real-time Updates**: WebSocket integration for live feedback
- **Advanced Caching**: Redis integration for performance
- **Analytics Dashboard**: Comprehensive usage metrics

## Troubleshooting

### Common Issues

#### Vector Extension Not Available
```sql
-- Check if vector extension exists
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Install if missing
CREATE EXTENSION vector;
```

#### Embedding Generation Fails
- Verify OpenAI API key and quota
- Check network connectivity
- Review API rate limits

#### Scraping Blocked
- Verify robots.txt compliance
- Check user agent settings
- Review target site policies

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
DEBUG=brewbook:ai-agent:*
```

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations
5. Start development server: `npm run dev`

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Comprehensive error handling
- Unit tests for critical functions

## License

This AI agent system is part of BrewBook and follows the same licensing terms. Please ensure compliance with all applicable laws and regulations when using web scraping and AI generation features.

## Support

For technical support or questions about the AI agent:
- Check the troubleshooting section
- Review API documentation
- Contact the development team
- Submit issues through the project repository

---

**Note**: This AI agent is designed for educational and personal use. Always respect website terms of service and implement appropriate rate limiting for production use.
