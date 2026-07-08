import {
  BarChart3,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  FolderOpen,
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Users,
} from "lucide-react";
import type { NavItem } from "../types";

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/", icon: LayoutDashboard },
  { id: "discovery", label: "Grant Discovery", path: "/discovery", icon: Search, badge: "47" },
  { id: "pipeline", label: "Pipeline", path: "/pipeline", icon: GitBranch },
  { id: "calendar", label: "Calendar", path: "/calendar", icon: Calendar },
  { id: "proposals", label: "Proposal Builder", path: "/proposals", icon: FileText },
  { id: "profile", label: "Org Profile", path: "/organizations", icon: Building2 },
  { id: "partners", label: "Partners", path: "/partners", icon: Users },
  { id: "documents", label: "Documents", path: "/documents", icon: FolderOpen },
  { id: "budgets", label: "Budgets", path: "/budgets", icon: DollarSign },
  { id: "reporting", label: "Reporting", path: "/reporting", icon: BarChart3 },
  { id: "settings", label: "Settings", path: "/settings", icon: Settings },
  { id: "ai", label: "AI Assistant", path: "/ai", icon: MessageSquare, pulse: true },
];

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/discovery": "Grant Discovery",
  "/recommendations": "AI Recommendations",
  "/pipeline": "Pipeline",
  "/calendar": "Calendar",
  "/proposals": "Proposal Builder",
  "/organizations": "Org Profile",
  "/partners": "Partners",
  "/documents": "Documents",
  "/budgets": "Budget Builder",
  "/reporting": "Reporting",
  "/settings": "Settings",
  "/ai": "AI Assistant",
};

export function getViewLabel(pathname: string) {
  return ROUTE_LABELS[pathname] ?? "Dashboard";
}
