-- ============================================================================
-- GrantAI Schema
-- Run this in Supabase SQL Editor: Project > SQL Editor > New Query > Run
-- ============================================================================

-- ─── Organizations ───────────────────────────────────────────────────────────
create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short text,
  type text,              -- e.g. "Community Nonprofit", "EdTech Nonprofit"
  city text,
  ein text,
  uei text,
  mission text,           -- used for AI/keyword matching against grants
  focus_areas text[] default '{}',   -- e.g. {"workforce development","education","AI"}
  budget_size text,       -- e.g. "$1M-$5M"
  staff_count int,
  readiness int default 50,
  created_at timestamptz default now()
);

-- ─── Org Memberships (multi-org support) ────────────────────────────────────
create table if not exists org_memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

-- ─── Opportunities (cached from Grants.gov, shared across all orgs) ─────────
create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,        -- Grants.gov OpportunityID
  title text not null,
  funder text,
  agency_code text,
  amount_floor numeric,
  amount_ceiling numeric,
  deadline date,
  category text,                  -- Federal / Foundation / State / Corporate
  eligibility text,
  description text,
  cfda_numbers text[],
  raw jsonb,                      -- full source payload for reference
  synced_at timestamptz default now()
);

-- ─── Org <> Opportunity Matches (computed match score + pipeline stage) ─────
create table if not exists org_opportunities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  opportunity_id uuid references opportunities(id) on delete cascade not null,
  match_score int,                -- 0-100 computed match
  match_reasons text[],
  stage text default 'researching' check (stage in ('researching','qualified','writing','submitted','awarded','declined')),
  win_prob int,
  created_at timestamptz default now(),
  unique(org_id, opportunity_id)
);

-- ─── Proposals (auto-seeded when an opportunity enters pipeline) ────────────
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  org_opportunity_id uuid references org_opportunities(id) on delete cascade,
  title text not null,
  status text default 'draft' check (status in ('draft','in_review','submitted')),
  content jsonb default '{}',     -- sections: needs statement, narrative, etc.
  updated_at timestamptz default now()
);

-- ─── Budgets (linked to a proposal / opportunity) ───────────────────────────
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  org_opportunity_id uuid references org_opportunities(id) on delete cascade,
  category text not null,         -- Personnel, Travel, Supplies, etc.
  label text not null,
  year1 numeric default 0,
  year2 numeric default 0,
  year3 numeric default 0
);

-- ─── Calendar events (auto-seeded from opportunity deadlines) ───────────────
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  org_opportunity_id uuid references org_opportunities(id) on delete cascade,
  title text not null,
  event_date date not null,
  type text default 'deadline' check (type in ('deadline','report','meeting','other'))
);

-- ─── Partners ────────────────────────────────────────────────────────────────
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  name text not null,
  type text,
  role text,
  stage text default 'Prospect',
  contact text,
  last_contact date
);

-- ─── Documents (metadata; files live in Supabase Storage) ───────────────────
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  name text not null,
  category text,
  storage_path text,
  file_type text,
  size_bytes bigint,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- ─── Reports due ─────────────────────────────────────────────────────────────
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  org_opportunity_id uuid references org_opportunities(id) on delete cascade,
  name text not null,
  due_date date,
  status text default 'Not Started'
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table orgs enable row level security;
alter table org_memberships enable row level security;
alter table opportunities enable row level security;
alter table org_opportunities enable row level security;
alter table proposals enable row level security;
alter table budgets enable row level security;
alter table calendar_events enable row level security;
alter table partners enable row level security;
alter table documents enable row level security;
alter table reports enable row level security;

-- Helper: is the current user a member of a given org?
create or replace function is_org_member(target_org_id uuid)
returns boolean as $$
  select exists (
    select 1 from org_memberships
    where org_id = target_org_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- Orgs: members can view their org; anyone authenticated can create one
create policy "members can view their org" on orgs
  for select using (is_org_member(id));
create policy "authenticated users can create orgs" on orgs
  for insert with check (auth.uid() is not null);
create policy "owners/admins can update their org" on orgs
  for update using (is_org_member(id));

-- Memberships: users can view memberships for orgs they belong to
create policy "view own memberships" on org_memberships
  for select using (user_id = auth.uid() or is_org_member(org_id));
create policy "users can insert their own membership" on org_memberships
  for insert with check (user_id = auth.uid());

-- Opportunities: readable by any authenticated user (shared reference data)
create policy "authenticated users can view opportunities" on opportunities
  for select using (auth.uid() is not null);

-- Org-scoped tables: standard "member of org" policy, applied to each
create policy "org members full access" on org_opportunities
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "org members full access" on proposals
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "org members full access" on budgets
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "org members full access" on calendar_events
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "org members full access" on partners
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "org members full access" on documents
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "org members full access" on reports
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
