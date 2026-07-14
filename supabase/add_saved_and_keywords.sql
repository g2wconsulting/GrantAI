-- Lets a user explicitly file a discovered grant away for later without
-- promoting it to "qualified" (which auto-creates a proposal/budget/deadline).
-- Saved grants disappear from the Discovery inbox but remain visible in the
-- Pipeline's "Researching" column.
alter table org_opportunities add column if not exists saved boolean default false;

-- Freeform search keywords, in addition to the preset focus-area toggles —
-- lets orgs cast a broader/more specific net for grant discovery (e.g.
-- "veteran services", "rural broadband") without being limited to the
-- fixed focus-area list.
alter table orgs add column if not exists search_keywords text[] default '{}';
update orgs set search_keywords = '{}' where search_keywords is null;
