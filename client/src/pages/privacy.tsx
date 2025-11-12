import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Privacy() {
  const handleDownloadPDF = () => {
    // Create a blob with the privacy policy content
    const pdfContent = `Privacy Policy – HG Verified Vehicle Check

1. Introduction
HG Verified Vehicle Check ('we', 'our', 'us') provides vehicle history reports by allowing users to search plate numbers on our website. We are committed to protecting your personal data in compliance with the General Data Protection Regulation (GDPR). This policy explains how we collect, use, and safeguard your information.

This Privacy Policy applies to all personal data processed through our services, regardless of your location. Although we are based in the United States, GDPR applies to our processing of EU/UK personal data.

2. Data Controller Information
HG Verified Vehicle Check is the data controller responsible for deciding how and why your personal data is processed.
Company Name: HG Verified Vehicle Check
Company Registration Number: [INSERT COMPANY REGISTRATION NUMBER]
Registered Address: [INSERT FULL REGISTERED BUSINESS ADDRESS]
Email: [INSERT CONTACT EMAIL]
Telephone: [INSERT CONTACT TELEPHONE]
Data Protection Officer (if applicable): [INSERT DPO CONTACT DETAILS]

3. Types of Data Collected
We collect the following categories of data:
- User-Provided Data: Plate numbers, name, email, and any details you provide when creating an account or purchasing a report.
- API-Retrieved Data: Vehicle owner names, addresses, MOT history, and other identifiers provided via our data supplier (VDGI).
- Automatically Collected Data: IP addresses, browser details, and cookies for analytics and site performance.

4. Lawful Basis for Processing
We process personal data based on:
- Consent: When you submit plate numbers or create an account.
- Legitimate Interests: To provide the vehicle history reports you request.
- Contractual Necessity: To process payments and deliver purchased services.

5. Purpose of Data Processing
We use your data to:
- Generate vehicle history reports.
- Manage your account and process payments.
- Improve our website and services.
- Comply with legal obligations.

6. Data Retention Periods
We retain:
- User account details until your account is closed or up to 6 months after, unless legally required longer.
- Vehicle history search data for 30 days, unless extended at your request.
- Technical data (e.g., IP addresses, cookies) for up to 12 months.
- Legal compliance data (e.g., payment records) for 7 years.

7. Data Sharing
We share data only as necessary:
- With VDGI, our API provider, to retrieve vehicle history data.
- With service providers such as payment processors and analytics tools.
- With authorities when required by law.
We do not sell your personal data to third parties for marketing.

8. Data Subject Rights
Under GDPR, you have the right to:
- Access, rectify, or delete your data.
- Restrict or object to processing.
- Request data portability.
- Withdraw consent at any time.
To exercise your rights, contact us at [INSERT CONTACT EMAIL].

9. Data Security Measures
We protect your data using:
- Encryption for data transfers (HTTPS).
- Secure, encrypted storage.
- Access controls for authorized personnel only.
- Regular security audits.

10. International Data Transfers
If we transfer your data outside the UK/EU, we will ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) or equivalent protections, in compliance with GDPR requirements.

11. Changes to This Policy
We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated 'Effective Date'.

Effective Date: [INSERT DATE]`;

    // Create a download link
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HG-Verified-Privacy-Policy.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">HG Verified Vehicle Check - GDPR Compliant</p>
          <p className="text-sm text-gray-500">Effective Date: [INSERT DATE]</p>
        </div>
        <Button 
          onClick={handleDownloadPDF}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 prose prose-lg max-w-none">
          <h2>1. Introduction</h2>
          <p>
            HG Verified Vehicle Check ('we', 'our', 'us') provides vehicle history reports by allowing users to search plate numbers on our website. 
            We are committed to protecting your personal data in compliance with the General Data Protection Regulation (GDPR). 
            This policy explains how we collect, use, and safeguard your information.
          </p>
          <p>
            This Privacy Policy applies to all personal data processed through our services, regardless of your location. 
            Although we are based in the United States, GDPR applies to our processing of EU/UK personal data.
          </p>

          <h2>2. Data Controller Information</h2>
          <p>HG Verified Vehicle Check is the data controller responsible for deciding how and why your personal data is processed.</p>
          <ul>
            <li><strong>Company Name:</strong> HG Verified Vehicle Check</li>
            <li><strong>Company Registration Number:</strong> [INSERT COMPANY REGISTRATION NUMBER]</li>
            <li><strong>Registered Address:</strong> [INSERT FULL REGISTERED BUSINESS ADDRESS]</li>
            <li><strong>Email:</strong> [INSERT CONTACT EMAIL]</li>
            <li><strong>Telephone:</strong> [INSERT CONTACT TELEPHONE]</li>
            <li><strong>Data Protection Officer (if applicable):</strong> [INSERT DPO CONTACT DETAILS]</li>
          </ul>

          <h2>3. Types of Data Collected</h2>
          <p>We collect the following categories of data:</p>
          <ul>
            <li><strong>User-Provided Data:</strong> Plate numbers, name, email, and any details you provide when creating an account or purchasing a report.</li>
            <li><strong>API-Retrieved Data:</strong> Vehicle owner names, addresses, MOT history, and other identifiers provided via our data supplier (VDGI).</li>
            <li><strong>Automatically Collected Data:</strong> IP addresses, browser details, and cookies for analytics and site performance.</li>
          </ul>

          <h2>4. Lawful Basis for Processing</h2>
          <p>We process personal data based on:</p>
          <ul>
            <li><strong>Consent:</strong> When you submit plate numbers or create an account.</li>
            <li><strong>Legitimate Interests:</strong> To provide the vehicle history reports you request.</li>
            <li><strong>Contractual Necessity:</strong> To process payments and deliver purchased services.</li>
          </ul>

          <h2>5. Purpose of Data Processing</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Generate vehicle history reports</li>
            <li>Manage your account and process payments</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>6. Data Retention Periods</h2>
          <p>We retain:</p>
          <ul>
            <li>User account details until your account is closed or up to 6 months after, unless legally required longer</li>
            <li>Vehicle history search data for 30 days, unless extended at your request</li>
            <li>Technical data (e.g., IP addresses, cookies) for up to 12 months</li>
            <li>Legal compliance data (e.g., payment records) for 7 years</li>
          </ul>

          <h2>7. Data Sharing</h2>
          <p>
            We share data only as necessary:
          </p>
          <ul>
            <li>With VDGI, our API provider, to retrieve vehicle history data</li>
            <li>With service providers such as payment processors and analytics tools</li>
            <li>With authorities when required by law</li>
          </ul>
          <p className="font-semibold">We do not sell your personal data to third parties for marketing.</p>

          <h2>8. Data Subject Rights</h2>
          <p>Under GDPR, you have the right to:</p>
          <ul>
            <li>Access, rectify, or delete your data</li>
            <li>Restrict or object to processing</li>
            <li>Request data portability</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p>To exercise your rights, contact us at [INSERT CONTACT EMAIL].</p>

          <h2>9. Data Security Measures</h2>
          <p>
            We protect your data using:
          </p>
          <ul>
            <li>Encryption for data transfers (HTTPS)</li>
            <li>Secure, encrypted storage</li>
            <li>Access controls for authorized personnel only</li>
            <li>Regular security audits</li>
          </ul>

          <h2>10. International Data Transfers</h2>
          <p>
            If we transfer your data outside the UK/EU, we will ensure appropriate safeguards are in place, 
            such as Standard Contractual Clauses (SCCs) or equivalent protections, in compliance with GDPR requirements.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated 'Effective Date'.
          </p>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Effective Date:</strong> [INSERT DATE]<br/>
              <strong>Data Provider:</strong> VDGI<br/>
              <strong>Contact:</strong> [INSERT CONTACT EMAIL]
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}