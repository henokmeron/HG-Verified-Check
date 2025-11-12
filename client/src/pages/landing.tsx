// import logoUrl from "@/assets/car-check-logo-new.jpg"; // Logo file not found
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Shield, Zap, Users, CheckCircle, Clock, FileText, CreditCard, Star, TrendingUp, Award, Cpu, Database, CloudLightning, Lock, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import PublicVehicleLookupForm from "@/components/PublicVehicleLookupForm";
// import VehicleDetails from "@/components/VehicleDetails"; // Removed - old report component
// import { useState } from "react"; // Removed - not needed after report component removal

export default function Landing() {
  // const [vehicleResult, setVehicleResult] = useState(null); // Removed - old report display

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg shadow-2xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img 
                src="/favicon.ico" 
                alt="HG Verified Vehicle Check Logo" 
                style={{ height: "50px", width: "auto", borderRadius: "10px" }}
              />
              <span className="text-sm font-black bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">HG Verified Vehicle Check</span>
            </Link>
            
            <Button 
              type="button"
              onClick={() => window.location.href = "/auth/google"}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              data-testid="header-sign-in"
            >
              Go to App
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 brand-heading">
            HG Verified Vehicle Check
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-6 brand-heading">
            Free UK Vehicle Registration Check
          </h2>
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            Get instant access to comprehensive vehicle data from official Vehicle Data UK records. 
            Trusted by dealers and buyers nationwide.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-semibold text-gray-700">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Vehicle Data UK</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span>Real-Time Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <span>Trusted by 50K+ Users</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              type="button"
              size="lg"
              onClick={() => window.location.href = "/auth/google"}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-10 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              data-testid="homepage-get-started"
            >
              <Zap className="h-5 w-5 mr-2" />
              Get Started Free
            </Button>
            <Link to="/pricing">
              <Button 
                type="button"
                size="lg" 
                variant="outline"
                className="text-lg px-10 py-4 border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 rounded-lg"
                data-testid="homepage-view-pricing"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Free Vehicle Lookup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <PublicVehicleLookupForm onResult={() => {}} />
        
        {/* {vehicleResult && (
          <div className="mt-8">
            <VehicleDetails />
          </div>
        )} */}
      </section>

      {/* Enhanced Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Vehicle Intelligence Platform</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to make informed vehicle decisions - from basic checks to comprehensive reports</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Free Basic Check</h3>
                <p className="text-gray-600 mb-4">Essential vehicle information including make, model, and basic specifications</p>
                <Badge variant="secondary" className="bg-green-100 text-green-700">Always Free</Badge>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-2 border-blue-200">
              <CardContent className="pt-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Full History Check</h3>
                <p className="text-gray-600 mb-4">Complete MOT history, insurance records, stolen checks, and market valuation</p>
                <Badge className="bg-blue-600 text-white">£7.00 per check</Badge>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Business Solutions</h3>
                <p className="text-gray-600 mb-4">Bulk checks, API access, and custom solutions for dealers and businesses</p>
                <Badge variant="outline" className="border-purple-600 text-purple-600">Contact Sales</Badge>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Car className="h-6 w-6" />
              </div>
              <h4 className="font-semibold mb-1">Vehicle History</h4>
              <p className="text-sm text-gray-600">Complete ownership & accident records</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="font-semibold mb-1">MOT & Tax Status</h4>
              <p className="text-sm text-gray-600">Current status & full MOT history</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6" />
              </div>
              <h4 className="font-semibold mb-1">Stolen Check</h4>
              <p className="text-sm text-gray-600">Police database verification</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6" />
              </div>
              <h4 className="font-semibold mb-1">Market Valuation</h4>
              <p className="text-sm text-gray-600">Current market value estimates</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Original Features - now enhanced */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose HG Verified Vehicle Check?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Professional-grade vehicle intelligence trusted by industry experts</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Vehicle Data UK Powered</h3>
              <p className="text-gray-600">
                Official data source from Vehicle Data UK for accurate vehicle information. 
                Certified and trusted by government authorities.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Get comprehensive vehicle details in under 3 seconds. Our advanced 
                infrastructure ensures instant results every time.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Industry Trusted</h3>
              <p className="text-gray-600">
                Used by car dealers, buyers, insurance companies, and automotive 
                professionals across the UK since 2020.
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

      {/* Additional Feature Section - Advanced Technology */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Advanced Technology Platform</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Powered by cutting-edge AI and machine learning algorithms for unmatched accuracy
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/90 backdrop-blur hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Cpu className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600">Machine learning algorithms analyze patterns in vehicle history for deeper insights</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Database className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold mb-2">Big Data Integration</h3>
                <p className="text-gray-600">Access to millions of records from multiple authoritative sources</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <CloudLightning className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold mb-2">Cloud Infrastructure</h3>
                <p className="text-gray-600">Enterprise-grade cloud servers ensure 99.99% uptime and instant results</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold mb-2">Bank-Level Security</h3>
                <p className="text-gray-600">256-bit SSL encryption and GDPR-compliant data protection</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Success Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
            <p className="text-xl text-gray-600">See why professionals choose HG Verified</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The most comprehensive vehicle reports I've seen. Saved me from buying a car with hidden issues. Worth every penny!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    JD
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">James Davidson</p>
                    <p className="text-sm text-gray-500">Car Buyer, London</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-green-100 hover:border-green-300 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "As a dealer, I run hundreds of checks monthly. HG Verified is faster and more detailed than competitors. Excellent service!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    SM
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">Sarah Mitchell</p>
                    <p className="text-sm text-gray-500">Auto Dealer, Manchester</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The MOT history feature is brilliant. Shows everything clearly with test certificates. Professional service!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    RT
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">Robert Thompson</p>
                    <p className="text-sm text-gray-500">Fleet Manager, Birmingham</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Industry Partnerships</h2>
            <p className="text-xl text-gray-600">Connected with leading automotive data providers</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <p className="font-bold text-gray-800">DVLA Official</p>
                <p className="text-sm text-gray-500">Direct Access</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <Database className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="font-bold text-gray-800">MOT Database</p>
                <p className="text-sm text-gray-500">Full History</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                <p className="font-bold text-gray-800">PNC Check</p>
                <p className="text-sm text-gray-500">Police Records</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <CreditCard className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <p className="font-bold text-gray-800">Finance HPI</p>
                <p className="text-sm text-gray-500">Outstanding Finance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Start Your Vehicle Check Today
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers who trust HG Verified for accurate vehicle information
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth/google">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-4 text-lg">
                Get Started Free
              </Button>
            </a>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-2 border-white hover:bg-white/10 font-bold px-8 py-4 text-lg">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Car className="text-primary-600 h-6 w-6" />
              <span className="text-sm font-bold text-gray-900">HG Verified Vehicle Check</span>
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
