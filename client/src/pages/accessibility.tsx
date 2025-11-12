import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function Accessibility() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <div className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 rounded-3xl p-12 text-center">
          <h1 className="text-5xl font-black text-gray-900 mb-6" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>
            Accessibility Statement
          </h1>
          <p className="text-xl text-gray-700">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20">
        <CardContent className="p-12 prose prose-lg max-w-none">
          <h2>Our Commitment to Accessibility</h2>
          <p>
            HG Verified Vehicle Check is committed to ensuring our website is accessible to everyone, 
            including users with disabilities. We continually improve the user experience for everyone 
            by applying relevant accessibility standards and best practices.
          </p>

          <h2>Accessibility Standards</h2>
          <p>
            We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA standards. 
            These guidelines help make web content more accessible for people with disabilities and provide 
            a better user experience for everyone.
          </p>

          <h2>Current Accessibility Features</h2>
          <ul>
            <li><strong>Keyboard Navigation:</strong> All interactive elements can be accessed via keyboard</li>
            <li><strong>Screen Reader Compatibility:</strong> Content is structured for screen reader users</li>
            <li><strong>Color Contrast:</strong> Text and background colors meet WCAG contrast requirements</li>
            <li><strong>Responsive Design:</strong> Site adapts to different screen sizes and zoom levels</li>
            <li><strong>Alternative Text:</strong> Images include descriptive alt text where appropriate</li>
            <li><strong>Clear Navigation:</strong> Consistent navigation structure throughout the site</li>
            <li><strong>Focus Indicators:</strong> Clear visual indicators for keyboard focus</li>
            <li><strong>Error Messages:</strong> Clear, descriptive error messages and form validation</li>
          </ul>

          <h2>Known Limitations</h2>
          <p>
            We are continuously working to improve accessibility. Some areas we are actively addressing include:
          </p>
          <ul>
            <li>Enhanced mobile accessibility for complex data tables</li>
            <li>Improved voice control compatibility</li>
            <li>Additional customization options for text size and contrast</li>
          </ul>

          <h2>Reasonable Adjustments</h2>
          <p>
            In accordance with the Equality Act 2010, we are committed to making reasonable adjustments 
            to ensure our services are accessible. If you encounter accessibility barriers or need 
            information in an alternative format, please contact us and we will work to accommodate your needs.
          </p>

          <h2>Feedback and Contact Information</h2>
          <p>
            We welcome feedback about the accessibility of our website. If you encounter accessibility 
            issues, have suggestions for improvement, or need assistance accessing any content:
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-6">
            <div className="flex items-start space-x-3">
              <Mail className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Contact Accessibility Team</h3>
                <p className="text-blue-800 mb-2">
                  <strong>Email:</strong> accessibility@hgverified.com
                </p>
                <p className="text-blue-800 mb-2">
                  <strong>Support:</strong> support@hgverified.com
                </p>
                <p className="text-blue-700 text-sm">
                  We aim to respond to accessibility enquiries within 2 working days.
                </p>
              </div>
            </div>
          </div>

          <h2>Compliance Monitoring</h2>
          <p>
            We regularly review our website's accessibility through:
          </p>
          <ul>
            <li>Automated accessibility testing tools</li>
            <li>Manual testing with assistive technologies</li>
            <li>User feedback and testing</li>
            <li>Regular accessibility audits</li>
          </ul>

          <h2>Third-Party Content</h2>
          <p>
            Some content on our website may be provided by third parties (such as payment processing forms). 
            We work with our third-party providers to ensure their content meets accessibility standards, 
            but some elements may not be fully under our control.
          </p>

          <h2>Mobile Application</h2>
          <p>
            This accessibility statement applies to our web application. We are committed to ensuring 
            any future mobile applications also meet accessibility standards.
          </p>

          <h2>Legal Framework</h2>
          <p>
            This accessibility statement aligns with the UK Equality Act 2010 and reflects our 
            commitment to providing equal access to our services for all users.
          </p>

          <p className="text-sm text-gray-600 mt-8 pt-8 border-t border-gray-200">
            <strong>HG Verified Ltd</strong> (Company No. 12345678) • 
            Registered in England & Wales • 
            This statement was prepared on {new Date().toLocaleDateString('en-GB')} and will be 
            reviewed annually to ensure continued compliance and improvement.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}