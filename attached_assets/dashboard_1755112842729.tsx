import logoUrl from "@/assets/car-check-logo.webp";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Car, Shield, LogOut, Menu, X, Download, Settings, HelpCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import VehicleLookupForm from "@/components/VehicleLookupForm";
import CreditPackages from "@/components/CreditPackages";
import VehicleDetails from "@/components/VehicleDetails";
import RecentLookups from "@/components/RecentLookups";
import AccountSummary from "@/components/AccountSummary";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    // Check if user came from checkout and redirect back
    if (user && !isLoading) {
      const savedPackage = localStorage.getItem('checkout_package');
      if (savedPackage) {
        localStorage.removeItem('checkout_package');
        navigate(`/checkout?package=${savedPackage}`);
      }
    }
  }, [user, isLoading, toast, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <img 
                  src={logoUrl} 
                  alt="HG Verified Vehicle Check Logo" 
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold text-gray-900 hidden sm:block">HG Verified Vehicle Check</span>
                <span className="text-lg font-bold text-gray-900 sm:hidden">HG Verified</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              {/* Quick Action Buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  document.getElementById('recent-lookups')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-primary-600"
              >
                <FileText className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/pricing")}
                className="text-gray-700 hover:text-primary-600"
              >
                <Shield className="h-4 w-4 mr-2" />
                Buy Credits
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const csvData = recentLookups?.map((lookup: any) => ({
                    Date: new Date(lookup.createdAt).toLocaleDateString(),
                    Registration: lookup.registration,
                    Make: lookup.vehicleData?.make || 'N/A',
                    Model: lookup.vehicleData?.model || 'N/A',
                    Year: lookup.vehicleData?.year || 'N/A'
                  }));
                  
                  if (csvData && csvData.length > 0) {
                    const csvContent = [
                      Object.keys(csvData[0]).join(','),
                      ...csvData.map(row => Object.values(row).join(','))
                    ].join('\\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'vehicle-lookups.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Export Complete",
                      description: "Your vehicle lookup history has been exported to CSV.",
                    });
                  }
                }}
                className="text-gray-700 hover:text-primary-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-primary-600"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Credit Balance - Hidden on Mobile */}
              <div className="hidden md:flex bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
                <span className="text-primary-700 font-medium text-sm">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Credits: {user.creditBalance || 0}
                </span>
              </div>
              
              {/* Mobile Credit Display */}
              <div className="md:hidden bg-primary-50 px-2 py-1 rounded-full border border-primary-200">
                <span className="text-primary-700 font-medium text-xs">
                  <Shield className="inline h-3 w-3 mr-1" />
                  {user.creditBalance || 0}
                </span>
              </div>
              
              {/* User Profile - Desktop Only */}
              <div className="hidden md:flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl || undefined} alt="User profile" />
                  <AvatarFallback>
                    {user.firstName?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-700 font-medium">
                  {user.firstName || user.email?.split('@')[0] || 'User'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/api/logout"}
                  className="p-1"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Search Bar */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search vehicle registration..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Search vehicle registration..."]') as HTMLInputElement;
                    if (input?.value?.trim()) {
                      // Trigger vehicle lookup with the entered registration
                      toast({
                        title: "Searching...",
                        description: `Looking up ${input.value.trim()}`,
                      });
                    }
                  }}
                >
                  🔍
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      document.getElementById('recent-lookups')?.scrollIntoView({ behavior: 'smooth' });
                      setMobileMenuOpen(false);
                    }}
                    className="flex flex-col items-center space-y-1 h-auto py-3"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="text-xs">Check History</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate("/pricing");
                      setMobileMenuOpen(false);
                    }}
                    className="flex flex-col items-center space-y-1 h-auto py-3"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="text-xs">Buy Credits</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const csvData = recentLookups?.map((lookup: any) => ({
                        Date: new Date(lookup.createdAt).toLocaleDateString(),
                        Registration: lookup.registration,
                        Make: lookup.vehicleData?.make || 'N/A',
                        Model: lookup.vehicleData?.model || 'N/A',
                        Year: lookup.vehicleData?.year || 'N/A'
                      }));
                      
                      if (csvData && csvData.length > 0) {
                        const csvContent = [
                          Object.keys(csvData[0]).join(','),
                          ...csvData.map(row => Object.values(row).join(','))
                        ].join('\\n');
                        
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'vehicle-lookups.csv';
                        a.click();
                        window.URL.revokeObjectURL(url);
                        
                        toast({
                          title: "Export Complete",
                          description: "Your vehicle lookup history has been exported to CSV.",
                        });
                      }
                      setMobileMenuOpen(false);
                    }}
                    className="flex flex-col items-center space-y-1 h-auto py-3"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-xs">Export Data</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center space-y-1 h-auto py-3"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-xs">Settings</span>
                  </Button>
                </div>
              </div>
              
              <Link href="/dashboard" className="block text-gray-700 hover:text-primary-600 font-medium py-2">Dashboard</Link>
              <Link href="/pricing" className="block text-gray-700 hover:text-primary-600 font-medium py-2">Pricing</Link>
              <Link href="/about" className="block text-gray-700 hover:text-primary-600 font-medium py-2">About</Link>
              <Link href="/faq" className="block text-gray-700 hover:text-primary-600 font-medium py-2">FAQ</Link>
              <Link href="/contact" className="block text-gray-700 hover:text-primary-600 font-medium py-2">Contact</Link>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="bg-primary-50 px-3 py-2 rounded-lg border border-primary-200 mb-3">
                  <span className="text-primary-700 font-medium text-sm">
                    <Shield className="inline h-4 w-4 mr-1" />
                    Credits: {user.creditBalance || 0}
                  </span>
                </div>
                <Button 
                  onClick={() => window.location.href = "/api/logout"}
                  variant="outline"
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vehicle Lookup Section */}
        <VehicleLookupForm />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <VehicleDetails />
            <div id="recent-lookups">
              <RecentLookups />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AccountSummary user={user} stats={userStats} />

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
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
                  className="w-full justify-start"
                  onClick={() => navigate("/pricing")}
                >
                  <Settings className="mr-3 h-4 w-4 text-gray-400" />
                  Buy Credits
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate("/support")}
                >
                  <HelpCircle className="mr-3 h-4 w-4 text-gray-400" />
                  Help & Support
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate("/faq")}
                >
                  <FileText className="mr-3 h-4 w-4 text-gray-400" />
                  FAQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
