import { Code, Key, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import AppLayout from "@/components/AppLayout";

export default function ApiDocs() {
  const [, navigate] = useLocation();

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Return Button */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/app">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Return to Dashboard</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Service Documentation</h1>
                <p className="text-sm text-gray-600">Information about our vehicle check service</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="space-y-8">
          {/* Service Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary-600" />
                <span>Service Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                HG Verified Vehicle Check provides instant access to comprehensive Vehicle Data UK vehicle information through our web-based platform.
                We currently offer vehicle checks through our website interface only.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Note</h3>
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                <p className="text-gray-700">API access is not currently available. All vehicle checks must be performed through our web interface.</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Provided */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-primary-600" />
                <span>Vehicle Data Provided</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Vehicle Information</h3>
                <p className="text-gray-600 mb-4">
                  Our service provides the following data points for each vehicle check:
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Available Data Fields (in order of importance)</h4>
                <div className="bg-gray-100 p-4 rounded-md space-y-4">
                  {/* Critical Safety & Legal Information */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Critical Safety & Legal Information</h5>
                    <ul className="space-y-1 text-sm ml-4">
                      <li>• MOT Expiry Date & Status - Legal requirement for road use</li>
                      <li>• MOT Test History - Shows failures, advisories, and safety issues</li>
                      <li>• Tax Expiry Date - Legal requirement for road use</li>
                      <li>• SORN Status - Whether vehicle is declared off-road</li>
                      <li>• Certificate of Destruction - If vehicle has been scrapped</li>
                      <li>• Stolen Status (MIAFTR Check) - Whether vehicle is reported stolen</li>
                      <li>• Insurance Write-off Status - Category of damage if written off</li>
                    </ul>
                  </div>
                  
                  {/* Essential Vehicle Identification */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Essential Vehicle Identification</h5>
                    <ul className="space-y-1 text-sm ml-4">
                      <li>• Registration Number (VRM) - Primary identifier</li>
                      <li>• Make & Model - Basic vehicle identification</li>
                      <li>• VIN (Vehicle Identification Number) - Unique vehicle identifier</li>
                      <li>• Year of Manufacture - Age of vehicle</li>
                      <li>• Engine Number - For verification purposes</li>
                    </ul>
                  </div>
                  
                  {/* Ownership & History */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Ownership & History</h5>
                    <ul className="space-y-1 text-sm ml-4">
                      <li>• Number of Previous Keepers - Ownership history</li>
                      <li>• Keeper Change Dates - When ownership changed</li>
                      <li>• V5C Certificate Issue Dates - Documentation history</li>
                      <li>• Recorded Mileage - Current and historical readings</li>
                      <li>• Mileage Anomalies - Potential clocking issues</li>
                      <li>• Finance & PNC Check - Outstanding finance status</li>
                    </ul>
                  </div>
                  
                  {/* Technical Specifications */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Technical Specifications</h5>
                    <ul className="space-y-1 text-sm ml-4">
                      <li>• Engine Size (CC) - Engine capacity</li>
                      <li>• Fuel Type - Petrol/Diesel/Electric/Hybrid</li>
                      <li>• Transmission Type - Manual/Automatic</li>
                      <li>• Number of Doors - Body configuration</li>
                      <li>• Number of Seats - Passenger capacity</li>
                      <li>• Body Type - Hatchback/Saloon/SUV etc.</li>
                    </ul>
                  </div>
                  
                  {/* Environmental & Running Costs */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Environmental & Running Costs</h5>
                    <ul className="space-y-1 text-sm ml-4">
                      <li>• CO2 Emissions - Environmental impact</li>
                      <li>• Euro Status - Emissions standard</li>
                      <li>• Tax Band - Annual tax category</li>
                      <li>• Annual Tax Cost - Yearly road tax amount</li>
                      <li>• Fuel Consumption (MPG) - Urban/Extra Urban/Combined</li>
                    </ul>
                  </div>
                  
                  {/* Additional Details */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Additional Details</h5>
                    <ul className="space-y-1 text-sm ml-4">
                      <li>• Current Colour - Vehicle appearance</li>
                      <li>• Colour Changes - Historical color modifications</li>
                      <li>• First Registration Date - When first registered</li>
                      <li>• Date First Registered in UK - Import date if applicable</li>
                      <li>• Import/Export Status - Whether imported/exported</li>
                      <li>• Plate Changes - Registration number changes</li>
                    </ul>
                  </div>
                  
                  {/* Performance & Dimensions */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Performance & Dimensions</h5>
                    <ul className="space-y-1 text-sm ml-4">
                      <li>• BHP/Power Output - Engine performance</li>
                      <li>• Top Speed - Maximum speed capability</li>
                      <li>• 0-60 MPH Time - Acceleration performance</li>
                      <li>• Weight (Kerb/Gross) - Vehicle weights</li>
                      <li>• Length/Width/Height - Vehicle dimensions</li>
                      <li>• Wheelbase - Distance between axles</li>
                    </ul>
                  </div>
                  
                  {/* Safety Ratings & Features */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Safety Ratings & Features</h5>
                    <ul className="space-y-1 text-sm ml-4">
                      <li>• Euro NCAP Rating - Safety star rating</li>
                      <li>• Safety Features - ABS, airbags, etc.</li>
                      <li>• Warranty Information - Manufacturer warranty details</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Use */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use Our Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Web Interface</h4>
                <p className="text-gray-600 mb-3">
                  All vehicle checks are performed through our user-friendly web interface:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Sign up for an account or use the free check option</li>
                  <li>Purchase credits for unlimited lookups (optional)</li>
                  <li>Enter the vehicle registration number</li>
                  <li>Click "Check Vehicle" to get instant results</li>
                  <li>View and export comprehensive vehicle data</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have any questions about our vehicle check service or need assistance, please contact our support team.
              </p>
              <Link href="/support">
                <Button>
                  Contact Support
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        </main>
      </div>
    </AppLayout>
  );
}