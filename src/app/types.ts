import type { LucideIcon } from "lucide-react";

export type OrgKey = "horizons" | "twiddleu" | "jobvair";

export type ViewId =
  | "dashboard"
  | "discovery"
  | "recommendations"
  | "pipeline"
  | "calendar"
  | "proposals"
  | "profile"
  | "partners"
  | "documents"
  | "budgets"
  | "reporting"
  | "settings"
  | "ai";

export type Organization = {
  name: string;
  short: string;
  type: string;
  city: string;
  ein: string;
  uei: string;
  readiness: number;
  staff: number;
  budget: string;
};

export type NavItem = {
  id: ViewId;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  pulse?: boolean;
};
