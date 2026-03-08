import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CookieConsent } from "./components/CookieConsent";

// Lazy-load all pages for code splitting
const LandingPage = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ContactsPage = lazy(() => import("./pages/Contacts"));
const ContactDetail = lazy(() => import("./pages/ContactDetail"));
const LeadsPage = lazy(() => import("./pages/Leads"));
const AccountsPage = lazy(() => import("./pages/Accounts"));
const AccountDetail = lazy(() => import("./pages/AccountDetail"));
const DealsPage = lazy(() => import("./pages/Deals"));
const CallsPage = lazy(() => import("./pages/Calls"));
const TasksPage = lazy(() => import("./pages/Tasks"));
const NotesPage = lazy(() => import("./pages/Notes"));
const ReportsPage = lazy(() => import("./pages/Reports"));
const AdminPage = lazy(() => import("./pages/Admin"));
const AuditTrailPage = lazy(() => import("./pages/AuditTrail"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const AuthPage = lazy(() => import("./pages/Auth"));
const MeetingsPage = lazy(() => import("./pages/Meetings"));
const EmailsPage = lazy(() => import("./pages/Emails"));
const WorkflowsPage = lazy(() => import("./pages/Workflows"));
const AiAssistantPage = lazy(() => import("./pages/AiAssistant"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function LandingRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="elite-crm-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingRoute />} />
                <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
                <Route path="/contacts/:id" element={<ProtectedRoute><ContactDetail /></ProtectedRoute>} />
                <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
                <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
                <Route path="/accounts/:id" element={<ProtectedRoute><AccountDetail /></ProtectedRoute>} />
                <Route path="/deals" element={<ProtectedRoute><DealsPage /></ProtectedRoute>} />
                <Route path="/calls" element={<ProtectedRoute><CallsPage /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
                <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
                <Route path="/meetings" element={<ProtectedRoute><MeetingsPage /></ProtectedRoute>} />
                <Route path="/emails" element={<ProtectedRoute><EmailsPage /></ProtectedRoute>} />
                <Route path="/workflows" element={<ProtectedRoute><WorkflowsPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                <Route path="/audit-trail" element={<ProtectedRoute><AuditTrailPage /></ProtectedRoute>} />
                <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistantPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <CookieConsent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;