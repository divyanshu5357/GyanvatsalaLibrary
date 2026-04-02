-- ============================================
-- EBOOK MANAGEMENT SETUP / UPGRADE
-- ============================================
-- Run this in Supabase SQL Editor.
-- Safe for both fresh installs and existing ebook tables.

create extension if not exists pgcrypto;

create table if not exists public.ebooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_type text not null default 'school',
  class text,
  subject text,
  custom_category text,
  description text,
  file_url text not null,
  upload_type text not null,
  thumbnail_url text,
  file_public_id text,
  thumbnail_public_id text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ebooks
  add column if not exists category_type text,
  add column if not exists custom_category text,
  add column if not exists description text,
  add column if not exists thumbnail_url text,
  add column if not exists file_public_id text,
  add column if not exists thumbnail_public_id text,
  add column if not exists created_by uuid references public.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.ebooks alter column class drop not null;
alter table public.ebooks alter column subject drop not null;
alter table public.ebooks alter column category_type set default 'school';

update public.ebooks
set
  category_type = case
    when coalesce(trim(category_type), '') in ('school', 'other') then lower(trim(category_type))
    when class is not null then 'school'
    when coalesce(trim(custom_category), '') <> '' then 'other'
    else 'school'
  end,
  class = nullif(trim(class), ''),
  subject = nullif(trim(subject), ''),
  custom_category = nullif(trim(custom_category), '');

update public.ebooks
set custom_category = subject
where category_type = 'other'
  and custom_category is null
  and subject is not null;

alter table public.ebooks alter column category_type set not null;

alter table public.ebooks drop constraint if exists ebooks_category_type_check;
alter table public.ebooks drop constraint if exists ebooks_class_check;
alter table public.ebooks drop constraint if exists ebooks_upload_type_check;

alter table public.ebooks
  add constraint ebooks_category_type_check
  check (category_type in ('school', 'other'));

alter table public.ebooks
  add constraint ebooks_class_check
  check (class is null or class in ('6', '7', '8', '9', '10', '11', '12'));

alter table public.ebooks
  add constraint ebooks_upload_type_check
  check (upload_type in ('cloudinary', 'external'));

create index if not exists ebooks_created_at_idx on public.ebooks(created_at desc);
create index if not exists ebooks_category_type_idx on public.ebooks(category_type);
create index if not exists ebooks_subject_idx on public.ebooks(subject);
create index if not exists ebooks_class_idx on public.ebooks(class);
create index if not exists ebooks_custom_category_idx on public.ebooks(custom_category);

create or replace function public.set_ebooks_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_ebooks_updated_at on public.ebooks;
create trigger trg_ebooks_updated_at
before update on public.ebooks
for each row
execute function public.set_ebooks_updated_at();

alter table public.ebooks enable row level security;

drop policy if exists ebooks_read_authenticated on public.ebooks;
create policy ebooks_read_authenticated
on public.ebooks
for select
using (auth.uid() is not null);

drop policy if exists ebooks_admin_insert on public.ebooks;
create policy ebooks_admin_insert
on public.ebooks
for insert
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  )
);

drop policy if exists ebooks_admin_update on public.ebooks;
create policy ebooks_admin_update
on public.ebooks
for update
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  )
);

drop policy if exists ebooks_admin_delete on public.ebooks;
create policy ebooks_admin_delete
on public.ebooks
for delete
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  )
);

-- Optional sanity query:
-- select id, title, category_type, class, subject, custom_category
-- from public.ebooks
-- order by created_at desc;
