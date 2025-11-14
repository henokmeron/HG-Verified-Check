import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useLayoutEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import PublicPage from "@/pages/public";
import Dashboard from "@/pages/dashboard";
import Checkout from "@/pages/checkout";
import Pricing from "@/pages/pricing";
import ApiDocs from "@/pages/api-docs";
import Support from "@/pages/support";
import About from "@/pages/about";
import FAQ from "@/pages/faq";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Accessibility from "@/pages/accessibility";
import AccountSettings from "@/pages/account-settings";
import EditProfile from "@/pages/edit-profile";
import CookieConsent from "@/components/CookieConsent";
import MarketingLayout from "@/components/MarketingLayout";
import AppLayout from "@/components/AppLayout";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import AdminTransactions from "@/pages/admin-transactions";
import AdminLookups from "@/pages/admin-lookups";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminLayout from "@/components/AdminLayout";
import AdminUserDetail from "@/pages/admin-user-detail";
// import SharedReport from "@/pages/SharedReport"; // Removed - old report component
import TestPDF from "@/pages/TestPDF";
import TestCheck from "@/pages/TestCheck";

// Component to handle scroll to top on route changes
function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to top on every route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  
  return null;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // CRITICAL: Force full page reload for auth routes IMMEDIATELY
  // Check window.location.pathname DIRECTLY (not Wouter's location) to catch it before Wouter processes it
  // This must run on every render to catch client-side navigation
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/auth/')) {
      console.log('🔄 Auth route detected in Router, forcing immediate full page reload:', currentPath);
      // Use replace to avoid adding to history
      window.location.replace(window.location.href);
      // Return loading state while redirect happens
      return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Redirecting to authentication...</p>
          </div>
        </div>
      );
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // CRITICAL: Never render routes if we're on an auth path
  // This check happens AFTER the window.location check above, as a final safety net
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/')) {
    // This should never execute due to the check above, but just in case...
    console.error('❌ CRITICAL: Auth route detected in Switch - this should never happen!');
    return null; // Don't render anything - let the script in index.html handle it
  }

  return (
    <Switch>
      {/* Marketing routes (public pages) */}
      <Route path="/">
        <MarketingLayout>
          <PublicPage />
        </MarketingLayout>
      </Route>
      <Route path="/public">
        <MarketingLayout>
          <PublicPage />
        </MarketingLayout>
      </Route>
      <Route path="/about">
        <MarketingLayout>
          <About />
        </MarketingLayout>
      </Route>
      <Route path="/pricing">
        <MarketingLayout>
          <Pricing />
        </MarketingLayout>
      </Route>
      <Route path="/faq">
        <MarketingLayout>
          <FAQ />
        </MarketingLayout>
      </Route>
      <Route path="/privacy">
        <MarketingLayout>
          <Privacy />
        </MarketingLayout>
      </Route>
      <Route path="/terms">
        <MarketingLayout>
          <Terms />
        </MarketingLayout>
      </Route>
      <Route path="/accessibility">
        <MarketingLayout>
          <Accessibility />
        </MarketingLayout>
      </Route>

      {/* Shared Report Route - Public route without layout */}
      {/* <Route path="/share/:shareCode">
        <SharedReport />
      </Route> */}

      {/* App routes - new /app prefix */}
      <Route path="/app">
        <Dashboard />
      </Route>
      <Route path="/app/support">
        <AppLayout>
          <Support />
        </AppLayout>
      </Route>
      <Route path="/app/api-docs">
        <ApiDocs />
      </Route>
      <Route path="/app/checkout">
        <AppLayout>
          <Checkout />
        </AppLayout>
      </Route>
      <Route path="/app/account">
        <AccountSettings />
      </Route>
      <Route path="/app/edit-profile">
        <AppLayout>
          <EditProfile />
        </AppLayout>
      </Route>
      
      {/* Test Route for PDF Generation */}
      <Route path="/test-pdf">
        <AppLayout>
          <TestPDF />
        </AppLayout>
      </Route>
      <Route path="/test-check">
        <TestCheck />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/users">
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </Route>
      <Route path="/admin/users/:userId">
        <AdminLayout>
          <AdminUserDetail />
        </AdminLayout>
      </Route>
      <Route path="/admin/transactions">
        <AdminLayout>
          <AdminTransactions />
        </AdminLayout>
      </Route>
      <Route path="/admin/lookups">
        <AdminLayout>
          <AdminLookups />
        </AdminLayout>
      </Route>
      <Route path="/admin/analytics">
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      </Route>

      {/* Authentication routes */}
      <Route path="/api/login">
        <Redirect to="/auth/google" />
      </Route>
      <Route path="/login">
        <Redirect to="/auth/google" />
      </Route>
      <Route path="/api/callback">
        <Redirect to="/app" />
      </Route>
      <Route path="/api/logout">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Logged Out</h2>
            <p className="mt-2 text-gray-600">Redirecting to homepage...</p>
            <script dangerouslySetInnerHTML={{__html: 'setTimeout(() => window.location.href = "/", 2000)'}} />
          </div>
        </div>
      </Route>

      {/* Legacy redirects - force app routes */}
      <Route path="/dashboard">
        <Redirect to="/app" />
      </Route>
      <Route path="/home">
        <Redirect to="/app" />
      </Route>
      <Route path="/support">
        <Redirect to="/app/support" />
      </Route>
      <Route path="/api-docs">
        <Redirect to="/app/api-docs" />
      </Route>
      <Route path="/checkout">
        <Redirect to="/app/checkout" />
      </Route>
      <Route path="/contact">
        <Redirect to="/app/support" />
      </Route>

      {/* Auth routes are handled by the check at the top of Router() - this route should never match */}
      {/* But we keep it as a final fallback safety net */}
      <Route path="/auth/:path*">
        {() => {
          // This should never execute due to the check at the top of Router()
          // But if it does somehow, force a reload immediately
          useEffect(() => {
            window.location.replace(window.location.href);
          }, []);
          return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Redirecting to authentication...</p>
              </div>
            </div>
          );
        }}
      </Route>

      {/* Fallback for landing page */}
      {!isAuthenticated && <Route path="/landing" component={Landing} />}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScrollToTop />
        <Toaster />
        <Router />
        <CookieConsent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
