import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ActiveOrgProvider } from "./context/ActiveOrgContext";
import { useActiveOrg } from "./hooks/useActiveOrg";
import { LoginView } from "./features/auth/LoginView";
import { OnboardingView } from "./features/organizations/OnboardingView";
import { AppLayout } from "./layout/AppLayout";
import { AIAssistantView } from "./features/assistant/AIAssistantView";
import { BudgetBuilderView } from "./features/budgets/BudgetBuilderView";
import { CalendarView } from "./features/calendar/CalendarView";
import { DashboardView } from "./features/dashboard/DashboardView";
import { DiscoveryView } from "./features/discovery/DiscoveryView";
import { RecommendationsView } from "./features/discovery/RecommendationsView";
import { DocumentsView } from "./features/documents/DocumentsView";
import { OrganizationProfileView } from "./features/organizations/OrganizationProfileView";
import { CertificationsView } from "./features/certifications/CertificationsView";
import { HubView } from "./features/hub/HubView";
import { ResourceLibraryView } from "./features/resources/ResourceLibraryView";
import { PartnersView } from "./features/partners/PartnersView";
import { PipelineView } from "./features/pipeline/PipelineView";
import { ProposalBuilderView } from "./features/proposals/ProposalBuilderView";
import { ReportingView } from "./features/reporting/ReportingView";
import { SettingsView } from "./features/settings/SettingsView";

function Gate() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0fdf5]">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!user) return <LoginView />;

  return (
    <ActiveOrgProvider>
      <OrgGate />
    </ActiveOrgProvider>
  );
}

function OrgGate() {
  const { org, loading } = useActiveOrg();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0fdf5]">
        <p className="text-slate-500">Loading your organization…</p>
      </div>
    );
  }

  if (!org) return <OnboardingView />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardView />} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="discovery" element={<DiscoveryView />} />
        <Route path="recommendations" element={<RecommendationsView />} />
        <Route path="pipeline" element={<PipelineView />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="proposals" element={<ProposalBuilderView />} />
        <Route path="organizations" element={<OrganizationProfileView />} />
        <Route path="certifications" element={<CertificationsView />} />
        <Route path="hub" element={<HubView />} />
        <Route path="resources" element={<ResourceLibraryView />} />
        <Route path="profile" element={<Navigate to="/organizations" replace />} />
        <Route path="partners" element={<PartnersView />} />
        <Route path="documents" element={<DocumentsView />} />
        <Route path="budgets" element={<BudgetBuilderView />} />
        <Route path="reporting" element={<ReportingView />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="ai" element={<AIAssistantView />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  );
}
