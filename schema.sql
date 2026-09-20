-- Run this in the Supabase SQL editor.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  plan text not null default 'free',
  character_limit integer not null default 5000,
  characters_used integer not null default 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_count integer not null,
  voice text not null,
  speed numeric not null default 1,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.generations enable row level security;

create policy "Users can view their profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can view their own generations"
on public.generations for select
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();


-- Atomic usage reservation to prevent concurrent requests from bypassing limits.
create or replace function public.reserve_characters(
  p_user_id uuid,
  p_character_count integer,
  p_voice text,
  p_speed numeric
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile public.profiles%rowtype;
  new_total integer;
begin
  if p_character_count <= 0 then
    raise exception 'Character count must be positive';
  end if;

  select * into current_profile
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  new_total := current_profile.characters_used + p_character_count;

  if new_total > current_profile.character_limit then
    return json_build_object(
      'allowed', false,
      'remaining', greatest(0, current_profile.character_limit - current_profile.characters_used),
      'limit', current_profile.character_limit,
      'used', current_profile.characters_used
    );
  end if;

  insert into public.generations(user_id, character_count, voice, speed)
  values (p_user_id, p_character_count, p_voice, p_speed);

  update public.profiles
  set characters_used = new_total, updated_at = now()
  where id = p_user_id;

  return json_build_object(
    'allowed', true,
    'remaining', current_profile.character_limit - new_total,
    'limit', current_profile.character_limit,
    'used', new_total
  );
end;
$$;


create table if not exists public.stripe_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
