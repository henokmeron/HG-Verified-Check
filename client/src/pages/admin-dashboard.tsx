import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, Car, TrendingUp, Shield, Settings, LogIn } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface AdminStats {
  totalUsers: number;
  totalLookups: number;
  totalRevenue: number;
  thisMonthUsers: number;
  thisMonthLookups: number;
  thisMonthRevenue: number;
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: adminStats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        console.log('Admin stats unauthorized error:', error);
        return false;
      }
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Please Log In",
        description: "Redirecting to login page...",
        variant: "default",
      });
      setTimeout(() => {
        window.location.href = "/api/login?redirect=/admin";
      }, 1000);
      return;
    }

    // Check for API errors
    if (statsError) {
      const errorMessage = (statsError as any)?.message || 'Unknown error';
      console.error('Admin stats error:', errorMessage);
      
      if (errorMessage.includes('403')) {
        toast({
          title: "Access Denied", 
          description: "Admin access required. You are not authorized to view this page.",
          variant: "destructive",
        });
        setTimeout(() => {
          navigate("/app");
        }, 1500);
      } else if (errorMessage.includes('401')) {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "default",
        });
        setTimeout(() => {
          window.location.href = "/api/login?redirect=/admin";
        }, 1000);
      }
    }
    
    // Check if user is admin after stats load  
    if (user && !statsLoading && user.role !== 'admin' && !statsError) {
      toast({
        title: "Access Denied", 
        description: "Admin access required. You are not authorized to view this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate("/app");
      }, 1500);
    }
  }, [user, isLoading, toast, navigate, statsLoading, statsError]);

  // Show login button if not authenticated
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="max-w-md w-full mx-4 p-8 bg-white shadow-xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6">
              <Shield className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Admin Login Required
            </h1>
            
            <p className="text-gray-600 mb-8">
              Please log in to access the admin dashboard.
            </p>
            
            <Button
              onClick={() => window.location.href = "/api/login?redirect=/admin"}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              data-testid="button-admin-login"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Log In with Replit
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!adminStats) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  const calculateGrowth = (current: number, total: number) => {
    if (total === 0) return 0;
    const lastMonth = total - current;
    if (lastMonth === 0) return 100;
    return ((current - lastMonth) / lastMonth * 100);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 rounded-3xl p-12">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-5xl font-black text-gray-900 flex items-center justify-center mb-4" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full p-4 mr-6">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-2xl text-gray-700">Manage customers, monitor performance, and track revenue</p>
            </div>
            <Button 
              onClick={() => navigate("/admin/users")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 text-lg rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 ml-8"
            >
              <Users className="h-5 w-5 mr-3" />
              Manage Users
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-black" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Total Users</CardTitle>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gray-900 mb-2">{formatNumber(adminStats.totalUsers)}</div>
            <p className="text-sm text-gray-600 font-medium">
              +{formatNumber(adminStats.thisMonthUsers)} this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-black" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Total Revenue</CardTitle>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-full p-3">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gray-900 mb-2">{formatCurrency(adminStats.totalRevenue)}</div>
            <p className="text-sm text-gray-600 font-medium">
              +{formatCurrency(adminStats.thisMonthRevenue)} this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-black" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Vehicle Lookups</CardTitle>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-3">
              <Car className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gray-900 mb-2">{formatNumber(adminStats.totalLookups)}</div>
            <p className="text-sm text-gray-600 font-medium">
              +{formatNumber(adminStats.thisMonthLookups)} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              This Month's Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">New Users</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{formatNumber(adminStats.thisMonthUsers)}</div>
                <div className="text-xs text-gray-500">
                  {calculateGrowth(adminStats.thisMonthUsers, adminStats.totalUsers).toFixed(1)}% growth
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Vehicle Lookups</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{formatNumber(adminStats.thisMonthLookups)}</div>
                <div className="text-xs text-gray-500">
                  Avg: {(adminStats.thisMonthLookups / Math.max(adminStats.thisMonthUsers, 1)).toFixed(1)} per user
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Revenue</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{formatCurrency(adminStats.thisMonthRevenue)}</div>
                <div className="text-xs text-gray-500">
                  Avg: {formatCurrency(adminStats.thisMonthRevenue / Math.max(adminStats.thisMonthUsers, 1))} per user
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/admin/users")}
              data-testid="button-manage-users"
            >
              <Users className="mr-3 h-4 w-4" />
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/admin/transactions")}
              data-testid="button-view-transactions"
            >
              <CreditCard className="mr-3 h-4 w-4" />
              View All Transactions
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/admin/lookups")}
              data-testid="button-view-lookups"
            >
              <Car className="mr-3 h-4 w-4" />
              View All Lookups
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/admin/analytics")}
              data-testid="button-view-analytics"
            >
              <TrendingUp className="mr-3 h-4 w-4" />
              Advanced Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(adminStats.totalUsers)}</div>
              <div className="text-sm text-blue-600">Registered Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatNumber(adminStats.totalLookups)}</div>
              <div className="text-sm text-green-600">Total Searches</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(adminStats.totalRevenue)}</div>
              <div className="text-sm text-purple-600">Total Revenue</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {adminStats.totalUsers > 0 ? (adminStats.totalLookups / adminStats.totalUsers).toFixed(1) : '0'}
              </div>
              <div className="text-sm text-orange-600">Avg Searches/User</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}