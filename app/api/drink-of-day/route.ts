import { NextResponse } from "next/server";
import { OpenAIService } from "@/lib/services/openaiService";
import { createSupabaseServer } from "@/lib/supabase/server";

interface DrinkData {
  title: string;
  description?: string;
  tags: string[];
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

let cache: DrinkData | null = null; 
let cachedAt = 0;

export async function GET() {
  try {
    // Check if we have a cached drink of the day
    if (!cache || Date.now() - cachedAt > 1000*60*60*6) { // 6h cache
      // Try to get from database first
      const supabase = await createSupabaseServer();
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingDrink } = await supabase
        .from('recipes')
        .select('*')
        .eq('tags', ['drink-of-day'])
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (existingDrink) {
        cache = existingDrink as DrinkData;
        cachedAt = Date.now();
      } else {
        // Generate new drink of the day
        const newDrink = await OpenAIService.generateDrinkOfTheDay();
        
        if (newDrink) {
          // Store in database
          const { data: storedDrink } = await supabase
            .from('recipes')
            .insert({
              ...newDrink,
              tags: [...(newDrink.tags || []), 'drink-of-day'],
              author_id: null // System-generated
            })
            .select()
            .single();
          
          if (storedDrink) {
            // Generate and store embedding
            await OpenAIService.generateAndStoreRecipeEmbedding(storedDrink.id);
            cache = storedDrink as DrinkData;
            cachedAt = Date.now();
          }
        }
      }
    }
    
    if (!cache) {
      return NextResponse.json(
        { error: 'Failed to generate drink of the day' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ drink: cache });
  } catch (error) {
    console.error('Error in drink-of-day endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to get drink of the day' },
      { status: 500 }
    );
  }
}
