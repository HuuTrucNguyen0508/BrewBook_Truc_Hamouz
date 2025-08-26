-- RAG System Migration
-- Add embeddings and external sources support

-- Enable vector extension for embeddings
create extension if not exists vector;

-- External sources table for attribution
create table if not exists public.external_sources (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  domain text not null,
  title text,
  excerpt text,
  content_type text check (content_type in ('blog', 'social', 'recipe_site', 'other')) not null,
  robots_txt_allowed boolean default true,
  license_type text,
  last_scraped timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Recipe embeddings table for vector search
create table if not exists public.recipe_embeddings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  embedding vector(1536), -- OpenAI text-embedding-3-large dimension
  content_for_embedding text not null, -- Concatenated title, ingredients, steps for embedding
  created_at timestamp with time zone default now()
);

-- Enhanced recipes table with additional metadata
alter table public.recipes add column if not exists external_source_id uuid references public.external_sources(id);
alter table public.recipes add column if not exists difficulty text check (difficulty in ('easy', 'medium', 'hard')) default 'medium';
alter table public.recipes add column if not exists prep_time_minutes integer;
alter table if not exists public.recipes add column if not exists total_time_minutes integer;
alter table if not exists public.recipes add column if not exists servings integer default 1;
alter table if not exists public.recipes add column if not exists nutrition_info jsonb;
alter table if not exists public.recipes add column if not exists equipment text[];
alter table if not exists public.recipes add column if not exists seasonal_tags text[];
alter table if not exists public.recipes add column if not exists flavor_profile text[];

-- Recipe generation history for tracking AI-generated content
create table if not exists public.recipe_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  prompt text not null,
  seed_recipe_id uuid references public.recipes(id),
  generated_recipes jsonb not null, -- Array of generated recipe objects
  model_used text not null,
  tokens_used integer,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists idx_recipe_embeddings_recipe_id on public.recipe_embeddings(recipe_id);
create index if not exists idx_recipe_embeddings_embedding on public.recipe_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists idx_external_sources_domain on public.external_sources(domain);
create index if not exists idx_external_sources_content_type on public.external_sources(content_type);
create index if not exists idx_recipes_type on public.recipes(type);
create index if not exists idx_recipes_tags on public.recipes using gin(tags);
create index if not exists idx_recipes_flavor_profile on public.recipes using gin(flavor_profile);

-- Row Level Security for new tables
alter table public.external_sources enable row level security;
create policy "external_sources read" on public.external_sources for select using (true);
create policy "external_sources insert" on public.external_sources for insert with check (true);

alter table public.recipe_embeddings enable row level security;
create policy "recipe_embeddings read" on public.recipe_embeddings for select using (true);
create policy "recipe_embeddings insert" on public.recipe_embeddings for insert with check (true);

alter table public.recipe_generations enable row level security;
create policy "recipe_generations read own" on public.recipe_generations for select using (auth.uid() = user_id);
create policy "recipe_generations insert own" on public.recipe_generations for insert with check (auth.uid() = user_id);

-- Function to update embeddings when recipe changes
create or replace function update_recipe_embedding()
returns trigger as $$
begin
  -- Delete old embedding
  delete from public.recipe_embeddings where recipe_id = new.id;
  
  -- Insert new embedding (will be populated by application)
  insert into public.recipe_embeddings (recipe_id, content_for_embedding)
  values (new.id, 
    coalesce(new.title, '') || ' ' || 
    array_to_string(new.ingredients, ' ') || ' ' || 
    array_to_string(new.steps, ' ')
  );
  
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update embeddings
drop trigger if exists trigger_update_recipe_embedding on public.recipes;
create trigger trigger_update_recipe_embedding
  after insert or update on public.recipes
  for each row
  execute function update_recipe_embedding();
