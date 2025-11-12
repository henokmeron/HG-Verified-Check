import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <div className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 rounded-3xl p-12 text-center">
          <h1 className="text-5xl font-black text-gray-900 mb-6" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Terms of Service</h1>
          <p className="text-xl text-gray-700">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20">
        <CardContent className="p-12 prose prose-lg max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using HG Verified Vehicle Check, you accept and agree to be bound by the terms and 
            provisions of this agreement. If you do not agree to these terms, you should not use our service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            HG Verified Vehicle Check provides vehicle information lookup services using official Vehicle Data UK records. 
            Our service includes:
          </p>
          <ul>
            <li>Comprehensive vehicle registration lookups</li>
            <li>Complete MOT history and current status</li>
            <li>Current tax status and expiry information</li>
            <li>Detailed vehicle specifications and features</li>
            <li>Professional customer support</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>
            To access certain features, you must create an account. You are responsible for:
          </p>
          <ul>
            <li>Maintaining the confidentiality of your account</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us of any unauthorized use</li>
            <li>Providing accurate and complete information</li>
          </ul>

          <h2>4. Payment Terms</h2>
          <p>
            Our services are provided on a prepaid credit basis:
          </p>
          <ul>
            <li>Credits must be purchased in advance</li>
            <li>Each vehicle lookup consumes one credit</li>
            <li>Credits expire based on your package terms</li>
            <li>Payments are processed securely through Stripe</li>
            <li>All prices are in GBP and include VAT where applicable</li>
          </ul>

          <h2>5. Refund Policy</h2>
          <p>
            Refunds are available under the following conditions:
          </p>
          <ul>
            <li>Unused credits can be refunded within 30 days of purchase</li>
            <li>Used credits are non-refundable</li>
            <li>Technical errors resulting in failed lookups will be credited back</li>
            <li>Refunds are processed to the original payment method</li>
          </ul>

          <h2>6. Acceptable Use</h2>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Use the service for any unlawful purpose</li>
            <li>Resell or redistribute the data without authorization</li>
            <li>Attempt to access unauthorized areas of our systems</li>
            <li>Interfere with or disrupt the service</li>
            <li>Use automated systems to bypass our web interface</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>

          <h2>7. Data Accuracy</h2>
          <p>
            While we strive to provide accurate information:
          </p>
          <ul>
            <li>Data is sourced from official Vehicle Data UK records</li>
            <li>We do not guarantee 100% accuracy or completeness</li>
            <li>Information should be verified independently for critical decisions</li>
            <li>We are not liable for decisions made based on our data</li>
          </ul>

          <h2>8. Intellectual Property</h2>
          <p>
            All content, features, and functionality are owned by HG Verified Vehicle Check and are protected by 
            international copyright, trademark, and other intellectual property laws.
          </p>

          <h2>9. Customer Support</h2>
          <p>
            We are committed to providing excellent customer service:
          </p>
          <ul>
            <li>Support is available via email at support@hgverified.com</li>
            <li>We aim to respond to all inquiries within 24 hours</li>
            <li>Technical issues are prioritized for immediate resolution</li>
            <li>Account and billing support is available during business hours</li>
          </ul>

          <h2>10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, HG Verified Vehicle Check shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
          </p>

          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless HG Verified Vehicle Check from any claims, losses, damages, 
            liabilities, and expenses arising from your use of the service or violation of these terms.
          </p>

          <h2>12. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice, for:
          </p>
          <ul>
            <li>Breach of these Terms of Service</li>
            <li>Fraudulent or illegal activities</li>
            <li>Non-payment of fees</li>
            <li>Actions harmful to other users or the service</li>
          </ul>

          <h2>13. Governing Law</h2>
          <p>
            These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the 
            exclusive jurisdiction of the courts of England and Wales.
          </p>

          <h2>14. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon 
            posting. Your continued use constitutes acceptance of the modified terms.
          </p>

          <h2>15. Contact Information</h2>
          <p>
            For questions about these Terms of Service:
          </p>
          <ul>
            <li>Email: legal@hgverified.com</li>
            <li>Address: HG Verified Vehicle Check, London, United Kingdom</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}