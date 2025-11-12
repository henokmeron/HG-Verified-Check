import logoUrl from "@/assets/car-check-logo.webp";
import { Card, CardContent } from "@/components/ui/card";
import { Car } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
        </div>

        <Card>
          <CardContent className="p-8 prose prose-lg max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, 
              purchase credits, or contact us for support. This includes:
            </p>
            <ul>
              <li>Name and email address</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Vehicle registration numbers you search</li>
              <li>Usage patterns and preferences</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and improve our vehicle lookup services</li>
              <li>Process payments and manage your account</li>
              <li>Send you service updates and support communications</li>
              <li>Comply with legal obligations and prevent fraud</li>
            </ul>

            <h2>3. Information Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties, 
              except in the following circumstances:
            </p>
            <ul>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul>
              <li>SSL/TLS encryption for all data transmission</li>
              <li>Secure storage with encryption at rest</li>
              <li>Regular security audits and monitoring</li>
              <li>PCI DSS compliance for payment processing</li>
            </ul>

            <h2>5. Your Rights</h2>
            <p>Under GDPR and UK data protection laws, you have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Object to certain processing activities</li>
            </ul>

            <h2>6. Cookies and Tracking</h2>
            <p>
              We use essential cookies to provide our service and analytics cookies to improve your experience. 
              You can control cookie preferences through your browser settings.
            </p>

            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information only as long as necessary to provide our services and comply 
              with legal obligations. Account data is deleted within 30 days of account closure.
            </p>

            <h2>8. International Transfers</h2>
            <p>
              Your data is processed in the UK and EU. Any international transfers are protected by appropriate 
              safeguards including Standard Contractual Clauses.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 16. We do not knowingly collect personal information 
              from children under 16.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any material changes 
              by email and by posting the updated policy on our website.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our data practices, please contact us:
            </p>
            <ul>
              <li>Email: privacy@hgverifiedvehiclecheck.com</li>
              <li>Address: HG Verified Vehicle Check, Data Protection Officer</li>
            </ul>

            <div className="bg-blue-50 p-6 rounded-lg mt-8">
              <h3 className="font-semibold text-blue-900 mb-2">Your Privacy Matters</h3>
              <p className="text-blue-800">
                We are committed to protecting your privacy and maintaining the security of your personal information. 
                If you have any concerns or questions, please don't hesitate to contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}