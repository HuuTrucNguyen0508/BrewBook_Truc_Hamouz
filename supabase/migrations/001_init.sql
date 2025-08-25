create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tags text[] default '{}',
  type text check (type in ('coffee','matcha','ube','tea')) not null,
  temperature text check (temperature in ('hot','iced')) not null default 'hot',
  ingredients text[] not null,
  steps text[] not null,
  image_url text,
  video_url text,
  author_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

create table if not exists public.saved_recipes (
  user_id uuid references auth.users(id) on delete cascade,
  recipe_id uuid references public.recipes(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, recipe_id)
);

-- Minimal Row Level Security
alter table public.recipes enable row level security;
create policy "recipes read" on public.recipes for select using (true);
create policy "recipes insert" on public.recipes for insert with check (auth.uid() = author_id or author_id is null);
create policy "recipes update own" on public.recipes for update using (auth.uid() = author_id);

alter table public.saved_recipes enable row level security;
create policy "saved read" on public.saved_recipes for select using (auth.uid() = user_id);
create policy "saved write" on public.saved_recipes for insert with check (auth.uid() = user_id);
