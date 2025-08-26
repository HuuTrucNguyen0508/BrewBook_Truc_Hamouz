#!/usr/bin/env node

/**
 * Test script for the BrewBook AI Agent
 * Run with: node scripts/test-ai-agent.js
 */

// Load environment variables from .env file
require('dotenv').config();

const testAIAgent = async () => {
  console.log('🧪 Testing BrewBook AI Agent...\n');

  // Test 1: Check if environment variables are set
  console.log('1. Environment Check:');
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.log('   Please set these in your .env file\n');
    return;
  }
  
  console.log('✅ All required environment variables are set\n');

  // Test 2: Test OpenAI API connection
  console.log('2. OpenAI API Test:');
  try {
    const OpenAI = require('openai');
    const client = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    
    const response = await client.models.list();
    console.log('✅ OpenAI API connection successful');
    console.log(`   Available models: ${response.data.length}\n`);
  } catch (error) {
    console.log(`❌ OpenAI API connection failed: ${error.message}\n`);
    return;
  }

  // Test 3: Test Supabase connection
  console.log('3. Supabase Connection Test:');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.from('recipes').select('count').limit(1);
    
    if (error) {
      console.log(`❌ Supabase connection failed: ${error.message}\n`);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('   Database is accessible\n');
  } catch (error) {
    console.log(`❌ Supabase connection failed: ${error.message}\n`);
    return;
  }

  // Test 4: Check database schema
  console.log('4. Database Schema Check:');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Check if required tables exist
    const tables = ['recipes', 'recipe_embeddings', 'external_sources', 'recipe_generations'];
    const tableChecks = await Promise.all(
      tables.map(async (table) => {
        try {
          const { error } = await supabase.from(table).select('count').limit(1);
          return { table, exists: !error };
        } catch {
          return { table, exists: false };
        }
      })
    );
    
    const missingTables = tableChecks.filter(check => !check.exists);
    
    if (missingTables.length > 0) {
      console.log(`❌ Missing tables: ${missingTables.map(t => t.table).join(', ')}`);
      console.log('   Please run the database migration: supabase db push\n');
      return;
    }
    
    console.log('✅ All required database tables exist\n');
  } catch (error) {
    console.log(`❌ Database schema check failed: ${error.message}\n`);
    return;
  }

  // Test 5: Test embedding generation
  console.log('5. Embedding Generation Test:');
  try {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: "test coffee recipe"
    });

    // Log raw response for debugging if unexpected
    if (!response?.data?.[0]?.embedding) {
      console.log('❌ Embedding generation failed: Unexpected response format');
      console.log('   Full response:', JSON.stringify(response, null, 2), '\n');
      return;
    }

    const embedding = response.data[0].embedding;

    if (Array.isArray(embedding) && embedding.length === 1536) {
      console.log('✅ Embedding generation successful');
      console.log(`   Vector dimension: ${embedding.length}\n`);
    } else {
      console.log('❌ Embedding generation failed: Invalid embedding array');
      console.log('   Full embedding:', embedding, '\n');
    }
  } catch (error) {
    console.log(`❌ Embedding generation failed: ${error.message}\n`);
    return;
  }

  // Test 6: Test recipe generation
  console.log('6. Recipe Generation Test:');
  try {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: "You are an expert barista. Respond only in **valid JSON format**. Generate a single coffee recipe with the fields: title, ingredients, and steps."
        },
        {
          role: "user",
          content: "Create a simple vanilla latte recipe"
        }
      ],
    });

    
  const content = response.choices[0].message?.content;
  if (content) {
    try {
      JSON.parse(content);
      console.log('✅ Recipe generation successful');
      console.log('   GPT-5-nano is accessible and working\n');
    } catch {
      console.log('❌ Recipe generation failed: Invalid JSON response\n');
      return;
    }
  } else {
    console.log('❌ Recipe generation failed: No response content\n');
    return;
  }
  } catch (error) {
    console.log(`❌ Recipe generation failed: ${error.message}\n`);
    return;
    }

  console.log('🎉 All tests passed! The AI Agent is ready to use.\n');
  console.log('Next steps:');
  console.log('1. Start your development server: npm run dev\n');
  console.log('2. Visit /admin/ai-agent to access the admin interface');
  console.log('3. Try web scraping some recipe URLs');
  console.log('4. Generate new recipes using RAG');
  console.log('5. Explore the vector search functionality');
};

// Run the tests
testAIAgent().catch(console.error);
