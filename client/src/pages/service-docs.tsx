
<line_number>1</line_number>
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, ExternalLink, Book } from "lucide-react";
import { Link } from "wouter";
import AppLayout from "@/components/AppLayout";

export default function ServiceDocs() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Return Button */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/app/dashboard">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6">
            
            {/* Service Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5 text-blue-600" />
                  <span>Service Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  HG Verified Vehicle Check provides instant access to comprehensive Vehicle Data UK vehicle information through our web-based platform. We currently offer vehicle checks through our website interface only.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">Note</h4>
                  <p className="text-sm text-amber-800">
                    API access is not currently available. All vehicle checks must be performed through our web interface.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How to Use Our Service */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span>How to Use Our Service</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Step-by-step guide for using the HG Verified Vehicle Check platform.
                </p>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">1. Free Basic Check</h4>
                    <p className="text-sm text-gray-600 mb-2">Get basic vehicle information without signing up:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>Visit our public lookup page</li>
                      <li>Enter a valid UK registration number</li>
                      <li>View basic vehicle details instantly</li>
                      <li>Limited to 3 free checks per day</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">2. Comprehensive Check</h4>
                    <p className="text-sm text-gray-600 mb-2">Access full vehicle history and specifications:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>Create an account or sign in</li>
                      <li>Purchase credits (£7 per check)</li>
                      <li>Enter vehicle registration</li>
                      <li>Access full MOT history, valuation, and more</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">3. Bulk Checks</h4>
                    <p className="text-sm text-gray-600 mb-2">For multiple vehicle checks:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>Purchase credit packages for better value</li>
                      <li>5, 15, or 50 check bundles available</li>
                      <li>Credits never expire</li>
                      <li>Export history as CSV</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <span>Service Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Our comprehensive vehicle checks include the following data points:
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Included in Reports</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Full MOT history with advisories</li>
                    <li>• Tax and SORN status</li>
                    <li>• Stolen vehicle check (PNC)</li>
                    <li>• Insurance write-off records</li>
                    <li>• Outstanding finance check</li>
                    <li>• Mileage verification</li>
                    <li>• UKVD market valuation</li>
                    <li>• CO2 emissions and fuel efficiency</li>
                    <li>• Factory specifications</li>
                    <li>• Number of previous owners</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Support & Help */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span>Support & Help</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Need assistance? We're here to help with any questions about our service.
                </p>
                <div className="space-y-3">
                  <Link href="/support">
                    <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>Visit Support Center</span>
                    </Button>
                  </Link>
                  <Link href="/faq">
                    <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>View FAQ</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
