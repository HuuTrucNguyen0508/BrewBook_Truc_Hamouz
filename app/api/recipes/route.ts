import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { recipeSchema } from "@/lib/validators";

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ recipes: recipes || [] });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate the request body
    const validatedData = recipeSchema.parse(body);
    
    const supabase = await createSupabaseServer();
    const { data: recipe, error } = await supabase
      .from("recipes")
      .insert([validatedData])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}
