import { NextResponse } from "next/server";
import { remixRecipe } from "@/lib/openai";

export async function POST(req: Request) {
  const body = await req.json();
  const ideas = await remixRecipe(body.recipe);
  return NextResponse.json({ ideas });
}
