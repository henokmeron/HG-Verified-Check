import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Star, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function VehicleLookupForm() {
  const [registration, setRegistration] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Separate loading states for each button
  const [isFreeLoading, setIsFreeLoading] = useState(false);
  const [isPremiumLoading, setIsPremiumLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleData, setVehicleData] = useState<any>(null); // Assuming data structure
  const [showResults, setShowResults] = useState(false);

  const regNumber = registration; // Alias for clarity in handlers

  // Free lookup mutation - Replaced with direct fetch in handlers for clarity as per thought process
  const freeLookupMutation = useMutation({
    mutationFn: async (reg: string) => {
      console.log('Triggering FREE API call only');
      const response = await fetch('/api/vehicle/lookup/free', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registration: reg }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to lookup vehicle");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Basic Vehicle Check Complete (FREE)",
        description: `Retrieved basic details for ${data.vehicleData.registration}`,
      });

      // Store the latest lookup result for display (free lookup - no reportRaw)
      queryClient.setQueryData(["latest-vehicle-lookup"], {
        vehicleData: data.vehicleData,
        reportRaw: data.reportRaw || null, // Free lookups won't have reportRaw
        success: data.success,
        message: data.message
      });
    },
    onError: (error: any) => {
      toast({
        title: "Free Lookup Failed",
        description: error.message || "Failed to lookup vehicle details",
        variant: "destructive",
      });
    },
  });

  // Paid lookup mutation - Replaced with direct fetch in handlers for clarity as per thought process
  const premiumLookupMutation = useMutation({
    mutationFn: async (reg: string) => {
      console.log('Triggering PREMIUM API call only');
      const response = await fetch('/api/vehicle/lookup/premium', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registration: reg }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to lookup vehicle");
      }

      return response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "Comprehensive Vehicle Check Complete",
        description: `Successfully retrieved full report for ${data.vehicleData.registration} (1 credit used)`,
      });

      // Force immediate refetch of user data to update credit balance
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-lookups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });

      // Store the latest lookup result for display (including reportRaw for comprehensive reports)
      queryClient.setQueryData(["latest-vehicle-lookup"], {
        vehicleData: data.vehicleData,
        reportRaw: data.reportRaw, // This will contain the full VIDcheck JSON for comprehensive display
        success: data.success,
        message: data.message
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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

      toast({
        title: "Comprehensive Lookup Failed",
        description: error.message || "Failed to lookup vehicle details",
        variant: "destructive",
      });
    },
  });

  // Handlers modified to call specific endpoints and manage local state
  const handleFreeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a registration number",
        variant: "destructive",
      });
      return;
    }

    setIsFreeLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vehicle/free-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regNumber: regNumber.trim().toUpperCase()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch vehicle data');
      }

      const data = await response.json();
      toast({
        title: "Basic Vehicle Check Complete (FREE)",
        description: `Retrieved basic details for ${data.vehicleData.registration}`,
      });
      
      queryClient.setQueryData(["latest-vehicle-lookup"], {
        vehicleData: data.vehicleData,
        reportRaw: data.reportRaw || null,
        success: data.success,
        message: data.message
      });
    } catch (error: any) {
      console.error('Free check error:', error);
      setError(error.message || 'An unexpected error occurred');
      toast({
        title: "Error",
        description: error.message || 'Failed to perform free check',
        variant: "destructive",
      });
    } finally {
      setIsFreeLoading(false);
    }
  };

  const handlePremiumCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a registration number",
        variant: "destructive",
      });
      return;
    }

    setIsPremiumLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vehicle/premium-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regNumber: regNumber.trim().toUpperCase()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch vehicle data');
      }

      const data = await response.json();
      toast({
        title: "Comprehensive Vehicle Check Complete",
        description: `Successfully retrieved full report for ${data.vehicleData.registration} (1 credit used)`,
      });

      // Force immediate refetch of user data to update credit balance
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-lookups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });

      queryClient.setQueryData(["latest-vehicle-lookup"], {
        vehicleData: data.vehicleData,
        reportRaw: data.reportRaw,
        success: data.success,
        message: data.message
      });
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
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

      setError(error.message || 'An unexpected error occurred');
      toast({
        title: "Comprehensive Lookup Failed",
        description: error.message || 'Failed to perform premium check',
        variant: "destructive",
      });
    } finally {
      setIsPremiumLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent, lookupType: 'free' | 'paid') => {
    e.preventDefault();

    const cleanReg = registration.trim().toUpperCase();
    if (!cleanReg) {
      toast({
        title: "Invalid Registration",
        description: "Please enter a vehicle registration number",
        variant: "destructive",
      });
      return;
    }

    // Basic UK registration format validation
    const regPattern = /^[A-Z]{1,3}[0-9]{1,4}[A-Z]{0,3}$/;
    if (!regPattern.test(cleanReg.replace(/\s/g, ''))) {
      toast({
        title: "Invalid Format",
        description: "Please enter a valid UK registration number (e.g., AB12 CDE)",
        variant: "destructive",
      });
      return;
    }

    if (lookupType === 'free') {
      handleFreeCheck(e); // Call the specific handler
    } else {
      handlePremiumCheck(e); // Call the specific handler
    }
  };

  const formatRegistration = (value: string) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Limit to 7 characters
    if (clean.length > 7) {
      return clean.substring(0, 7);
    }

    return clean;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRegistration(e.target.value);
    setRegistration(formatted);
  };

  // Removed original isLoading as it's now managed locally and more granularly

  return (
    <section className="mb-8">
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Registration Lookup</h1>
            <p className="text-gray-600 font-normal">Choose your preferred vehicle check option</p>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Registration Input */}
            <div className="text-center mb-8">
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="e.g. AB12CDE"
                    value={registration}
                    onChange={handleInputChange}
                    autoComplete="off"
                    className="text-center text-lg font-mono uppercase tracking-wider !border-4 !border-blue-500 focus:!border-blue-600 focus:!ring-4 focus:!ring-blue-200 focus:!ring-offset-0"
                    disabled={isFreeLoading || isPremiumLoading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-8">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Secure Vehicle Data UK data source</span>
              </div>
            </div>

            {/* Check Options */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {/* Free Basic Check - Always show for all users */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-green-800">Basic Free Check Report</CardTitle>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      100% FREE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Basic vehicle details</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Make, model, year</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Basic MOT information</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>No signup required</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'free')}
                    disabled={isFreeLoading || isPremiumLoading || !registration}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                  >
                    {isFreeLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Free Check'
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Paid Comprehensive Check - Always visible */}
              <Card className={`border-2 transition-all duration-200 ${
                user && user.creditBalance > 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-300 bg-gray-50 opacity-75'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-lg ${
                      user && user.creditBalance > 0 ? 'text-blue-800' : 'text-gray-600'
                    }`}>Comprehensive Vehicle Report</CardTitle>
                    <Badge className={`${
                      user && user.creditBalance > 0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      <Star className="h-3 w-3 mr-1" />
                      {user && user.creditBalance > 0 ? 'RECOMMENDED' : '1 CREDIT'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${
                        user && user.creditBalance > 0 ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span>Complete vehicle history & mileage checks</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${
                        user && user.creditBalance > 0 ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span>Insurance write-off (MIAFTR) check</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${
                        user && user.creditBalance > 0 ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span>Finance & PNC stolen checks</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${
                        user && user.creditBalance > 0 ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span>Detailed MOT history & mileage records</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${
                        user && user.creditBalance > 0 ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span>Vehicle specifications & options</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${
                        user && user.creditBalance > 0 ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span>Downloadable PDF report</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={(e) => {
                      if (!user) {
                        // Redirect unauthenticated users to login
                        window.location.href = "/api/login?redirect=/dashboard";
                        return;
                      }
                      if (user.creditBalance <= 0) {
                        // Redirect users without credits to pricing
                        window.location.href = "/pricing";
                        return;
                      }
                      handleSubmit(e, 'paid');
                    }}
                    disabled={isFreeLoading || isPremiumLoading || !registration}
                    className={`w-full transition-all duration-200 ${
                      user && user.creditBalance > 0
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                    size="lg"
                  >
                    {isPremiumLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        {!user
                          ? 'Login for Premium Check'
                          : user.creditBalance <= 0
                          ? 'Buy Credits (£7.00)'
                          : 'Premium Vehicle Check'}
                      </>
                    )}
                  </Button>

                  {/* Credit status information */}
                  {!user && (
                    <div className="mt-3 text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      🔐 Sign up, then pay £7 for instant access to comprehensive UK vehicle data
                    </div>
                  )}

                  {user && user.creditBalance <= 0 && (
                    <div className="mt-3 text-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      💳 Pay £7 for instant access to comprehensive UK vehicle data
                    </div>
                  )}

                  {user && (
                    <div className="mt-3 text-center text-sm text-gray-600">
                      Available Credits: {user.creditBalance || 0}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}