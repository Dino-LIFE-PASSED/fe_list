-- Run this in Supabase SQL Editor

create table engineers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_path text,
  status text not null default 'offline' check (status in ('working', 'away', 'offline')),
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  engineer_id uuid references engineers(id) on delete set null,
  attachment_path text,
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();
