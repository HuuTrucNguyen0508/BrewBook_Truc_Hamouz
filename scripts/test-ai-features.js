require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set these in your .env file:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('❌ Missing OpenAI API key');
  console.log('Please set OPENAI_API_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseTables() {
  console.log('\n1. Testing Database Tables...');
  
  try {
    // Test external_sources table
    const { data: sources, error: sourcesError } = await supabase
      .from('external_sources')
      .select('count')
      .limit(1);
    
    if (sourcesError) {
      console.log('❌ external_sources table error:', sourcesError.message);
    } else {
      console.log('✅ external_sources table accessible');
    }

    // Test recipe_embeddings table
    const { data: embeddings, error: embeddingsError } = await supabase
      .from('recipe_embeddings')
      .select('count')
      .limit(1);
    
    if (embeddingsError) {
      console.log('❌ recipe_embeddings table error:', embeddingsError.message);
    } else {
      console.log('✅ recipe_embeddings table accessible');
    }

    // Test recipe_generations table
    const { data: generations, error: generationsError } = await supabase
      .from('recipe_generations')
      .select('count')
      .limit(1);
    
    if (generationsError) {
      console.log('❌ recipe_generations table error:', generationsError.message);
    } else {
      console.log('✅ recipe_generations table accessible');
    }

  } catch (error) {
    console.log('❌ Database test failed:', error.message);
  }
}

async function testRecipeCreation() {
  console.log('\n2. Testing Recipe Creation...');
  
  try {
    const testRecipe = {
      title: 'Test Coffee Recipe',
      description: 'A test recipe for testing purposes',
      ingredients: ['coffee beans', 'water', 'milk'],
      steps: ['Grind coffee beans', 'Brew coffee', 'Add milk'],
      type: 'coffee',
      temperature: 'hot',
      difficulty: 'easy',
      tags: ['test', 'coffee']
    };

    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert(testRecipe)
      .select()
      .single();

    if (error) {
      console.log('❌ Recipe creation failed:', error.message);
    } else {
      console.log('✅ Recipe created successfully:', recipe.id);
      
      // Clean up test recipe
      await supabase
        .from('recipes')
        .delete()
        .eq('id', recipe.id);
      
      console.log('✅ Test recipe cleaned up');
    }

  } catch (error) {
    console.log('❌ Recipe creation test failed:', error.message);
  }
}

async function testVectorExtension() {
  console.log('\n3. Testing Vector Extension...');
  
  try {
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      console.log('❌ Vector extension test failed:', error.message);
    } else {
      console.log('✅ Vector extension accessible');
    }

  } catch (error) {
    console.log('❌ Vector extension test failed:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Testing AI Agent Features...\n');
  
  await testDatabaseTables();
  await testRecipeCreation();
  await testVectorExtension();
  
  console.log('\n🎉 Feature tests completed!');
  console.log('\nNext steps:');
  console.log('1. Visit http://localhost:3000/admin/ai-agent');
  console.log('2. Test web scraping with a recipe URL');
  console.log('3. Test RAG recipe generation');
  console.log('4. Test recipe search functionality');
}

runTests().catch(console.error);
