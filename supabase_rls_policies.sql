-- Run this in Supabase SQL Editor to allow full access via anon key
-- (suitable for internal tools not exposed to the public internet)

alter table engineers disable row level security;
alter table tasks disable row level security;
