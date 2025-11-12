import logoUrl from "@/assets/car-check-logo.webp";
import { Car, ArrowLeft, Code, Key, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, Link } from "wouter";

export default function ApiDocs() {
  const [, navigate] = useLocation();

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
                <span className="text-xl font-bold text-gray-900">HG Verified Vehicle Check</span>
              </Link>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h1>
          <p className="text-xl text-gray-600">Integrate vehicle data lookup into your applications</p>
        </div>

        <div className="space-y-8">
          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary-600" />
                <span>Getting Started</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                The HG Verified Vehicle Check API allows you to integrate vehicle data lookup functionality into your applications. 
                Our REST API provides instant access to comprehensive DVLA vehicle information.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Base URL</h3>
              <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                https://your-domain.replit.app/api
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-primary-600" />
                <span>Authentication</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                API access requires authentication. Contact support to get your API key for programmatic access.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Header Format</h3>
              <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                Authorization: Bearer YOUR_API_KEY
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Lookup Endpoint */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-primary-600" />
                <span>Vehicle Lookup Endpoint</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">POST /api/vehicle-lookup</h3>
                <p className="text-gray-600 mb-4">
                  Retrieve comprehensive vehicle information using a UK registration number.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
                <div className="bg-gray-100 p-4 rounded-md">
                  <pre className="text-sm"><code>{`{
  "registration": "AB12CDE"
}`}</code></pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
                <div className="bg-gray-100 p-4 rounded-md">
                  <pre className="text-sm"><code>{`{
  "success": true,
  "vehicleData": {
    "registration": "AB12CDE",
    "make": "Ford",
    "model": "Focus",
    "year": 2019,
    "engineSize": "1498cc",
    "fuelType": "Petrol",
    "colour": "Blue",
    "firstRegistration": "15 March 2019",
    "co2Emissions": "128 g/km",
    "euroStatus": "Euro 6",
    "motExpiry": "15 March 2025",
    "motResult": "Pass",
    "mileage": "45,632 miles",
    "taxExpiry": "31 October 2024",
    "taxBand": "C (£35/year)",
    "sornStatus": "No"
  },
  "remainingCredits": 49
}`}</code></pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Responses */}
          <Card>
            <CardHeader>
              <CardTitle>Error Responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Insufficient Credits (402)</h4>
                <div className="bg-gray-100 p-3 rounded-md">
                  <pre className="text-sm"><code>{`{
  "message": "Insufficient credits. Please purchase more credits to continue."
}`}</code></pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Invalid Registration (400)</h4>
                <div className="bg-gray-100 p-3 rounded-md">
                  <pre className="text-sm"><code>{`{
  "success": false,
  "message": "Invalid registration number format"
}`}</code></pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Unauthorized (401)</h4>
                <div className="bg-gray-100 p-3 rounded-md">
                  <pre className="text-sm"><code>{`{
  "message": "Unauthorized"
}`}</code></pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>100 requests per minute per API key</li>
                <li>Each successful lookup consumes 1 credit</li>
                <li>Failed lookups do not consume credits</li>
                <li>Rate limits are reset every minute</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Need API Access?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                API access is available for Business plan customers. Contact our support team to get your API key and integration assistance.
              </p>
              <Button>Contact Support</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}