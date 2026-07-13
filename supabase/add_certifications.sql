create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  name text not null,                 -- e.g. "MBE", "WBE", "DBE", "8(a)", "HUBZone", "State Business License"
  cert_type text default 'Certification' check (cert_type in ('Certification','Registration','License')),
  state text,                         -- issuing state, or "Federal"
  cert_number text,
  issuing_authority text,
  issue_date date,
  expiration_date date,
  status text default 'Active' check (status in ('Active','Expired','Pending Renewal','Pending Application')),
  notes text,
  created_at timestamptz default now()
);

alter table certifications enable row level security;

create policy "org members full access" on certifications
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));

grant select, insert, update, delete on certifications to authenticated;
