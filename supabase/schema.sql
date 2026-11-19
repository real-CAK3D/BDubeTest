-- Everything the shop needs in Supabase, in one go.
-- You normally DON'T need this: the site creates all of it by itself the first
-- time it runs after Supabase is connected in Vercel. Use it only if the
-- Setup page says the table couldn't be created: open Supabase > SQL Editor,
-- paste this whole file, press Run.
--
-- What it makes:
--   shop_kv       one table that holds the shop's settings, products, orders,
--                 customers, reviews and messages (locked: only the website's
--                 secret key can read or write it)
--   shop_hincrby  a small helper for visitor and view counts
--   shop-images   the public folder for photos and 3D scans

-- Shop storage (safe to run more than once)
create table if not exists public.shop_kv (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);
alter table public.shop_kv enable row level security;
-- No policies: only the website's secret key can read or write.

create or replace function public.shop_hincrby(p_key text, p_field text, p_by integer)
returns void language sql security definer set search_path = public as $$
  insert into public.shop_kv (key, value, updated_at)
  values (p_key, jsonb_build_object(p_field, p_by), now())
  on conflict (key) do update
    set value = coalesce(public.shop_kv.value, '{}'::jsonb)
      || jsonb_build_object(p_field, coalesce((public.shop_kv.value ->> p_field)::bigint, 0) + p_by),
        updated_at = now();
$$;
revoke all on function public.shop_hincrby(text, text, integer) from public, anon, authenticated;

-- Photo and 3D-scan storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop-images', 'shop-images', true, 5242880, array['image/*', 'model/gltf-binary'])
on conflict (id) do update set public = true, allowed_mime_types = excluded.allowed_mime_types;
