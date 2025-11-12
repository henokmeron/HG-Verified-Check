import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Shield, Users, Award } from "lucide-react";
import { Link } from "wouter";
import backgroundImage from "@assets/image_1755202351352.png";

export default function About() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 rounded-3xl p-12">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-8" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>
              About HG Verified Vehicle Check
            </h1>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Your trusted partner for professional vehicle intelligence services. We provide instant access to 
              comprehensive vehicle information for car buyers, sellers, and automotive professionals.
            </p>
          </div>
        </section>

        {/* Company Story */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white/95 backdrop-blur-lg rounded-xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-4">
                HG Verified Vehicle Check was founded to provide reliable, instant access to official vehicle data. 
                We believe that transparency in vehicle history is essential for safe and fair automotive transactions.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Our platform serves thousands of users monthly, from individual car buyers to professional 
                dealers, helping them make informed decisions with confidence.
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">50K+</div>
                  <div className="text-sm text-gray-600">Vehicles Checked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">5K+</div>
                  <div className="text-sm text-gray-600">Happy Users</div>
                </div>
              </div>
            </div>
            
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20">
              <CardContent className="p-10">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full p-4 w-20 h-20 mb-6">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Official Data Provider</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We partner with Vehicle Data Global Ltd to ensure all our data is accurate, 
                  up-to-date, and legally compliant. Your searches are secure and confidential.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Security First</h3>
                <p className="text-gray-600">
                  All searches are encrypted and processed securely. We never store or share your search history.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Customer Focus</h3>
                <p className="text-gray-600">
                  Our platform is designed for ease of use, with 24/7 support and transparent pricing.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Reliability</h3>
                <p className="text-gray-600">
                  99.9% uptime guarantee with instant results from official vehicle databases.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact */}
        <section className="text-center bg-white rounded-xl p-12 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Get Started Today</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust VehicleCheck Pro for their vehicle data needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Get Started
            </Button>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}