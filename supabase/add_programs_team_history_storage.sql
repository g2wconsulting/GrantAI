-- ─── Programs ────────────────────────────────────────────────────────────────
create table if not exists org_programs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  name text not null,
  description text,
  budget text,
  people_served text,
  outcome text,
  created_at timestamptz default now()
);

-- ─── Team members ────────────────────────────────────────────────────────────
create table if not exists org_team_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  name text not null,
  title text,
  member_type text default 'Staff' check (member_type in ('Staff','Board')),
  since_year text,
  created_at timestamptz default now()
);

-- ─── Manually-logged grant history (pre-platform awards) ────────────────────
create table if not exists grant_history (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  name text not null,
  funder text,
  amount text,
  period text,
  status text default 'Awarded',
  created_at timestamptz default now()
);

-- ─── Financial snapshot fields on orgs ──────────────────────────────────────
alter table orgs add column if not exists total_revenue text;
alter table orgs add column if not exists total_expenses text;
alter table orgs add column if not exists net_assets text;

-- ─── RLS for new tables ──────────────────────────────────────────────────────
alter table org_programs enable row level security;
alter table org_team_members enable row level security;
alter table grant_history enable row level security;

create policy "org members full access" on org_programs
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "org members full access" on org_team_members
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "org members full access" on grant_history
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));

grant select, insert, update, delete on org_programs, org_team_members, grant_history to authenticated;

-- ─── File storage bucket for proposal/org documents ─────────────────────────
insert into storage.buckets (id, name, public)
values ('org-files', 'org-files', false)
on conflict (id) do nothing;

-- Files are stored under a path like: {org_id}/proposals/{proposal_id}/{filename}
-- Policy: a user can read/write a file only if they belong to the org whose id
-- is the first path segment.
create policy "org members can read their files" on storage.objects
  for select using (
    bucket_id = 'org-files'
    and is_org_member((storage.foldername(name))[1]::uuid)
  );

create policy "org members can upload their files" on storage.objects
  for insert with check (
    bucket_id = 'org-files'
    and is_org_member((storage.foldername(name))[1]::uuid)
  );

create policy "org members can delete their files" on storage.objects
  for delete using (
    bucket_id = 'org-files'
    and is_org_member((storage.foldername(name))[1]::uuid)
  );
