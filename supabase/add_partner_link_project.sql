-- Adds a website/contact link and an optional connection to a specific
-- pipeline item (org_opportunity) so a partner can be tied to a project.
alter table partners add column if not exists link text;
alter table partners add column if not exists org_opportunity_id uuid references org_opportunities(id) on delete set null;
