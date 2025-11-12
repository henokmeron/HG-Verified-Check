import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Download, Settings, HelpCircle, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import VehicleLookupForm from "@/components/VehicleLookupForm";
// import VehicleDetails from "@/components/VehicleDetails"; // Removed - old report component
import RecentLookups from "@/components/RecentLookups";
import AccountSummary from "@/components/AccountSummary";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import UnifiedReportDisplay from "@/components/UnifiedReportDisplay";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Scroll animations
  const welcomeAnimation = useScrollAnimation(0.2);
  const creditsAnimation = useScrollAnimation(0.2);
  const actionsAnimation = useScrollAnimation(0.1);

  const { data: userStats } = useQuery<{
    totalLookups: number;
    thisMonthLookups: number;
    totalSpent: number;
  }>({
    queryKey: ["/api/user-stats"],
    enabled: !!user,
  });

  const { data: recentLookups } = useQuery<any[]>({
    queryKey: ["/api/vehicle-lookups"],
    enabled: !!user,
  });

  // Get latest lookup result from cache for display
  const { data: latestLookup } = useQuery<any>({
    queryKey: ["latest-vehicle-lookup"],
    enabled: false, // Only read from cache, don't fetch
  });

  useEffect(() => {
    // Only redirect if we're sure user is not authenticated (not loading and no user)
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login?redirect=/app";
      }, 500);
      return;
    }

    // Check if user came from checkout and redirect back
    if (user && !isLoading) {
      const savedPackage = localStorage.getItem('checkout_package');
      if (savedPackage) {
        localStorage.removeItem('checkout_package');
        navigate(`/app/checkout?package=${savedPackage}`);
      }
    }
  }, [user, isLoading, toast, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated, preserve the dashboard route
    window.location.href = "/api/login?redirect=/app";
    return null;
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Section */}
      <motion.div 
        ref={welcomeAnimation.ref}
        className="mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={welcomeAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl p-8 hover:shadow-3xl hover:scale-105 transition-all duration-300">
          <h1 className="text-4xl font-black text-gray-900 mb-3 hover:text-blue-600 transition-colors duration-300" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>
            Welcome back, {user.firstName || user.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-xl text-gray-700 font-medium hover:text-blue-600 transition-colors duration-300">Professional Vehicle Intelligence Dashboard</p>
        </div>
      </motion.div>

      {/* Credit Balance Display */}
      <motion.div 
        ref={creditsAnimation.ref}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6 rounded-2xl shadow-2xl mb-10 inline-flex items-center hover:from-blue-700 hover:to-indigo-700 hover:scale-110 hover:shadow-3xl transition-all duration-300 cursor-pointer"
        initial={{ opacity: 0, x: -30 }}
        animate={creditsAnimation.isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="bg-white/20 rounded-full p-3 mr-4 group-hover:animate-pulse">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <span className="text-white/80 text-sm font-medium block">Available Credits</span>
          <span className="text-white text-2xl font-black">
            {user.creditBalance || 0}
          </span>
        </div>
      </motion.div>

      {/* Vehicle Lookup Section */}
      <VehicleLookupForm />
      
      {/* Vehicle Report Display - Directly below lookup form */}
      {latestLookup?.vehicleData && latestLookup?.reportRaw && (
        <div id="vehicle-report-section" className="mt-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <UnifiedReportDisplay
              vehicleData={latestLookup.vehicleData}
              reportRaw={latestLookup.reportRaw}
              isPremium={!!latestLookup.reportRaw && Object.keys(latestLookup.reportRaw).length > 10}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div id="recent-lookups">
            <RecentLookups />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AccountSummary user={user} stats={userStats} />
          
          {/* Premium Packages Promotion */}
          <motion.div 
            ref={actionsAnimation.ref}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={actionsAnimation.isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xl font-bold mb-3 text-white">🚀 Premium Packages</h3>
            <p className="text-blue-100 mb-4 text-sm">Get comprehensive vehicle history reports with full MOT records and detailed specifications.</p>
            <div className="space-y-2 mb-4">
              <div className="text-blue-100 text-sm">✓ Complete MOT History</div>
              <div className="text-blue-100 text-sm">✓ Detailed Vehicle Specifications</div>
              <div className="text-blue-100 text-sm">✓ Save up to £47 vs competitors</div>
            </div>
            <Button 
              onClick={() => navigate('/pricing')}
              className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View Packages from £7
            </Button>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            ref={actionsAnimation.ref}
            className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl p-8 hover:shadow-3xl hover:scale-105 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={actionsAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-2xl font-black text-gray-900 mb-6 hover:text-blue-600 transition-colors duration-300" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Quick Actions</h3>
            
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-50 hover:scale-105 hover:shadow-md transition-all duration-300"
                onClick={() => {
                  const csvData = recentLookups?.map((lookup: any) => ({
                    Date: new Date(lookup.createdAt).toLocaleDateString(),
                    Registration: lookup.registration,
                    Make: lookup.vehicleData?.make || 'N/A',
                    Model: lookup.vehicleData?.model || 'N/A',
                    Year: lookup.vehicleData?.year || 'N/A'
                  }));
                  
                  if (csvData && csvData.length > 0) {
                    const csv = [
                      Object.keys(csvData[0]).join(','),
                      ...csvData.map((row: any) => Object.values(row).join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'vehicle-lookup-history.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Export Complete",
                      description: "Your lookup history has been downloaded as CSV",
                    });
                  } else {
                    toast({
                      title: "No Data",
                      description: "No lookup history available to export",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Download className="mr-3 h-4 w-4 text-gray-400" />
                Export History
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-50 hover:scale-105 hover:shadow-md transition-all duration-300"
                onClick={() => navigate("/app/account")}
              >
                <Settings className="mr-3 h-4 w-4 text-gray-400" />
                Account Settings
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-50 hover:scale-105 hover:shadow-md transition-all duration-300"
                onClick={() => navigate("/pricing")}
              >
                <Shield className="mr-3 h-4 w-4 text-gray-400" />
                Buy Credits
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-50 hover:scale-105 hover:shadow-md transition-all duration-300"
                onClick={() => navigate("/app/support")}
              >
                <HelpCircle className="mr-3 h-4 w-4 text-gray-400" />
                Help & Support
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-50 hover:scale-105 hover:shadow-md transition-all duration-300"
                onClick={() => navigate("/faq")}
              >
                <FileText className="mr-3 h-4 w-4 text-gray-400" />
                FAQ
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
        </main>
      </div>
    </AppLayout>
  );
}