import OpenAI from "openai";
import { createSupabaseServer } from '../supabase/server';

const client = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY, 
  organization: process.env.OPENAI_ORG_ID 
});

export interface RecipeInput {
  title: string;
  description?: string;
  tags?: string[];
  type: 'coffee' | 'matcha' | 'ube' | 'tea';
  temperature: 'hot' | 'iced';
  ingredients: string[];
  steps: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  prep_time_minutes?: number;
  total_time_minutes?: number;
  servings?: number;
  equipment?: string[];
  seasonal_tags?: string[];
  flavor_profile?: string[];
}

export interface GeneratedRecipe extends RecipeInput {
  id?: string;
  image_url?: string;
  external_source_id?: string;
}

export interface RAGGenerationRequest {
  seedRecipeId?: string;
  ingredients?: string[];
  style?: string;
  type?: 'coffee' | 'matcha' | 'ube' | 'tea';
  temperature?: 'hot' | 'iced';
  count?: number;
}

export interface RAGGenerationResult {
  recipes: GeneratedRecipe[];
  seedRecipe?: RecipeInput;
  similarRecipes: RecipeInput[];
  tokensUsed: number;
}

export class OpenAIService {
  /**
   * Generate embeddings for text using OpenAI's text-embedding-3-large
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await client.embeddings.create({
        model: "text-embedding-3-large",
        input: text,
        encoding_format: "float",
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Generate embeddings for a recipe and store in database
   */
  static async generateAndStoreRecipeEmbedding(recipeId: string): Promise<void> {
    try {
      const supabase = await createSupabaseServer();
      
      // Get recipe data
      const { data: recipe, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();
      
      if (error || !recipe) {
        throw new Error('Recipe not found');
      }
      
      // Create content for embedding
      const contentForEmbedding = [
        recipe.title,
        recipe.description || '',
        ...(recipe.tags || []),
        ...(recipe.ingredients || []),
        ...(recipe.steps || []),
        recipe.type,
        recipe.temperature,
        ...(recipe.flavor_profile || []),
        ...(recipe.seasonal_tags || [])
      ].join(' ');
      
      // Generate embedding
      const embedding = await this.generateEmbedding(contentForEmbedding);
      
      // Store embedding
      await supabase
        .from('recipe_embeddings')
        .upsert({
          recipe_id: recipeId,
          embedding,
          content_for_embedding: contentForEmbedding
        });
      
    } catch (error) {
      console.error('Error generating and storing embedding:', error);
      throw error;
    }
  }

  /**
   * Search for similar recipes using vector similarity
   */
  static async searchSimilarRecipes(
    query: string, 
    limit: number = 5,
    type?: string,
    temperature?: string
  ): Promise<RecipeInput[]> {
    try {
      const supabase = await createSupabaseServer();
      
      // Generate embedding for search query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Build the search query
      let searchQuery = supabase
        .from('recipe_embeddings')
        .select(`
          recipe_id,
          recipes (
            id,
            title,
            description,
            tags,
            type,
            temperature,
            ingredients,
            steps,
            difficulty,
            prep_time_minutes,
            total_time_minutes,
            servings,
            equipment,
            seasonal_tags,
            flavor_profile
          )
        `)
        .order(`embedding <-> '[${queryEmbedding.join(',')}]'::vector`)
        .limit(limit);
      
      // Add filters if specified
      if (type) {
        searchQuery = searchQuery.eq('recipes.type', type);
      }
      if (temperature) {
        searchQuery = searchQuery.eq('recipes.temperature', temperature);
      }
      
      const { data, error } = await searchQuery;
      
      if (error) {
        throw error;
      }
      
      return data
        .flatMap(item => item.recipes || [])
        .filter(Boolean) as RecipeInput[];
      
    } catch (error) {
      console.error('Error searching similar recipes:', error);
      throw error;
    }
  }

  /**
   * Generate new recipes using RAG
   */
  static async generateRecipesWithRAG(request: RAGGenerationRequest): Promise<RAGGenerationResult> {
    try {
      const supabase = await createSupabaseServer();
      let seedRecipe: RecipeInput | undefined;
      let similarRecipes: RecipeInput[] = [];
      
      // Get seed recipe if provided
      if (request.seedRecipeId) {
        const { data: recipe } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', request.seedRecipeId)
          .single();
        
        if (recipe) {
          seedRecipe = recipe as RecipeInput;
        }
      }
      
      // Search for similar recipes
      const searchQuery = [
        ...(request.ingredients || []),
        request.style || '',
        request.type || '',
        request.temperature || ''
      ].filter(Boolean).join(' ');
      
      if (searchQuery.trim()) {
        similarRecipes = await this.searchSimilarRecipes(
          searchQuery,
          3,
          request.type,
          request.temperature
        );
      }
      
      // Compose prompt for recipe generation
      const prompt = this.buildRAGPrompt(request, seedRecipe, similarRecipes);
      
      // Generate recipes using GPT-4o
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert barista and mixologist specializing in coffee, matcha, ube, and tea drinks. 
            Generate creative, detailed recipes with precise measurements and clear steps. 
            Always return valid JSON matching the specified schema.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 2000
      });
      
      const content = response.choices[0].message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }
      
