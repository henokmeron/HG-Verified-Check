import logoUrl from "@/assets/car-check-logo.webp";
import { useState } from "react";
import { Link } from "wouter";
import { Car, Shield, Clock, Search, UserPlus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicVehicleLookupForm from "@/components/PublicVehicleLookupForm";
import PublicVehicleDetails from "@/components/PublicVehicleDetails";
import Footer from "@/components/Footer";

export default function PublicPage() {
  const [vehicleData, setVehicleData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLookupResult = (data: any) => {
    setVehicleData(data.vehicleData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <img 
                  src={logoUrl} 
                  alt="HG Verified Vehicle Check Logo" 
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold text-gray-900">HG Verified Vehicle Check</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">Home</Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium">About</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600 font-medium">Pricing</Link>
              <Link href="/faq" className="text-gray-700 hover:text-primary-600 font-medium">FAQ</Link>
              <Link href="/support" className="text-gray-700 hover:text-primary-600 font-medium">Support</Link>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Free Service Badge - hide on small screens */}
              <div className="hidden sm:block bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <span className="text-green-700 font-medium text-sm">
                  <Shield className="inline h-4 w-4 mr-1" />
                  100% FREE
                </span>
              </div>
              
              {/* Sign Up Button - hide on small screens */}
              <Button 
                onClick={() => window.location.href = "/api/login?redirect=/dashboard"}
                className="hidden sm:flex bg-primary-600 hover:bg-primary-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>

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
              <Link href="/" className="block text-gray-700 hover:text-primary-600 font-medium py-2">Home</Link>
              <Link href="/about" className="block text-gray-700 hover:text-primary-600 font-medium py-2">About</Link>
              <Link href="/pricing" className="block text-gray-700 hover:text-primary-600 font-medium py-2">Pricing</Link>
              <Link href="/faq" className="block text-gray-700 hover:text-primary-600 font-medium py-2">FAQ</Link>
              <Link href="/support" className="block text-gray-700 hover:text-primary-600 font-medium py-2">Support</Link>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200 mb-3">
                  <span className="text-green-700 font-medium text-sm">
                    <Shield className="inline h-4 w-4 mr-1" />
                    100% FREE
                  </span>
                </div>
                <Button 
                  onClick={() => window.location.href = "/api/login?redirect=/dashboard"}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free UK Vehicle Registration Check
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Get instant access to comprehensive vehicle data from DVLA records
          </p>
          
          {/* Feature highlights */}
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500 mb-8">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-purple-500" />
              <span>No Signup Required</span>
            </div>
          </div>
        </div>

        {/* Vehicle Lookup Form */}
        <PublicVehicleLookupForm onResult={handleLookupResult} />

        {/* Vehicle Details */}
        <div className="mt-8">
          <PublicVehicleDetails vehicleData={vehicleData} />
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completely Free</h3>
            <p className="text-gray-600">No hidden fees, no credit cards required. Check as many vehicles as you need.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-gray-600">Get comprehensive vehicle data in seconds, powered by official DVLA records.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Signup Required</h3>
            <p className="text-gray-600">Start checking vehicles immediately. No registration or personal details needed.</p>
          </div>
        </div>

        {/* Optional Signup CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to track your searches?</h2>
          <p className="text-gray-600 mb-6">
            Sign up for a free account to save your vehicle lookups and access additional features.
          </p>
          <Button 
            onClick={() => window.location.href = "/api/login?redirect=/dashboard"}
            className="bg-primary-600 hover:bg-primary-700 px-8 py-3"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Free Account
          </Button>
          <p className="text-sm text-gray-500 mt-2">Always free • No spam • Cancel anytime</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}