-- Status Now v0.2 schema
create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('status','request')),
  text text not null check (char_length(text) between 1 and 2000),
  location_name text not null,
  latitude double precision,
  longitude double precision,
  media_url text,
  media_type text check (media_type in ('image','video') or media_type is null),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '6 hours'),
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  view_count integer not null default 0
);

create table if not exists public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id,user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  text text not null check (char_length(text) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists posts_expires_at_idx on public.posts(expires_at);
create index if not exists posts_kind_idx on public.posts(kind);
create index if not exists posts_geo_idx on public.posts(latitude,longitude);
create index if not exists comments_post_idx on public.comments(post_id,created_at);

alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

drop policy if exists "public can read active posts" on public.posts;
create policy "public can read active posts" on public.posts for select using (expires_at > now());
drop policy if exists "public can create posts" on public.posts;
create policy "public can create posts" on public.posts for insert with check (expires_at > now() and expires_at <= now() + interval '24 hours' and (user_id is null or user_id = auth.uid()));

drop policy if exists "public can read likes" on public.likes;
create policy "public can read likes" on public.likes for select using (true);
drop policy if exists "users can like" on public.likes;
create policy "users can like" on public.likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "users can unlike" on public.likes;
create policy "users can unlike" on public.likes for delete to authenticated using (user_id = auth.uid());

drop policy if exists "public can read comments" on public.comments;
create policy "public can read comments" on public.comments for select using (true);
drop policy if exists "public can comment" on public.comments;
create policy "public can comment" on public.comments for insert with check (user_id is null or user_id = auth.uid());

create or replace function public.sync_post_counts() returns trigger language plpgsql security definer set search_path=public as $$
declare target_post_id uuid;
begin
  target_post_id := case when tg_op = 'DELETE' then old.post_id else new.post_id end;
  if tg_table_name='likes' then
    update public.posts set likes_count=(select count(*) from public.likes where post_id=target_post_id) where id=target_post_id;
  elsif tg_table_name='comments' then
    update public.posts set comments_count=(select count(*) from public.comments where post_id=target_post_id) where id=target_post_id;
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;

drop trigger if exists likes_count_sync on public.likes;
create trigger likes_count_sync after insert or delete on public.likes for each row execute function public.sync_post_counts();
drop trigger if exists comments_count_sync on public.comments;
create trigger comments_count_sync after insert or delete on public.comments for each row execute function public.sync_post_counts();

insert into storage.buckets (id,name,public) values ('status-media','status-media',true) on conflict (id) do nothing;
drop policy if exists "public can view status media" on storage.objects;
create policy "public can view status media" on storage.objects for select using (bucket_id='status-media');
drop policy if exists "public can upload status media" on storage.objects;
create policy "public can upload status media" on storage.objects for insert with check (bucket_id='status-media');

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='posts') then alter publication supabase_realtime add table public.posts; end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='likes') then alter publication supabase_realtime add table public.likes; end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='comments') then alter publication supabase_realtime add table public.comments; end if;
end $$;
