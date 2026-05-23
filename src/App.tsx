import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { useAppStore } from "./lib/store";
import { fetchApi } from "./lib/api/api-client";
import type { User } from "./lib/store";

const Navbar = lazy(() => import("./components/layout/Navbar"));
const Footer = lazy(() => import("./components/layout/Footer"));
const LandingPage = lazy(() => import("./pages/LandingPage"));

// Auth pages
const SignupPage = lazy(() => import("./pages/SignupPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const VerifyPhonePage = lazy(() => import("./pages/auth/VerifyPhonePage"));
const AccountCreatedPage = lazy(
  () => import("./pages/auth/AccountCreatedPage"),
);
const LinkExpiredPage = lazy(() => import("./pages/auth/LinkExpiredPage"));
const ForgotPasswordPage = lazy(
  () => import("./pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));

// Entrepreneur pages
const EntrepreneurLayout = lazy(
  () => import("./pages/entrepreneur/EntrepreneurLayout"),
);
const EntrepreneurDashboard = lazy(
  () => import("./pages/entrepreneur/EntrepreneurDashboard"),
);
const EntrepreneurProfilePage = lazy(
  () => import("./pages/entrepreneur/EntrepreneurProfilePage"),
);
const EntrepreneurOnboarding = lazy(
  () => import("./pages/entrepreneur/EntrepreneurOnboarding"),
);
const MyProjectsPage = lazy(
  () => import("./pages/entrepreneur/MyProjectsPage"),
);
const SubmitProjectPage = lazy(
  () => import("./pages/entrepreneur/SubmitProjectPage"),
);
const WeeklyProgressPage = lazy(
  () => import("./pages/entrepreneur/WeeklyProgressPage"),
);
const ImpactDashboardPage = lazy(
  () => import("./pages/entrepreneur/ImpactDashboardPage"),
);

// Funder pages
const FunderLayout = lazy(() => import("./pages/funder/FunderLayout"));
const FunderDashboardPage = lazy(
  () => import("./pages/funder/FunderDashboardPage"),
);
const FunderProfilePage = lazy(
  () => import("./pages/funder/FunderProfilePage"),
);
const DiscoverProjectsPage = lazy(
  () => import("./pages/funder/DiscoverProjectsPage"),
);
const ProjectDetailPage = lazy(
  () => import("./pages/funder/ProjectDetailPage"),
);
const HowItWorksPage = lazy(() => import("./pages/funder/HowItWorksPage"));
const FunderSettingsPage = lazy(
  () => import("./pages/funder/FunderSettingsPage"),
);
const PaymentCallbackPage = lazy(
  () => import("./pages/funder/PaymentCallbackPage"),
);
const EntrepreneurSettingsPage = lazy(
  () => import("./pages/entrepreneur/EntrepreneurSettingsPage"),
);

/**
 * Syncs the user from the backend on every app load.
 * Placed at the root so it runs for ALL dashboard routes.
 */
function UserSyncer() {
  const { isAuthenticated, updateUser } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchApi<User>("/auth/me/")
      .then((freshUser) => updateUser(freshUser))
      .catch(() => {
        // Token expired — api-client.ts handles the redirect to /login
      });
  }, [isAuthenticated, updateUser]);

  return null;
}

function DashboardRouter() {
  const { user, isAuthenticated } = useAppStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login/entrepreneur" replace />;
  }
  if (user.role === "funder") {
    return <Navigate to="/dashboard/funder" replace />;
  }
  return <Navigate to="/dashboard/entrepreneur" replace />;
}

function AppLayout() {
  const location = useLocation();
  const path = location.pathname;

  const isAuthPage =
    path.startsWith("/signup") ||
    path.startsWith("/login") ||
    path.startsWith("/verify-") ||
    path.startsWith("/account-created") ||
    path.startsWith("/link-expired") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password");
  const isDashboard = path.startsWith("/dashboard");
  const showNavbar = !isAuthPage && !isDashboard;
  const showFooter = !isAuthPage && !isDashboard;

  return (
    <>
      <UserSyncer />
      {showNavbar && (
        <Suspense
          fallback={
            <div className="min-h-screen grid place-items-center">
              GrantBridge...
            </div>
          }
        >
          <Navbar />
        </Suspense>
      )}
      <Suspense
        fallback={
          <div className="min-h-screen grid place-items-center">Loading...</div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Auth flow */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/:role" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route path="/verify-email/:role" element={<VerifyEmailPage />} />
          <Route path="/verify-phone/:role" element={<VerifyPhonePage />} />
          <Route
            path="/account-created/:role"
            element={<AccountCreatedPage />}
          />
          <Route path="/link-expired/:role" element={<LinkExpiredPage />} />
          <Route
            path="/forgot-password/:role"
            element={<ForgotPasswordPage />}
          />
          <Route path="/reset-password/:role" element={<ResetPasswordPage />} />

          {/* Dashboards */}
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Entrepreneur — verification onboarding (no navbar) */}
          <Route
            path="/dashboard/entrepreneur/welcome"
            element={<EntrepreneurOnboarding />}
          />
          <Route
            path="/dashboard/funder/welcome"
            element={<EntrepreneurOnboarding />}
          />

          {/* Entrepreneur — main dashboard with top navbar */}
          <Route
            path="/dashboard/entrepreneur"
            element={<EntrepreneurLayout />}
          >
            <Route index element={<EntrepreneurDashboard />} />
            <Route path="profile" element={<EntrepreneurProfilePage />} />
            <Route path="projects" element={<MyProjectsPage />} />
            <Route path="projects/new" element={<SubmitProjectPage />} />
            <Route path="progress" element={<WeeklyProgressPage />} />
            <Route path="impact" element={<ImpactDashboardPage />} />
            <Route path="settings" element={<EntrepreneurSettingsPage />} />
          </Route>

          {/* Funder */}
          <Route path="/dashboard/funder" element={<FunderLayout />}>
            <Route index element={<FunderDashboardPage />} />
            <Route path="profile" element={<FunderProfilePage />} />
            <Route path="discover" element={<DiscoverProjectsPage />} />
            <Route path="project/:id" element={<ProjectDetailPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="settings" element={<FunderSettingsPage />} />
            <Route path="payment/callback" element={<PaymentCallbackPage />} />
          </Route>
        </Routes>
      </Suspense>
      {showFooter && (
        <Suspense
          fallback={
            <div className="min-h-screen grid place-items-center">
              Loading...
            </div>
          }
        >
          <Footer />
        </Suspense>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
