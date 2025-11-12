import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, CreditCard, Car, ChevronLeft, Calendar } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface AdminStats {
  totalUsers: number;
  totalLookups: number;
  totalRevenue: number;
  thisMonthUsers: number;
  thisMonthLookups: number;
  thisMonthRevenue: number;
}

export default function AdminAnalytics() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login?redirect=/admin/analytics";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !adminStats) {
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
    if (lastMonth === 0) return current > 0 ? 100 : 0;
    return ((current - lastMonth) / lastMonth * 100);
  };

  const avgRevenuePerUser = adminStats.totalUsers > 0 ? adminStats.totalRevenue / adminStats.totalUsers : 0;
  const avgLookupsPerUser = adminStats.totalUsers > 0 ? adminStats.totalLookups / adminStats.totalUsers : 0;
  const avgRevenuePerLookup = adminStats.totalLookups > 0 ? adminStats.totalRevenue / adminStats.totalLookups : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-2"
          data-testid="button-back-admin"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Admin Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="h-8 w-8 mr-3 text-primary-600" />
          Advanced Analytics
        </h1>
        <p className="text-gray-600 mt-1">Detailed insights into business performance and customer behavior</p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(adminStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatCurrency(adminStats.thisMonthRevenue)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(adminStats.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatNumber(adminStats.thisMonthUsers)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicle Searches</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(adminStats.totalLookups)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatNumber(adminStats.thisMonthLookups)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgRevenuePerUser)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime value per customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Business Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Average Lookups per User</span>
                <span className="text-2xl font-bold text-blue-600">{avgLookupsPerUser.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(avgLookupsPerUser * 10, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Revenue per Lookup</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(avgRevenuePerLookup)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(avgRevenuePerLookup * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">User Acquisition Rate</span>
                <span className="text-2xl font-bold text-purple-600">
                  {adminStats.totalUsers > 0 ? ((adminStats.thisMonthUsers / adminStats.totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((adminStats.thisMonthUsers / Math.max(adminStats.totalUsers, 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-green-900">User Growth</div>
                <div className="text-sm text-green-600">Month over month</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                +{calculateGrowth(adminStats.thisMonthUsers, adminStats.totalUsers).toFixed(1)}%
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-blue-900">Usage Growth</div>
                <div className="text-sm text-blue-600">Monthly lookups</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                +{calculateGrowth(adminStats.thisMonthLookups, adminStats.totalLookups).toFixed(1)}%
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <div>
                <div className="font-medium text-purple-900">Revenue Growth</div>
                <div className="text-sm text-purple-600">Monthly revenue</div>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                +{calculateGrowth(adminStats.thisMonthRevenue, adminStats.totalRevenue).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
              <div className="text-3xl font-bold mb-2">{formatNumber(adminStats.totalUsers)}</div>
              <div className="text-blue-100">Total Registered Users</div>
              <div className="text-sm text-blue-200 mt-2">
                Growing by {adminStats.thisMonthUsers} users monthly
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
              <div className="text-3xl font-bold mb-2">{formatNumber(adminStats.totalLookups)}</div>
              <div className="text-green-100">Vehicle Searches Completed</div>
              <div className="text-sm text-green-200 mt-2">
                {adminStats.thisMonthLookups} searches this month
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white">
              <div className="text-3xl font-bold mb-2">{formatCurrency(adminStats.totalRevenue)}</div>
              <div className="text-purple-100">Total Revenue Generated</div>
              <div className="text-sm text-purple-200 mt-2">
                {formatCurrency(adminStats.thisMonthRevenue)} earned this month
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}