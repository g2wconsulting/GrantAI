import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

export type OrgRecord = {
  id: string;
  name: string;
  short: string | null;
  type: string | null;
  city: string | null;
  ein: string | null;
  uei: string | null;
  mission: string | null;
  focus_areas: string[];
  budget_size: string | null;
  staff_count: number | null;
  readiness: number;
};

type ActiveOrgContextValue = {
  orgs: OrgRecord[];
  activeOrgId: string | null;
  org: OrgRecord | null;
  loading: boolean;
  setActiveOrgId: (id: string) => void;
  createOrg: (input: Partial<OrgRecord> & { name: string }) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
};

const ActiveOrgContext = createContext<ActiveOrgContextValue | null>(null);

export function ActiveOrgProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<OrgRecord[]>([]);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setOrgs([]);
      setActiveOrgIdState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("org_memberships")
      .select("org:orgs(*)")
      .eq("user_id", user.id);

    if (!error && data) {
      const orgList = data
        .map((row) => row.org as unknown as OrgRecord)
        .filter(Boolean);
      setOrgs(orgList);
      setActiveOrgIdState((current) => current ?? orgList[0]?.id ?? null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createOrg = useCallback(
    async (input: Partial<OrgRecord> & { name: string }) => {
      if (!user) return { error: "Not signed in" };
      const { data, error } = await supabase
        .from("orgs")
        .insert({
          name: input.name,
          short: input.short ?? input.name.slice(0, 2).toUpperCase(),
          type: input.type ?? null,
          city: input.city ?? null,
          ein: input.ein ?? null,
          uei: input.uei ?? null,
          mission: input.mission ?? null,
          focus_areas: input.focus_areas ?? [],
          budget_size: input.budget_size ?? null,
          staff_count: input.staff_count ?? null,
        })
        .select()
        .single();

      if (error || !data) return { error: error?.message ?? "Failed to create org" };

      const { error: memberError } = await supabase
        .from("org_memberships")
        .insert({ org_id: data.id, user_id: user.id, role: "owner" });

      if (memberError) return { error: memberError.message };

      await refresh();
      setActiveOrgIdState(data.id);
      return { error: null };
    },
    [user, refresh]
  );

  const org = useMemo(() => orgs.find((o) => o.id === activeOrgId) ?? null, [orgs, activeOrgId]);

  const value = useMemo(
    () => ({
      orgs,
      activeOrgId,
      org,
      loading,
      setActiveOrgId: setActiveOrgIdState,
      createOrg,
      refresh,
    }),
    [orgs, activeOrgId, org, loading, createOrg, refresh]
  );

  return <ActiveOrgContext.Provider value={value}>{children}</ActiveOrgContext.Provider>;
}

export function useActiveOrg() {
  const ctx = useContext(ActiveOrgContext);
  if (!ctx) throw new Error("useActiveOrg must be used within ActiveOrgProvider");
  return ctx;
}
