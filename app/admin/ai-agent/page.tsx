'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import BottomNav from '@/components/nav/BottomNav';
import { createClient } from '@supabase/supabase-js';

interface ScrapingResult {
  success: boolean;
  data?: {
    title: string;
    excerpt: string;
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
    content_type: string;
    robots_txt_allowed: boolean;
  };
}

interface GeneratedRecipe {
  title: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  type: string;
  temperature: string;
  difficulty?: string;
  prep_time_minutes?: number;
  total_time_minutes?: number;
  servings?: number;
  equipment?: string[];
  seasonal_tags?: string[];
  flavor_profile?: string[];
  tags?: string[];
}

export default function AIAgentAdminPage() {
  const [urls, setUrls] = useState('');
  const [scrapingResults, setScrapingResults] = useState<ScrapingResult[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  
  const [ragInput, setRagInput] = useState({
    ingredients: '',
    style: '',
    type: 'coffee',
    temperature: 'hot',
    count: 3
  });
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savingRecipes, setSavingRecipes] = useState<Set<number>>(new Set());
  const [generatingImages, setGeneratingImages] = useState<Set<number>>(new Set());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeneratedRecipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { toast } = useToast();

  const handleScrape = async () => {
    console.log('=== SCRAPE BUTTON CLICKED ===');
    console.log('URLs to scrape:', urls);
    
    if (!urls.trim()) {
      console.log('No URLs entered');
      toast({
        title: "Error",
        description: "Please enter URLs to scrape",
        variant: "destructive"
      });
      return;
    }

    setIsScraping(true);
    console.log('Starting scrape request...');
    
    try {
      const urlList = urls.split('\n').map(url => url.trim()).filter(Boolean);
      console.log('URL list:', urlList);
      
      // Get the user's access token
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      console.log('Auth token available:', !!token);
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ urls: urlList })
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('API response:', result);
      
      if (result.success) {
        // Get the scraping results from the response
        const results = result.results || [];
        setScrapingResults(results);
        
                  const successCount = result.successful || 0;
          const savedCount = result.saved || 0;
          
          toast({
            title: "Success",
            description: `Scraped ${result.scraped} URLs, ${successCount} successful, ${savedCount} saved to database`
          });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to scrape URLs",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to scrape URLs",
        variant: "destructive"
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleSaveScrapedRecipe = async (result: ScrapingResult, index: number) => {
    if (!result.data || !result.data.ingredients || !result.data.steps) {
      toast({
        title: "Error",
        description: "Recipe missing ingredients or steps",
        variant: "destructive"
      });
      return;
    }

    setSavingRecipes(prev => new Set(prev).add(index));
    
    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.data.title,
          description: result.data.excerpt,
          ingredients: result.data.ingredients,
          steps: result.data.steps,
          type: 'coffee', // Default, can be enhanced with AI classification
          temperature: 'hot', // Default, can be enhanced with AI classification
          difficulty: result.data.difficulty || 'medium',
          prep_time_minutes: result.data.prep_time ? parseInt(result.data.prep_time) : undefined,
          total_time_minutes: result.data.total_time ? parseInt(result.data.total_time) : undefined,
          servings: result.data.servings ? parseInt(result.data.servings) : undefined,
          tags: ['scraped', result.source.content_type]
        })
      });
      
      const saveResult = await response.json();
      
      if (saveResult.success) {
        toast({
          title: "Success",
          description: `Recipe "${result.data.title}" saved to database`
        });
        
        // Remove the saved recipe from the list
        setScrapingResults(prev => prev.filter((_, i) => i !== index));
      } else {
        toast({
          title: "Error",
          description: saveResult.error || "Failed to save recipe",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save recipe",
        variant: "destructive"
      });
    } finally {
      setSavingRecipes(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleGenerateImage = async (recipe: GeneratedRecipe, index: number) => {
    setGeneratingImages(prev => new Set(prev).add(index));
    
    try {
      // First save the recipe to get an ID
      const saveResponse = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          type: recipe.type,
          temperature: recipe.temperature,
          difficulty: recipe.difficulty || 'medium',
          prep_time_minutes: recipe.prep_time_minutes,
          total_time_minutes: recipe.total_time_minutes,
          servings: recipe.servings || 1,
          equipment: recipe.equipment || [],
          seasonal_tags: recipe.seasonal_tags || [],
          flavor_profile: recipe.flavor_profile || [],
          tags: recipe.tags || ['ai-generated']
        })
      });
      
      const saveResult = await saveResponse.json();
      
      if (!saveResult.success) {
        throw new Error('Failed to save recipe for image generation');
      }

      // Generate image for the saved recipe
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: saveResult.recipe.id,
          style: "photographic, professional food photography, warm lighting, appetizing"
        })
      });
      
      const imageResult = await imageResponse.json();
      
      if (imageResult.success) {
        toast({
          title: "Success",
          description: `Image generated for "${recipe.title}"`
        });
        
        // Remove the recipe from the list since it's now saved with an image
        setGeneratedRecipes(prev => prev.filter((_, i) => i !== index));
      } else {
        toast({
          title: "Error",
          description: imageResult.error || "Failed to generate image",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive"
      });
    } finally {
      setGeneratingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleRAGGenerate = async () => {
    if (!ragInput.ingredients.trim() && !ragInput.style.trim()) {
      toast({
        title: "Error",
        description: "Please provide ingredients or style",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ragInput.ingredients ? ragInput.ingredients.split(',').map(i => i.trim()) : undefined,
          style: ragInput.style || undefined,
          type: ragInput.type,
          temperature: ragInput.temperature,
          count: ragInput.count
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGeneratedRecipes(result.recipes);
        toast({
          title: "Success",
          description: `Generated ${result.recipes.length} recipes using ${result.tokensUsed} tokens`
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate recipes",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate recipes",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async (recipe: GeneratedRecipe, index: number) => {
    setSavingRecipes(prev => new Set(prev).add(index));
    
    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          type: recipe.type,
          temperature: recipe.temperature,
          difficulty: recipe.difficulty || 'medium',
          prep_time_minutes: recipe.prep_time_minutes,
          total_time_minutes: recipe.total_time_minutes,
          servings: recipe.servings || 1,
          equipment: recipe.equipment || [],
          seasonal_tags: recipe.seasonal_tags || [],
          flavor_profile: recipe.flavor_profile || [],
          tags: recipe.tags || ['ai-generated']
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Recipe "${recipe.title}" saved to database`
        });
        
        // Remove the saved recipe from the list
        setGeneratedRecipes(prev => prev.filter((_, i) => i !== index));
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save recipe",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save recipe",
        variant: "destructive"
      });
    } finally {
      setSavingRecipes(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSearchResults(result.results);
        toast({
          title: "Success",
          description: `Found ${result.count} similar recipes`
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to search recipes",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search recipes",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 space-y-6 pb-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AI Recipe Agent</h1>
        <p className="text-muted-foreground">
          Generate new recipes, scrape from websites, and create AI-powered content
        </p>
      </div>

      {/* Web Scraping Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🌐 Web Scraping</span>
            <Badge variant="secondary">robots.txt compliant</Badge>
          </CardTitle>
          <CardDescription>
            Scrape recipe websites and extract ingredients, steps, and metadata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="urls">URLs to Scrape (one per line)</Label>
            <Textarea
              id="urls"
              placeholder="https://coffeecopycat.com/summer-berry-lemonade-refresher-starbucks-copycat/"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleScrape} 
            disabled={isScraping}
            className="w-full"
          >
            {isScraping ? 'Scraping...' : 'Scrape URLs'}
          </Button>

          {/* Scraping Status */}
          {isScraping && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Scraping in progress...</p>
            </div>
          )}

          {/* Saved Recipes Summary */}
          {savingRecipes.size > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ Saving Recipes ({savingRecipes.size})
              </h3>
              <div className="space-y-2">
                {Array.from(savingRecipes).map((index) => {
                  const result = scrapingResults[index];
                  return (
                    <div key={index} className="text-sm text-green-700 dark:text-green-300">
                      <span className="font-medium">{result.data?.title || 'Untitled'}</span>
                      <span className="text-xs ml-2 text-green-600 dark:text-green-400">
                        (Saving...)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scraping Results */}
          {scrapingResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Scraping Results</h3>
              {scrapingResults.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  result.success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 
                  'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">
                      {result.success ? '✅ Success' : '❌ Failed'}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {result.source.domain}
                    </span>
                  </div>
                  
                  {result.success && result.data ? (
                    <div className="space-y-2">
                      <p className="font-medium">{result.data.title}</p>
                      {result.data.excerpt && (
                        <p className="text-sm text-muted-foreground">{result.data.excerpt}</p>
                      )}
                      {result.data.ingredients && result.data.ingredients.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Ingredients ({result.data.ingredients.length}):</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {result.data.ingredients.slice(0, 3).map((ingredient, i) => (
                              <li key={i}>{ingredient}</li>
                            ))}
                            {result.data.ingredients.length > 3 && (
                              <li className="text-xs">... and {result.data.ingredients.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {result.data.steps && result.data.steps.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Steps ({result.data.steps.length}):</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {result.data.steps.slice(0, 2).map((step, i) => (
                              <li key={i}>{step.substring(0, 100)}...</li>
                            ))}
                            {result.data.steps.length > 2 && (
                              <li className="text-xs">... and {result.data.steps.length - 2} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {result.data.prep_time && <span>Prep: {result.data.prep_time}min</span>}
                        {result.data.total_time && <span>Total: {result.data.total_time}min</span>}
                        {result.data.servings && <span>Serves: {result.data.servings}</span>}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {result.error || 'Unknown error occurred'}
                    </p>
                  )}
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    <a href={result.source.url} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 dark:text-blue-400 hover:underline">
                      View Source
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* RAG Recipe Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🤖 AI Recipe Generation</span>
            <Badge variant="secondary">RAG-powered</Badge>
          </CardTitle>
          <CardDescription>
            Generate new recipes using Retrieval-Augmented Generation based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ingredients">Key Ingredients (optional)</Label>
              <Input
                id="ingredients"
                placeholder="coffee, milk, vanilla, cinnamon"
                value={ragInput.ingredients}
                onChange={(e) => setRagInput(prev => ({ ...prev, ingredients: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="style">Style/Theme (optional)</Label>
              <Input
                id="style"
                placeholder="summer, cozy, festive, healthy"
                value={ragInput.style}
                onChange={(e) => setRagInput(prev => ({ ...prev, style: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="type">Drink Type</Label>
              <Select
                value={ragInput.type}
                onValueChange={(value) => setRagInput(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coffee">Coffee</SelectItem>
                  <SelectItem value="matcha">Matcha</SelectItem>
                  <SelectItem value="tea">Tea</SelectItem>
                  <SelectItem value="smoothie">Smoothie</SelectItem>
                  <SelectItem value="cocktail">Cocktail</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="temperature">Temperature</Label>
              <Select
                value={ragInput.temperature}
                onValueChange={(value) => setRagInput(prev => ({ ...prev, temperature: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                  <SelectItem value="room_temp">Room Temperature</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleRAGGenerate} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Recipes'}
          </Button>

          {/* Generated Recipes */}
          {generatedRecipes.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Generated Recipes</h3>
              {generatedRecipes.map((recipe, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{recipe.title}</h4>
                        {recipe.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {recipe.description}
                          </p>
                        )}
                        
                        {/* Recipe Metadata */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{recipe.type}</Badge>
                          <Badge variant="outline">{recipe.temperature}</Badge>
                          {recipe.difficulty && (
                            <Badge variant="outline">{recipe.difficulty}</Badge>
                          )}
                          {recipe.prep_time_minutes && (
                            <Badge variant="outline">Prep: {recipe.prep_time_minutes}m</Badge>
                          )}
                          {recipe.total_time_minutes && (
                            <Badge variant="outline">Total: {recipe.total_time_minutes}m</Badge>
                          )}
                          {recipe.servings && (
                            <Badge variant="outline">Serves: {recipe.servings}</Badge>
                          )}
                        </div>
                        
                        {/* Ingredients */}
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-1">Ingredients ({recipe.ingredients.length})</h5>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {recipe.ingredients.slice(0, 5).map((ingredient, i) => (
                              <div key={i}>• {ingredient}</div>
                            ))}
                            {recipe.ingredients.length > 5 && (
                              <div className="text-blue-600">+{recipe.ingredients.length - 5} more...</div>
                            )}
                          </div>
                        </div>
                        
                        {/* Steps */}
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-1">Steps ({recipe.steps.length})</h5>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {recipe.steps.slice(0, 3).map((step, i) => (
                              <div key={i}>{i + 1}. {step}</div>
                            ))}
                            {recipe.steps.length > 3 && (
                              <div className="text-blue-600">+{recipe.steps.length - 3} more steps...</div>
                            )}
                          </div>
                        </div>
                        
                        {/* Tags */}
                        {recipe.tags && recipe.tags.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {recipe.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleGenerateImage(recipe, index)}
                          disabled={generatingImages.has(index)}
                        >
                          {generatingImages.has(index) ? 'Generating...' : 'Generate Image'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Recipe Search</CardTitle>
          <CardDescription>
            Search through your recipe database using semantic search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="search">Search Query</Label>
            <Input
              id="search"
              placeholder="Find recipes with coffee and cinnamon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="w-full"
          >
            {isSearching ? 'Searching...' : 'Search Recipes'}
          </Button>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Search Results</h3>
              {searchResults.map((recipe, index) => (
                <Card key={index} className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold">{recipe.title}</h4>
                    {recipe.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {recipe.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{recipe.type}</Badge>
                      <Badge variant="outline">{recipe.temperature}</Badge>
                      {recipe.difficulty && (
                        <Badge variant="outline">{recipe.difficulty}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <BottomNav />
    </div>
  );
}