      let generatedRecipes: GeneratedRecipe[];
      try {
        const parsed = JSON.parse(content);
        generatedRecipes = Array.isArray(parsed.recipes) ? parsed.recipes : [parsed.recipes];
      } catch {
        throw new Error('Invalid JSON response from OpenAI');
      }
      
      // Validate and clean generated recipes
      generatedRecipes = generatedRecipes.map(recipe => ({
        ...recipe,
        type: recipe.type || request.type || 'coffee',
        temperature: recipe.temperature || request.temperature || 'hot',
        difficulty: recipe.difficulty || 'medium',
        servings: recipe.servings || 1
      }));
      
      // Store generation history
      if (request.seedRecipeId) {
        await supabase.from('recipe_generations').insert({
          prompt,
          seed_recipe_id: request.seedRecipeId,
          generated_recipes: generatedRecipes,
          model_used: 'gpt-4o',
          tokens_used: response.usage?.total_tokens || 0
        });
      }
      
      return {
        recipes: generatedRecipes,
        seedRecipe,
        similarRecipes,
        tokensUsed: response.usage?.total_tokens || 0
      };
      
    } catch (error) {
      console.error('Error generating recipes with RAG:', error);
      throw error;
    }
  }

  /**
   * Build RAG prompt for recipe generation
   */
  private static buildRAGPrompt(
    request: RAGGenerationRequest,
    seedRecipe?: RecipeInput,
    similarRecipes: RecipeInput[] = []
  ): string {
    let prompt = `Generate ${request.count || 3} creative drink recipes. `;
    
    if (request.ingredients?.length) {
      prompt += `Use these ingredients: ${request.ingredients.join(', ')}. `;
    }
    
    if (request.style) {
      prompt += `Style: ${request.style}. `;
    }
    
    if (request.type) {
      prompt += `Type: ${request.type}. `;
    }
    
    if (request.temperature) {
      prompt += `Temperature: ${request.temperature}. `;
    }
    
    if (seedRecipe) {
      prompt += `\n\nSeed Recipe for inspiration:\nTitle: ${seedRecipe.title}\nIngredients: ${seedRecipe.ingredients.join(', ')}\nSteps: ${seedRecipe.steps.join(' | ')}`;
    }
    
    if (similarRecipes.length > 0) {
      prompt += `\n\nSimilar recipes for reference:\n`;
      similarRecipes.forEach((recipe, i) => {
        prompt += `${i + 1}. ${recipe.title}: ${recipe.ingredients.join(', ')}\n`;
      });
    }
    
    prompt += `\n\nReturn JSON with this exact structure:
    {
      "recipes": [
        {
          "title": "Recipe Name",
          "description": "Brief description",
          "tags": ["tag1", "tag2"],
          "type": "${request.type || 'coffee'}",
          "temperature": "${request.temperature || 'hot'}",
          "ingredients": ["2 tbsp ingredient", "1 cup ingredient"],
          "steps": ["Step 1", "Step 2"],
          "difficulty": "medium",
          "prep_time_minutes": 5,
          "total_time_minutes": 10,
          "servings": 1,
          "equipment": ["equipment1", "equipment2"],
          "seasonal_tags": ["summer", "winter"],
          "flavor_profile": ["sweet", "spicy"]
        }
      ]
    }`;
    
    return prompt;
  }

  /**
   * Generate image for a recipe using DALL-E 3
   */
  static async generateRecipeImage(
    recipe: RecipeInput,
    style: string = "photographic, professional food photography, warm lighting"
  ): Promise<string> {
    try {
      const prompt = `A beautiful, appetizing photo of a ${recipe.type} drink: ${recipe.title}. 
      ${recipe.description || ''} 
      Style: ${style}. 
      Professional food photography, perfect lighting, appealing presentation.`;
      
      const response = await client.images.generate({
        model: "dall-e-3",
        prompt: prompt.substring(0, 1000), // DALL-E 3 has a 1000 character limit
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });
      
      return response.data?.[0]?.url || '';
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image');
    }
  }

  /**
   * Generate drink of the day
   */
  static async generateDrinkOfTheDay(seed: string = ""): Promise<GeneratedRecipe | null> {
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert barista. Generate one seasonal specialty drink recipe. 
            Return exactly one recipe with title, description, tags, type, temperature, ingredients, steps, 
            difficulty, prep_time_minutes, total_time_minutes, servings, equipment, seasonal_tags, and flavor_profile.`
          },
          {
            role: "user",
            content: `Generate a seasonal specialty coffee, matcha, ube, or tea drink. Seed: ${seed}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000
      });
      
      const content = response.choices[0].message?.content;
      if (!content) {
        return null;
      }
      
      try {
        const parsed = JSON.parse(content);
        return parsed.recipe || parsed;
      } catch {
        return null;
      }
    } catch (error) {
      console.error('Error generating drink of the day:', error);
      return null;
    }
  }

  /**
   * Remix an existing recipe
   */
  static async remixRecipe(recipe: RecipeInput | GeneratedRecipe): Promise<GeneratedRecipe[]> {
    const request: RAGGenerationRequest = {
      seedRecipeId: 'id' in recipe ? recipe.id : undefined,
      type: recipe.type,
      temperature: recipe.temperature,
      count: 3
    };
    
    const result = await this.generateRecipesWithRAG(request);
    return result.recipes;
  }
}
