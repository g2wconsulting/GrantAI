-- Grant baseline table privileges to the authenticated role.
-- RLS policies control WHICH rows can be touched, but the role still
-- needs a basic GRANT to touch the table at all. This was missing.

grant usage on schema public to authenticated, anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

-- Make sure future tables get the same treatment automatically
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant select on tables to anon;
