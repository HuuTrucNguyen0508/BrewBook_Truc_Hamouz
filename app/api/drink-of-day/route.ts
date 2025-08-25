import { NextResponse } from "next/server";
import { drinkOfTheDay } from "@/lib/openai";

interface DrinkData {
  title: string;
  tags: string[];
  ingredients: string[];
  steps: string[];
}

let cache: DrinkData | null = null; 
let cachedAt = 0;

export async function GET() {
  if (!cache || Date.now() - cachedAt > 1000*60*60*6) { // 6h cache
    cache = await drinkOfTheDay(); 
    cachedAt = Date.now();
  }
  return NextResponse.json({ drink: cache });
}
