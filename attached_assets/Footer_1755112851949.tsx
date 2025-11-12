import logoUrl from "@/assets/car-check-logo.webp";
import { Car } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src={logoUrl} 
                alt="HG Verified Vehicle Check Logo" 
                className="h-8 w-auto filter brightness-0 invert"
              />
              <span className="text-xl font-bold">HG Verified Vehicle Check</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Professional vehicle data services with instant access to comprehensive DVLA records. 
              Trusted by dealers and buyers nationwide.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:support@hgverifiedvehiclecheck.com" className="text-gray-400 hover:text-white">
                support@hgverifiedvehiclecheck.com
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white">Vehicle Lookup</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white">Credit Packages</Link></li>
              <li><Link href="/api-docs" className="text-gray-400 hover:text-white">API Access</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-white">Support</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              <p>© {currentYear} HG Verified Vehicle Check. All rights reserved.</p>
              <p className="mt-1">
                Vehicle data provided by DVLA. Service operates under official DVLA data licensing agreements.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 text-gray-400 text-sm">
              <p>Secure payments powered by Stripe</p>
              <p>SSL encrypted • GDPR compliant • 99.9% uptime</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}