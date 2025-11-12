import logoUrl from "@/assets/car-check-logo.webp";
import { Car, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, Link } from "wouter";

const packages = [
  {
    id: 'basic',
    name: 'Full Vehicle Check',
    credits: 1,
    price: 4.99,
    pricePerCredit: '4.99',
    description: 'Complete vehicle history report - 40% cheaper than competitors',
    features: ['1 Full Vehicle Check', 'Complete DVLA Records', 'MOT History & Status', 'Tax & Insurance Details', 'Vehicle Specifications', 'Email Support', '30 Day Credit Validity']
  },
  {
    id: 'starter',
    name: 'Starter Pack', 
    credits: 5,
    price: 19.99,
    pricePerCredit: '4.00',
    description: 'Great value for multiple vehicle checks',
    features: ['5 Full Vehicle Checks', 'Complete DVLA Records', 'MOT History & Status', 'Tax & Insurance Details', 'Vehicle Specifications', 'Email Support', '60 Day Credit Validity']
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 15,
    price: 49.99,
    pricePerCredit: '3.33',
    description: 'Best value for car dealers and regular users',
    features: ['15 Full Vehicle Checks', 'Complete DVLA Records', 'MOT History & Status', 'Tax & Insurance Details', 'Vehicle Specifications', 'Priority Support', '90 Day Credit Validity'],
    popular: true
  },
  {
    id: 'business',
    name: 'Business Pack',
    credits: 50,
    price: 149.99,
    pricePerCredit: '3.00',
    description: 'Professional solution for car dealers and businesses',
    features: ['50 Full Vehicle Checks', 'Complete DVLA Records', 'MOT History & Status', 'Tax & Insurance Details', 'Vehicle Specifications', 'Priority Support', '6 Month Credit Validity', 'Bulk Export', 'Business Invoice']
  }
];

export default function Pricing() {
  const [, navigate] = useLocation();

  const handleSelectPackage = (packageId: string) => {
    navigate(`/checkout?package=${packageId}`);
  };

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Vehicle Registration Checks</h1>
          <p className="text-xl text-gray-600 mb-6">From free basic checks to comprehensive vehicle history reports</p>
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            💰 Up to 40% cheaper than major competitors
          </div>
        </div>

        {/* Free Basic Check Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-16 border border-blue-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Free Basic Vehicle Check</h2>
            <p className="text-lg text-gray-600 mb-6">Get instant access to basic vehicle data from DVLA records</p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">100% Free</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Instant Results</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">No Signup Required</span>
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="E.g. AB12CDE" 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button 
                  onClick={() => window.open('/', '_blank')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Check Vehicle (FREE)
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                <span className="text-green-600">✓</span> No signup required • Completely free • Instant results
              </p>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-blue-600">🔒</span> Secure DVLA-approved data source
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">Free Basic Check Includes:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-gray-700">Make, Model & Year</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-gray-700">Engine Size & Fuel Type</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-gray-700">Current MOT Status</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-gray-700">Tax Status & Due Date</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700 text-center">
                <strong>Want more details?</strong> Upgrade to our Full Vehicle History Checks below for comprehensive MOT records, detailed specifications, and complete vehicle history.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Full Vehicle History Checks</h2>
          <p className="text-lg text-gray-600">Comprehensive reports with complete DVLA records, MOT history, and detailed specifications</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-primary-500 ring-2 ring-primary-500' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">£{pkg.price}</span>
                  <span className="text-gray-600 ml-2">for {pkg.credits} credits</span>
                </div>
                <p className="text-gray-600 mt-2">{pkg.description}</p>
                <p className="text-sm text-primary-600 font-medium">£{pkg.pricePerCredit} per lookup</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSelectPackage(pkg.id)}
                  className={`w-full ${pkg.popular ? 'bg-primary-600 hover:bg-primary-700' : ''}`}
                  variant={pkg.popular ? 'default' : 'outline'}
                >
                  Select Package
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Car className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900">Full DVLA Data</h3>
              <p className="text-sm text-gray-600 mt-1">Complete vehicle information including MOT, tax, and emissions</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900">Instant Results</h3>
              <p className="text-sm text-gray-600 mt-1">Get vehicle details within seconds of entering the registration</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Car className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900">Secure Platform</h3>
              <p className="text-sm text-gray-600 mt-1">Your data is protected with enterprise-grade security</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900">Professional Support</h3>
              <p className="text-sm text-gray-600 mt-1">Expert assistance when you need it most</p>
            </div>
          </div>
        </div>

        {/* Competitive Comparison */}
        <div className="mt-16 bg-white rounded-lg shadow-lg border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How We Compare</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Package</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">HG Verified Vehicle Check</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">UK Vehicle History</th>
                  <th className="text-left py-3 px-4 font-semibold text-green-600">Your Savings</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">1 Check</td>
                  <td className="py-3 px-4 text-green-600 font-bold">£4.99</td>
                  <td className="py-3 px-4 text-gray-600">£5.00</td>
                  <td className="py-3 px-4 text-green-600 font-medium">£0.01</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">5 Checks</td>
                  <td className="py-3 px-4 text-green-600 font-bold">£19.99 (£4.00 each)</td>
                  <td className="py-3 px-4 text-gray-600">£20.00 (£4.00 each)</td>
                  <td className="py-3 px-4 text-green-600 font-medium">£0.01</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">10+ Checks</td>
                  <td className="py-3 px-4 text-green-600 font-bold">£49.99 for 15 (£3.33 each)</td>
                  <td className="py-3 px-4 text-gray-600">£35.00 for 10 (£3.50 each)</td>
                  <td className="py-3 px-4 text-green-600 font-medium">50% more checks</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">All packages include the same comprehensive vehicle data: MOT records, tax status, specifications, and more</p>
          </div>
        </div>
      </main>
    </div>
  );
}