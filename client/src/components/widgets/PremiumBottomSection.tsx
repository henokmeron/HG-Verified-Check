import { Shield, FileText, Mail, Share2, Download, HeadphonesIcon, CheckCircle, Clock, ArrowRight, Sparkles, Star, TrendingUp, Award } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState, useRef } from "react";

export default function PremiumBottomSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div ref={sectionRef} className="relative overflow-hidden" style={{ backgroundColor: 'transparent' }}>
      {/* Subtle Gradient Overlay - Blends with page */}
      <div className="absolute inset-0">
        {/* Very subtle gradient effect */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
              linear-gradient(to bottom, 
                transparent 0%,
                rgba(25, 25, 112, 0.02) 30%,
                rgba(0, 0, 0, 0.05) 100%
              )
            `,
            filter: 'blur(20px)'
          }}
        />
        
        {/* Very subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Subtle floating particles */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 20}s`,
                opacity: Math.random() * 0.3 + 0.1
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="relative z-20 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            {/* Premium Service Badge */}
            <div className="relative inline-flex items-center justify-center mb-8">
              <div className="absolute inset-0 w-32 h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 blur-xl animate-pulse opacity-50" />
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4" />
                Premium Vehicle Intelligence
                <Award className="w-4 h-4" />
              </div>
            </div>
            
            {/* Main Heading */}
            <h2 className="relative text-5xl sm:text-6xl font-bold mb-6">
              <span className="text-white">
                Professional Vehicle Reports for
              </span>
              <br />
              <span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400"
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 3s ease infinite'
                }}
              >
                Businesses & Premium Buyers
              </span>
            </h2>
            
            {/* Value Proposition */}
            <div className="mb-8">
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
                Trusted by <span className="text-blue-400 font-semibold">50,000+ dealerships, fleet managers, and luxury car buyers</span> nationwide.
                Our comprehensive reports help you make confident purchasing decisions.
              </p>
              
            </div>
            
            {/* Premium Service Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 max-w-6xl mx-auto">
              {[
                { 
                  icon: FileText, 
                  title: "Comprehensive Reports", 
                  desc: "60+ data points checked instantly",
                  gradient: "from-blue-500 to-cyan-500",
                  delay: 0
                },
                { 
                  icon: Mail, 
                  title: "Email PDF Reports", 
                  desc: "Professional reports sent instantly",
                  gradient: "from-violet-500 to-purple-500",
                  delay: 100
                },
                { 
                  icon: Share2, 
                  title: "Share Reports", 
                  desc: "Send to clients with one click",
                  gradient: "from-pink-500 to-rose-500",
                  delay: 200
                },
                { 
                  icon: Download, 
                  title: "Save & Export", 
                  desc: "Download PDF, CSV, Excel formats",
                  gradient: "from-orange-500 to-red-500",
                  delay: 300
                }
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className={`group relative transform transition-all duration-700 hover:scale-105 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${feature.delay}ms` }}
                >
                  {/* Gradient Border */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300`} />
                  
                  {/* Glass Card */}
                  <div className="relative h-full p-6 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.05) 40%, transparent 60%)',
                        animation: 'shimmer 2s infinite'
                      }}
                    />
                    
                    {/* Icon */}
                    <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 mx-auto mb-4`}>
                      <feature.icon className="w-full h-full text-white" />
                    </div>
                    
                    <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* What's Included in Reports */}
            <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-8 mb-12 border border-slate-700/50">
              <h3 className="text-2xl font-bold text-white mb-6">What's Included in Every Premium Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-left">
                  <h4 className="text-blue-400 font-semibold mb-3">Vehicle History</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Insurance write-off categories
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Outstanding finance check
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Stolen vehicle database
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Previous keeper history
                    </li>
                  </ul>
                </div>
                <div className="text-left">
                  <h4 className="text-blue-400 font-semibold mb-3">Technical Data</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Full MOT history & advisories
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Mileage verification
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Tax & SORN status
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      CO2 emissions & Euro rating
                    </li>
                  </ul>
                </div>
                <div className="text-left">
                  <h4 className="text-blue-400 font-semibold mb-3">Valuation & Specs</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Current market valuation
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Factory specifications
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Running costs analysis
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Insurance group rating
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Business Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="flex items-center gap-4 p-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                <HeadphonesIcon className="w-10 h-10 text-blue-400 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-white font-semibold">24/7 Support</h4>
                  <p className="text-gray-400 text-sm">Dedicated customer service team</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                <Clock className="w-10 h-10 text-green-400 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-white font-semibold">Instant Results</h4>
                  <p className="text-gray-400 text-sm">Reports generated in seconds</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                <TrendingUp className="w-10 h-10 text-purple-400 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-white font-semibold">Bulk Discounts</h4>
                  <p className="text-gray-400 text-sm">Volume pricing for businesses</p>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              {/* Primary CTA */}
              <Link 
                href="/pricing"
                className="group relative inline-flex items-center px-8 py-4 overflow-hidden rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                    animation: 'shimmer 1s infinite'
                  }}
                />
                
                <span className="relative text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Get Premium Access
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Link>
              
              {/* Secondary CTA */}
              <button 
                onClick={() => window.location.href = '/'}
                type="button"
                className="group relative inline-flex items-center px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                {/* Glass Background */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md" />
                <div className="absolute inset-0 border border-white/20 rounded-full" />
                
                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-xl" />
                </div>
                
                <span className="relative text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Try Free Sample Report
                </span>
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm">
              {[
                { icon: "✓", text: "GDPR Compliant" },
                { icon: "🔒", text: "SSL Encrypted" },
                { icon: "📊", text: "Real-time Data" },
                { icon: "💼", text: "Business Ready" }
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes aurora-shift {
          0%, 100% { transform: rotate(0deg) scale(1); }
          33% { transform: rotate(120deg) scale(1.1); }
          66% { transform: rotate(240deg) scale(0.9); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-30px) translateX(10px); }
          66% { transform: translateY(30px) translateX(-10px); }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}