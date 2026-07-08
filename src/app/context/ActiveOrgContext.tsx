import { createContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ORGS } from "../data/demoData";
import type { OrgKey } from "../types";

export type ActiveOrgContextValue = {
  activeOrg: OrgKey;
  setActiveOrg: (org: OrgKey) => void;
  org: (typeof ORGS)[OrgKey];
};

export const ActiveOrgContext = createContext<ActiveOrgContextValue | null>(null);

export function ActiveOrgProvider({ children }: { children: ReactNode }) {
  const [activeOrg, setActiveOrg] = useState<OrgKey>("horizons");
  const org = ORGS[activeOrg];
  const value = useMemo(() => ({ activeOrg, setActiveOrg, org }), [activeOrg, org]);

  return <ActiveOrgContext.Provider value={value}>{children}</ActiveOrgContext.Provider>;
}
