import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Shield, Lock } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface PublicLookupFormProps {
  onResult?: (data: any) => void;
}

export default function PublicVehicleLookupForm({ onResult }: PublicLookupFormProps) {
  const [registration, setRegistration] = useState("");
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();

  // Check for URL parameters and pre-fill registration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const regParam = urlParams.get('reg');
    if (regParam) {
      setRegistration(regParam.toUpperCase());
      // Clear the URL parameter after setting it
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <section className="mb-8">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Separate mutations for free and premium lookups
  const freeLookupMutation = useMutation({
    mutationFn: async (reg: string) => {
      const response = await fetch('/api/public/vehicle-lookup', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          registration: reg, 
          checkType: 'basic'
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to lookup vehicle";
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            // Use the more detailed message if available
            errorMessage = error.message || error.error || errorMessage;
            
            // If it's a sandbox error, provide helpful guidance
            if (error.error && error.error.includes('Sandbox')) {
              errorMessage = "API Key Configuration Issue: Your API key needs to be configured for the current mode. Please check with Vehicle Data UK.";
            }
          } catch (e) {
            errorMessage = `Server error (${response.status})`;
          }
        } else {
          errorMessage = `Server error: ${response.status} - ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Handle both response formats: data.vehicleData OR data.data
      const vehicleData = data.vehicleData || data.data;
      const registration = vehicleData?.registration || 'Unknown';
      
      toast({
        title: 'Vehicle Report Generated',
        description: `${registration} report ready to view below`,
      });

      if (onResult) {
        onResult(data);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Basic Lookup Failed",
        description: error.message || "Failed to lookup vehicle details",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // No scroll manipulation needed here
    },
  });

  const premiumLookupMutation = useMutation({
    mutationFn: async (reg: string) => {
      const response = await fetch('/api/vehicle/premium-check', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({ 
          regNumber: reg
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to lookup vehicle";
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            // Use the more detailed message if available
            errorMessage = error.message || error.error || errorMessage;
            
            // If it's a sandbox error, provide helpful guidance
            if (error.error && error.error.includes('Sandbox')) {
              errorMessage = "API Key Configuration Issue: Your API key needs to be configured for the current mode. Please check with Vehicle Data UK.";
            }
          } catch (e) {
            errorMessage = `Server error (${response.status})`;
          }
        } else {
          errorMessage = `Server error: ${response.status} - ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Handle both response formats: data.vehicleData OR data.data
      const vehicleData = data.vehicleData || data.data;
      const registration = vehicleData?.registration || 'Unknown';
      
      toast({
        title: 'Premium Report Generated',
        description: `${registration} comprehensive report ready (1 credit used)`,
      });

      // Invalidate and refetch user data to update credit balance
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-lookups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });

      if (onResult) {
        onResult(data);
      }
    },
    onError: (error: any) => {
      if (error.message && error.message.includes("Insufficient credits")) {
        toast({
          title: "💳 Credits Required",
          description: "You need credits for Premium checks. Click 'View Premium Packages' below to purchase.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Premium Lookup Failed",
          description: error.message || "Failed to lookup vehicle details",
          variant: "destructive",
        });
      }
    },
    onSettled: () => {
      // No scroll manipulation needed here
    },
  });

  const validateRegistration = () => {
    const cleanReg = registration.trim().toUpperCase().replace(/\s/g, '');
    console.log('Validating registration:', cleanReg, 'from input:', registration);
    
    if (!cleanReg || cleanReg.length === 0) {
      console.log('Validation failed: empty registration');
      toast({
        title: "Invalid Registration",
        description: "Please enter a vehicle registration number",
        variant: "destructive",
      });
      return null;
    }

    // More lenient UK registration format validation
    // Accepts formats like: AB12CDE, AB12 CDE, AB123CD, AB1CDE, etc.
    // Pattern: 1-3 letters, 1-4 numbers, 0-3 letters (total 2-10 chars)
    const regPattern = /^[A-Z]{1,3}[0-9]{1,4}[A-Z]{0,3}$/;
    
    if (!regPattern.test(cleanReg)) {
      console.log('Registration pattern test failed for:', cleanReg, 'pattern:', regPattern);
      // Still allow it through if it's at least 2 characters (very lenient for testing)
      if (cleanReg.length < 2) {
        toast({
          title: "Invalid Format",
          description: "Please enter a valid UK registration number (e.g., AB12 CDE)",
          variant: "destructive",
        });
        return null;
      }
      // For now, allow any 2+ character alphanumeric string for testing
      console.log('Allowing registration despite pattern mismatch (lenient mode):', cleanReg);
    }

    console.log('Validation passed, returning:', cleanReg);
    return cleanReg;
  };

  const handleFreeCheck = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔵 Free Check button clicked!', {
      registration,
      isFreePending: freeLookupMutation.isPending,
      isPremiumPending: premiumLookupMutation.isPending
    });
    
    // Check if any request is already in flight
    if (freeLookupMutation.isPending || premiumLookupMutation.isPending) {
      console.log('⚠️ Request already in flight, skipping');
      return;
    }
    
    const cleanReg = validateRegistration();
    console.log('✅ Validated registration:', cleanReg);
    if (!cleanReg) {
      console.log('❌ Validation failed - no clean registration');
      return;
    }
    
    try {
      console.log('🚀 Calling free lookup mutation with:', cleanReg);
      // Only call the free check API
      const result = await freeLookupMutation.mutateAsync(cleanReg);
      console.log('✅ Free lookup mutation completed:', result);
    } catch (error: any) {
      console.error('❌ Free check error:', error);
      // Error is already handled by mutation's onError
    }
  };

  const handlePremiumCheck = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if any request is already in flight
    if (freeLookupMutation.isPending || premiumLookupMutation.isPending) return;
    
    const cleanReg = validateRegistration();
    if (!cleanReg) return;
    
    try {
      if (!isAuthenticated) {
        // User not logged in, redirect to signup
        window.location.href = '/api/login?redirect=/pricing';
        return;
      }
      
      // Check if user has credits
      if (user && user.creditBalance <= 0) {
        // User has no credits, redirect to pricing
        toast({
          title: "💳 Credits Required",
          description: "You need credits for Premium checks. Redirecting to purchase page...",
          variant: "destructive",
        });
        window.location.href = '/pricing';
        return;
      }
      
      // User is authenticated and has credits, perform the premium check
      await premiumLookupMutation.mutateAsync(cleanReg);
    } finally {
      // No scroll manipulation needed here
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

  return (
    <div className="uk-plate-container">
      {/* UK Plate Style Input */}
      <div className="uk-plate">
        <div className="uk-band" aria-label="UK registration plate">
          <div className="uk-flag">
            {/* Proper UK Flag SVG */}
            <svg width="35" height="20" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
              {/* Blue background */}
              <rect width="60" height="30" fill="#012169"/>
              {/* White diagonal cross */}
              <path d="M0,0 L60,30 M60,0 L0,30" stroke="white" strokeWidth="6"/>
              {/* Red diagonal cross */}
              <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
              {/* White cross */}
              <path d="M30,0 L30,30 M0,15 L60,15" stroke="white" strokeWidth="10"/>
              {/* Red cross */}
              <path d="M30,0 L30,30 M0,15 L60,15" stroke="#C8102E" strokeWidth="6"/>
            </svg>
          </div>
          <span className="uk-band-text">UK</span>
        </div>
        <input
          type="text"
          className="uk-plate-input"
          aria-label="Vehicle registration"
          placeholder="ENTER REG"
          value={registration}
          onChange={handleInputChange}
          disabled={freeLookupMutation.isPending || premiumLookupMutation.isPending}
          maxLength={7}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      
      {/* Buttons */}
      <div className="uk-plate-buttons">
        <button 
          id="freeCheckBtn"
          className="uk-submit uk-submit-free" 
          onClick={(e) => {
            console.log('🔴 Button onClick fired directly!', e);
            handleFreeCheck(e);
          }}
          disabled={freeLookupMutation.isPending || premiumLookupMutation.isPending}
          type="button"
          style={{ pointerEvents: 'auto', zIndex: 100, position: 'relative' }}
        >
          {freeLookupMutation.isPending ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Search className="h-4 w-4 mr-2" />
              Free Check
            </span>
          )}
        </button>
        
        <button 
          id="premiumCheckBtn"
          className="uk-submit uk-submit-full" 
          onClick={(e) => {
            console.log('🔴 Premium Button onClick fired directly!', e);
            handlePremiumCheck(e);
          }}
          disabled={freeLookupMutation.isPending || premiumLookupMutation.isPending}
          type="button"
          style={{ pointerEvents: 'auto', zIndex: 100, position: 'relative' }}
        >
          {premiumLookupMutation.isPending ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Shield className="h-4 w-4 mr-2" />
              Full Report £7
            </span>
          )}
        </button>
      </div>
      
      {/* Security Badge */}
      <div className="text-center text-sm text-gray-600 mt-4">
        <div className="flex items-center justify-center gap-2">
          <Lock className="h-4 w-4" />
          <span>Secure • Official VDGI Partner</span>
        </div>
      </div>
    </div>
  );
}