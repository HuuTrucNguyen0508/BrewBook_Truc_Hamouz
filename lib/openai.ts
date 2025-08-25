import OpenAI from "openai";

interface RecipeInput {
  title: string;
  ingredients: string[];
  steps: string[];
}

const client = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY, 
  organization: process.env.OPENAI_ORG_ID 
});

export async function generateIdeas(input: { 
  ingredients?: string[]; 
  recipe?: RecipeInput;
}) {
  // Placeholder: tune system prompt/response schema as needed
  const prompt = input.recipe
    ? `Create 3 creative drink remixes of the following recipe. Return JSON with [{title, ingredients:string[], steps:string[]}]\n${JSON.stringify(input.recipe)}`
    : `Create 3 creative drink ideas using these ingredients. Return JSON with [{title, ingredients:string[], steps:string[]}]\n${(input.ingredients||[]).join(", ")}`;
  
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini", // swap to gpt-5 when available
    messages: [
      { role: "system", content: "You are a barista and mixology expert." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });
  
  const text = res.choices[0].message?.content || "{\"ideas\":[]}";
  try { 
    return JSON.parse(text).ideas ?? []; 
  } catch { 
    return []; 
  }
}

export async function remixRecipe(recipe: RecipeInput) {
  return generateIdeas({ recipe });
}

export async function drinkOfTheDay(seed: string = "") {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Return exactly one drink with title, tags[], ingredients[], steps[] as JSON under key 'drink'." },
      { role: "user", content: `Generate a seasonal specialty coffee or tea. Seed: ${seed}` },
    ],
    response_format: { type: "json_object" },
  });
  
  try { 
    return JSON.parse(res.choices[0].message?.content || "{}").drink; 
  } catch { 
    return null; 
  }
}
