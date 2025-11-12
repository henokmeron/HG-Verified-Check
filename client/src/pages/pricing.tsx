// import logoUrl from "@/assets/car-check-logo-new.jpg"; // Logo file not found
const logoUrl = "/favicon.ico";
import { Car, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const packages = [
  {
    id: 'basic',
    name: 'Full Vehicle Check',
    credits: 1,
    price: 7.00,
    pricePerCredit: '7.00',
    description: 'A single, comprehensive vehicle history report – perfect for one-off buyers',
    features: [
      'Accident & Insurance Write-off Record (MIAFTR)',
      'Full Model & Make Details',
      'Complete MOT History',
      'Police National Computer (PNC) Stolen Check',
      'Factory Specification & Options List',
      'Tyre & Wheel Details',
      'UKVD Market Valuation',
      'Vehicle Identification Details (VIN, engine size, fuel type, etc.)',
      'Vehicle Images (where available)',
      'Vehicle Tax Status'
    ]
  },
  {
    id: 'mini',
    name: 'Mini Pack',
    credits: 3,
    price: 20.00,
    pricePerCredit: '6.67',
    description: 'Perfect for occasional buyers – cheaper than single checks',
    features: [
      'All features from the Full Vehicle Check',
      '3 Full Vehicle Checks',
      'Save £1.00 compared to single checks'
    ]
  },
  {
    id: 'starter',
    name: 'Starter Pack', 
    credits: 5,
    price: 33.00,
    pricePerCredit: '6.60',
    description: 'Ideal for checking a few vehicles – saves money compared to single reports',
    features: [
      'All features from the Full Vehicle Check',
      '5 Full Vehicle Checks',
      'Save £2.00 compared to single checks'
    ]
  },
  {
    id: 'standard',
    name: 'Standard Pack',
    credits: 10,
    price: 62.00,
    pricePerCredit: '6.20',
    description: 'The go-to choice for regular buyers or small dealerships',
    features: [
      'All features from the Full Vehicle Check',
      '10 Full Vehicle Checks',
      'Save £8.00 compared to single checks'
    ]
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 15,
    price: 87.00,
    pricePerCredit: '5.80',
    description: 'Best for active buyers, traders, or anyone checking multiple cars a month',
    features: [
      'All features from the Full Vehicle Check',
      '15 Full Vehicle Checks',
      'Save £18.00 compared to single checks',
      'Priority Support'
    ],
    popular: true
  },
  {
    id: 'business',
    name: 'Business Pack',
    credits: 50,
    price: 265.00,
    pricePerCredit: '5.30',
    description: 'A professional solution for dealers and fleet managers',
    features: [
      'All features from the Full Vehicle Check',
      '50 Full Vehicle Checks',
      'Save £85.00 compared to single checks',
      'Priority Support',
      'Business Invoice',
      'Bulk Export Options'
    ]
  }
];

export default function Pricing() {
  const [, navigate] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [registration, setRegistration] = useState("");

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Scroll animations
  const headerAnimation = useScrollAnimation(0.2);
  const freeCheckAnimation = useScrollAnimation(0.1);
  const packagesAnimation = useScrollAnimation(0.1);

  const handleSelectPackage = (packageId: string) => {
    if (isAuthenticated) {
      navigate(`/app/checkout?package=${packageId}`);
    } else {
      window.location.href = `/api/login?redirect=/app/checkout?package=${packageId}`;
    }
  };

  const handlePremiumCheck = async () => {
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

    if (!isAuthenticated) {
      window.location.href = `/api/login?redirect=/pricing`;
      return;
    }

    if (user && user.creditBalance <= 0) {
      toast({
        title: "💳 Credits Required",
        description: "You need credits for Premium checks. Please purchase a package below.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to the main page with the registration pre-filled
    window.location.href = `/?reg=${encodeURIComponent(cleanReg)}`;
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={headerAnimation.ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={headerAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 rounded-3xl p-12 hover:shadow-3xl hover:scale-105 transition-all duration-300">
            <h1 className="text-5xl font-black text-gray-900 mb-6 text-gradient-animate hover:text-glow transition-colors duration-300" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Premium Vehicle Intelligence</h1>
            <p className="text-2xl text-gray-700 mb-8 leading-relaxed">Professional-grade vehicle reports with complete Vehicle Data UK records, MOT history, and market valuations</p>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              💰 Save up to £47 compared to competitors
            </div>
          </div>
        </motion.div>

        {/* Premium Comprehensive Check Section */}
        <motion.div 
          ref={freeCheckAnimation.ref}
          className="premium-check-box from-blue-50 to-purple-50 shadow-2xl border-2 border-blue-200 rounded-3xl p-12 mb-20 transition-all duration-500 relative overflow-hidden group bg-[#21aaf3]"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={freeCheckAnimation.isVisible ? { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 15,
              duration: 0.8,
              delay: 0.2
            }
          } : { opacity: 0, scale: 0.9, y: 50 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.3)",
            transition: { duration: 0.3, ease: "easeOut" }
          }}
        >
          <div className="text-center mb-10">
            <h2 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-gradient-text" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Ultimate Vehicle Assurance Check</h2>
            <div className="flex justify-center mb-6">
              <Badge className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-full shadow-lg animate-pulse-glow">
                <span className="animate-text-shimmer">Premium Comprehensive Report – £7</span>
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>Instant, Verified Insights</p>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.4s" }}>Unlock Complete DVLA & UK Vehicle Data Records</p>

            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  placeholder="Example: AB12CDE" 
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                />
                <Button 
                  onClick={handlePremiumCheck}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold text-lg whitespace-nowrap shrink-0 shadow-lg hover-lift animate-button-glow"
                >
                  <span className="relative z-10">Get Premium Check</span>
                </Button>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <span className="text-gray-700 font-semibold">• £7 One-Time Fee</span>
                <span className="text-gray-700 font-semibold">• Instant Access to Full Report</span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur rounded-xl p-8 max-w-3xl mx-auto shadow-inner animate-slide-up bg-[#ffce44]" style={{ animationDelay: "0.5s" }}>
            <h3 className="font-bold text-2xl text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-gradient-text">Comprehensive Check Includes:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "0.6s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">Outstanding Finance Check</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "0.7s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">Insurance Write-off Status</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "0.8s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">Stolen Vehicle Check</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "0.9s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">MOT History & Failures</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "1.0s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">Mileage Anomaly Check</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "1.1s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">Keeper History</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "1.2s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">Number Plate Changes</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "1.3s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">V5C Issue History</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "1.4s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">Vehicle Identity (VIN & Engine)</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "1.5s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">Full DVLA Specification</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "1.6s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">Tax & Emissions Compliance</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "1.7s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">Market Valuation</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "1.8s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">Colour Change History</span>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded transition-all duration-300 hover-slide-right animate-fade-in" style={{ animationDelay: "1.9s" }}>
                <span className="text-green-600 text-lg mt-1 flex-shrink-0 animate-check-mark">✅</span>
                <span className="text-gray-800 font-medium">Vehicle Image (where available)</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-300">
              <p className="text-base text-gray-800 text-center font-semibold">
                <span className="text-blue-600">🔒</span> Secure Vehicle Data UK Approved • Professional-Grade Reports • Trusted by Thousands
              </p>
            </div>
          </div>
        </motion.div>

        <div className="text-center mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 shadow-lg border-2 border-blue-200">
          <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 relative z-10">Full Vehicle History Checks</h2>
          <p className="text-xl text-gray-800 font-bold relative z-10">Comprehensive reports with complete Vehicle Data UK records, MOT history, and detailed specifications</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={`relative package-card ${pkg.popular ? 'border-primary-500 ring-2 ring-primary-500' : ''}`}>
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
                      <span className="text-green-500 text-base">✅</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleSelectPackage(pkg.id)}
                  className={`w-full font-bold text-lg py-3 ${pkg.popular ? 'btn-premium' : 'bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:text-white hover:scale-105 transition-all duration-300'}`}
                  variant="ghost"
                >
                  <span className={pkg.popular ? 'text-fade' : ''}>Select Package</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 dark-bg-text">What's Included</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Car className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark-bg-text">Full Vehicle Data UK</h3>
              <p className="text-sm text-gray-600 mt-1 dark-bg-text-secondary">Complete vehicle information including MOT, tax, and emissions</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 text-xl">✅</span>
              </div>
              <h3 className="font-medium text-gray-900 dark-bg-text">Instant Results</h3>
              <p className="text-sm text-gray-600 mt-1 dark-bg-text-secondary">Get comprehensive reports immediately after payment</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Car className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark-bg-text">Secure Platform</h3>
              <p className="text-sm text-gray-600 mt-1 dark-bg-text-secondary">Your data is protected with enterprise-grade security</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 text-xl">✅</span>
              </div>
              <h3 className="font-medium text-gray-900 dark-bg-text">Professional Support</h3>
              <p className="text-sm text-gray-600 mt-1 dark-bg-text-secondary">Expert assistance when you need it most</p>
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
                  <td className="py-3 px-4 text-green-600 font-bold">£7.00</td>
                  <td className="py-3 px-4 text-gray-600">£8.95</td>
                  <td className="py-3 px-4 text-green-600 font-medium">Save £1.95</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">3 Checks</td>
                  <td className="py-3 px-4 text-green-600 font-bold">£20.00 (£6.67 each)</td>
                  <td className="py-3 px-4 text-gray-600">£26.85 (£8.95 each)</td>
                  <td className="py-3 px-4 text-green-600 font-medium">Save £6.85</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">5 Checks</td>
                  <td className="py-3 px-4 text-green-600 font-bold">£33.00 (£6.60 each)</td>
                  <td className="py-3 px-4 text-gray-600">£44.75 (£8.95 each)</td>
                  <td className="py-3 px-4 text-green-600 font-medium">Save £11.75</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">15 Checks</td>
                  <td className="py-3 px-4 text-green-600 font-bold">£87.00 (£5.80 each)</td>
                  <td className="py-3 px-4 text-gray-600">£134.25 (£8.95 each)</td>
                  <td className="py-3 px-4 text-green-600 font-medium">Save £47.25</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">All packages include the same comprehensive vehicle data: MOT records, tax status, specifications, and more</p>
          </div>
        </div>
      </div>
    </div>
  );
}