-- Adds fields to org_programs that are commonly needed when describing a
-- program/project for grant applications (target population reach,
-- geographic scope) beyond what was originally captured.
alter table org_programs add column if not exists target_market text;
alter table org_programs add column if not exists geographic_reach text;
