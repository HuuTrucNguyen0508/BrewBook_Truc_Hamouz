import { NextResponse } from "next/server";
import { generateIdeas } from "@/lib/openai";

export async function POST(req: Request) {
  const body = await req.json();
  const ideas = await generateIdeas(body);
  return NextResponse.json({ ideas });
}
