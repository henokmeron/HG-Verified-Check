import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import UnifiedReportDisplay from "@/components/UnifiedReportDisplay";
import { Search, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TestCheck() {
  const [registration, setRegistration] = useState("FN59XPZ");
  const [checkType, setCheckType] = useState<"free" | "full" | "test-full">("free");
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [reportRaw, setReportRaw] = useState<any>(null);
  const { toast } = useToast();

  const handleLookup = async () => {
    if (!registration.trim()) {
      toast({
        title: "Error",
        description: "Please enter a registration number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setVehicleData(null);
    setReportRaw(null);

    try {
      const response = await fetch('/api/public/vehicle-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registration: registration.trim(),
          checkType: checkType
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lookup failed');
      }

      const data = await response.json();
      
      // Handle both response formats
      const vData = data.vehicleData || data.data;
      const rData = data.reportRaw || data;

      setVehicleData(vData);
      setReportRaw(rData);

      toast({
        title: "Success",
        description: `${checkType === 'free' ? 'Free' : checkType === 'test-full' ? 'Test Full (Mock)' : 'Full'} check completed for ${registration.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Lookup Failed",
        description: error.message || "Failed to lookup vehicle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Vehicle Check Test Page
            </h1>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Test Vehicle Lookup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Registration Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Registration
                </label>
                <Input
                  type="text"
                  placeholder="Enter registration (e.g., FN59XPZ)"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value.toUpperCase())}
                  className="text-lg font-bold uppercase"
                  maxLength={8}
                />
              </div>

              {/* Check Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check Type
                </label>
                <div className="flex gap-4 flex-wrap">
                  <Button
                    type="button"
                    variant={checkType === 'free' ? 'default' : 'outline'}
                    onClick={() => setCheckType('free')}
                    className="flex-1"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Free Check (Freecheckapi)
                  </Button>
                  <Button
                    type="button"
                    variant={checkType === 'full' ? 'default' : 'outline'}
                    onClick={() => setCheckType('full')}
                    className="flex-1"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Full Check (VIDCheck)
                  </Button>
                  <Button
                    type="button"
                    variant={checkType === 'test-full' ? 'default' : 'outline'}
                    onClick={() => setCheckType('test-full')}
                    className="flex-1"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Test Full (Mock)
                  </Button>
                </div>
              </div>

              {/* Info Badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  Current Package: <strong className="ml-1">
                    {checkType === 'full' ? 'vidcheck' : 'Freecheckapi'}
                  </strong>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Test Registration: <strong className="ml-1">{registration || 'None'}</strong>
                </Badge>
              </div>

              {/* Submit Button */}
              <Button
                type="button"
                onClick={handleLookup}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {checkType === 'full' ? <Shield className="h-5 w-5 mr-2" /> : <Search className="h-5 w-5 mr-2" />}
                    Run {checkType === 'full' ? 'Full' : 'Free'} Check
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expected Sections Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-sm">Expected Sections for Each Package</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 text-green-600">
                  Free Check (Freecheckapi) - 4 Sections:
                </h4>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>✓ Vehicle Details</li>
                  <li>✓ Model Details</li>
                  <li>✓ MOT History Details</li>
                  <li>✓ Vehicle Tax Details</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-blue-600">
                  Full Check (vidcheck) - ALL 13 Sections:
                </h4>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>✓ Vehicle Details</li>
                  <li>✓ Model Details</li>
                  <li>✓ MOT History Details</li>
                  <li>✓ Vehicle Tax Details</li>
                  <li>✓ PNC Details (Police checks)</li>
                  <li>✓ MIAFTR Details (Write-offs)</li>
                  <li>✓ Finance Details</li>
                  <li>✓ Valuation Details</li>
                  <li>✓ Spec & Options Details</li>
                  <li>✓ Battery Details</li>
                  <li>✓ Tyre Details</li>
                  <li>✓ Vehicle Images</li>
                  <li>✓ Mileage Check Details</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Display */}
        {vehicleData && reportRaw && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                Report Results - {vehicleData.registration}
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                Package: {checkType === 'free' ? 'Freecheckapi (Free Check)' : checkType === 'test-full' ? 'VIDCheck (Test Mock)' : 'VIDCheck (Full Check)'}
              </p>
            </div>
            <UnifiedReportDisplay
              vehicleData={vehicleData}
              reportRaw={reportRaw}
              isPremium={checkType !== 'free'}
            />
          </div>
        )}

        {/* No Results Message */}
        {!loading && !vehicleData && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                Enter a registration number and click "Run Check" to see results
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


