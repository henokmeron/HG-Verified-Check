import { Link } from "wouter";
import { Shield, Mail, FileText, HelpCircle, Info, Home, ChevronRight } from "lucide-react";

import LOGOO from "@assets/Circle logo.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { href: "/privacy", label: "Privacy Policy", icon: Shield },
    { href: "/terms", label: "Terms of Service", icon: FileText },
    { href: "/about", label: "About Us", icon: Info },
    { href: "/accessibility", label: "Accessibility", icon: Info },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
    { href: "/app/support", label: "Support", icon: Mail },
  ];
  
  return (
    <footer className="mt-auto relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 border-b border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="flex flex-col items-start space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary-500 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <img 
                    src={LOGOO} 
                    alt="HG Verified" 
                    className="relative h-[52px] w-auto rounded-lg shadow-xl"
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">HG Verified Vehicle Check 360°</h3>
                  <p className="text-slate-400 text-xs">Vehicle Check Excellence</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm text-left max-w-xs">
                Your trusted partner for comprehensive vehicle history reports and verification services.
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="flex flex-col items-start md:items-start space-y-3">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">Quick Links</h4>
              <div className="flex flex-col space-y-2">
                {footerLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-center gap-2 text-slate-400 hover:text-primary-400 transition-all duration-300 transform hover:translate-x-1"
                    >
                      <Icon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span className="text-sm font-medium relative">
                        {link.label}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-300" />
                      </span>
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-1" />
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Contact & Trust */}
            <div className="flex flex-col items-center md:items-end space-y-4">
              <div className="text-center md:text-right">
                <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Trusted By Thousands</h4>
                <div className="flex items-center justify-center md:justify-end gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-400 text-sm">Over 50,000+ Vehicle Checks</p>
              </div>
              
              {/* Call to Action */}
              <Link
                href="/app"
                className="group relative inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xl font-bold rounded-full shadow-lg hover:shadow-primary-500/25 transition-all duration-300 hover:scale-105"
              >
                <Home className="h-8 w-8" />
                <span>Start Checking</span>
                <ChevronRight className="h-8 w-8 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Legal Compliance & Data Source Information */}
        <div className="py-4 border-b border-slate-700/30">
          <div className="text-center text-slate-400 text-xs space-y-2">
            <div className="max-w-4xl mx-auto">
              <p className="mb-2">
                <strong className="text-slate-300">HG Verified Ltd</strong> (Company No. TBD) • 
                Registered in England & Wales • 
                Registered Office: Company registration pending • 
                Support: support@hgverified.com
              </p>
              <p className="text-xs leading-relaxed">
                <strong>Data Sources & Disclaimers:</strong> Vehicle data sourced from DVLA Vehicle Enquiry Service (VES), 
                DVSA MOT History API, and insurer databases via licensed partners. Availability and timeliness vary by source. 
                Write-off and stolen markers rely on insurer/police reporting; absence of a record is not a guarantee. 
                Not affiliated with DVLA/DVSA/HPI or any government body.
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>© {currentYear}</span>
            <span className="text-slate-600">•</span>
            <span>HG Verified Vehicle Check</span>
            <span className="text-slate-600">•</span>
            <span>All rights reserved</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Powered by</span>
            <span className="text-white font-semibold text-sm bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Vehicle Data Global Ltd</span>
            <div className="ml-2 flex gap-1">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse delay-100" />
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse delay-200" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}