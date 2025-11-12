import logoUrl from "@/assets/car-check-logo.webp";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Shield, Zap, Users } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img 
                src={logoUrl} 
                alt="HG Verified Vehicle Check Logo" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">HG Verified Vehicle Check</span>
            </Link>
            
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Vehicle Data Services
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get instant access to comprehensive vehicle data from official DVLA records. 
            Trusted by dealers and buyers nationwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary-600 hover:bg-primary-700 text-lg px-8 py-4"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-4"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">DVLA Approved</h3>
              <p className="text-gray-600">
                Official data source with full DVLA approval for accurate vehicle information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-gray-600">
                Get comprehensive vehicle details in seconds with our fast API integration.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Trusted by Professionals</h3>
              <p className="text-gray-600">
                Used by car dealers, buyers, and automotive professionals across the UK.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Pay only for what you use with our credit-based system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Starter Pack</h3>
                <div className="text-3xl font-bold mb-2">£5.00</div>
                <p className="text-gray-600 mb-4">10 Vehicle Checks</p>
                <p className="text-sm text-gray-500">£0.50 per lookup</p>
              </CardContent>
            </Card>

            <Card className="border-primary-200 bg-primary-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Popular</h3>
                <div className="text-3xl font-bold mb-2">£20.00</div>
                <p className="text-gray-600 mb-4">50 Vehicle Checks</p>
                <p className="text-sm text-primary-600 font-medium">£0.40 per lookup</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Business</h3>
                <div className="text-3xl font-bold mb-2">£30.00</div>
                <p className="text-gray-600 mb-4">100 Vehicle Checks</p>
                <p className="text-sm text-green-600 font-medium">£0.30 per lookup</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Car className="text-primary-600 h-6 w-6" />
              <span className="text-lg font-bold text-gray-900">HG Verified Vehicle Check</span>
            </div>
            <p className="text-gray-600 mb-4">
              Professional vehicle data services powered by official DVLA records
            </p>
            <div className="flex items-center justify-center space-x-4">
              <span className="text-sm text-gray-500">Secured by</span>
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-500">DVLA Approved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
