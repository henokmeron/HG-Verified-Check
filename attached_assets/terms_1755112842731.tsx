import logoUrl from "@/assets/car-check-logo.webp";
import { Card, CardContent } from "@/components/ui/card";
import { Car } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-opacity transition-opacity">
              <img 
                src={logoUrl} 
                alt="HG Verified Vehicle Check Logo" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">HG Verified Vehicle Check</span>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">Home</Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium">About</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600 font-medium">Pricing</Link>
              <Link href="/support" className="text-gray-700 hover:text-primary-600 font-medium">Support</Link>
            </nav>

            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
        </div>

        <Card>
          <CardContent className="p-8 prose prose-lg max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using HG Verified Vehicle Check, you accept and agree to be bound by the terms and 
              provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              HG Verified Vehicle Check provides vehicle data lookup services using official DVLA records. We offer both 
              free public access and premium credit-based services for comprehensive vehicle information.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              To access premium features, you must create an account. You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account information</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring your account information is accurate and up-to-date</li>
            </ul>

            <h2>4. Payment Terms</h2>
            <p>
              Premium services require the purchase of credits:
            </p>
            <ul>
              <li>Credit packages: 10 credits (£5), 50 credits (£20), 100 credits (£30)</li>
              <li>Each vehicle lookup consumes 1 credit</li>
              <li>Credits never expire</li>
              <li>All payments are processed securely through Stripe</li>
              <li>Refunds available within 30 days of purchase</li>
            </ul>

            <h2>5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to scrape or bulk download data</li>
              <li>Resell or redistribute our data without permission</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>

            <h2>6. Data Accuracy and Limitations</h2>
            <p>
              While we strive to provide accurate data from official DVLA sources:
            </p>
            <ul>
              <li>We cannot guarantee 100% accuracy of all information</li>
              <li>Data is provided "as is" without warranties</li>
              <li>You should verify critical information independently</li>
              <li>We are not liable for decisions made based on our data</li>
            </ul>

            <h2>7. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.
            </p>

            <h2>8. Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are owned by HG Verified Vehicle Check and are 
              protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              HG Verified Vehicle Check shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages, including loss of profits, data, or other intangible losses.
            </p>

            <h2>10. Service Availability</h2>
            <p>
              We strive for 99.9% uptime but cannot guarantee uninterrupted service. We may suspend service for 
              maintenance, updates, or in case of technical issues.
            </p>

            <h2>11. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the service immediately, without prior notice, 
              for any reason, including breach of the Terms.
            </p>

            <h2>12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of material changes via 
              email and website notice.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of England and Wales, 
              without regard to its conflict of law provisions.
            </p>

            <h2>14. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul>
              <li>Email: legal@vehiclecheckpro.com</li>
              <li>Support: support@vehiclecheckpro.com</li>
            </ul>

            <div className="bg-amber-50 p-6 rounded-lg mt-8">
              <h3 className="font-semibold text-amber-900 mb-2">Important Notice</h3>
              <p className="text-amber-800">
                These terms constitute the entire agreement between you and HG Verified Vehicle Check. By using our service, 
                you acknowledge that you have read, understood, and agree to these terms.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}