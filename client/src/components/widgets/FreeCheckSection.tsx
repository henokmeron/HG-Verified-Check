import { useState, useEffect, useRef } from "react";
import { Shield, CheckCircle, FileSearch, AlertTriangle, Sparkles, Award, TrendingUp, Lock } from "lucide-react";
import luxuryCarImage from "@assets/generated_images/luxury_car_dashboard_background_008f9095.png";

export default function FreeCheckSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative w-full overflow-hidden"
    >
      {/* Luxury Car Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${luxuryCarImage})`,
          filter: 'brightness(0.4) contrast(1.1)',
        }}
      />
      
      {/* Dark Gradient Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />
      
      {/* Metallic Accent Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top left, rgba(212, 175, 55, 0.1) 0%, transparent 40%),
            radial-gradient(ellipse at bottom right, rgba(192, 192, 192, 0.1) 0%, transparent 40%)
          `
        }}
      />
      
      {/* Moving Spotlight Effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(circle at 30% 50%, rgba(255, 215, 0, 0.15) 0%, transparent 35%),
            radial-gradient(circle at 70% 50%, rgba(192, 192, 192, 0.15) 0%, transparent 35%)
          `,
          animation: 'spotlight 8s ease-in-out infinite'
        }}
      />

      <div className="relative z-20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Premium Header Section */}
          <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in' : ''}`}>
            {/* Premium Badge */}
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 blur-2xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-slate-900 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Free Premium Check
                  <Award className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            {/* Main Heading with Metallic Effect */}
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer-gold 3s linear infinite'
                }}>
                Luxury Vehicle History Check
              </span>
            </h2>
            
            {/* Subheading */}
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
              Get instant access to comprehensive vehicle data for any luxury or premium car.
              <br />
              <span className="text-yellow-400 font-semibold">
                Protect your investment with our professional-grade verification service.
              </span>
            </p>
            
            {/* Trust Badges */}
            <div className="flex justify-center items-center gap-4 mt-8 flex-wrap">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-gray-300 border border-white/20">
                ✓ DVSA Approved Data
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-gray-300 border border-white/20">
                ✓ Police National Computer
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-gray-300 border border-white/20">
                ✓ MIAFTR Insurance Database
              </span>
            </div>
          </div>

          {/* Vehicle Check Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {[
              { 
                icon: Shield,
                title: "Insurance Write-Off Check",
                desc: "Category A, B, C, D, N & S verification",
                gradient: "from-red-500 to-orange-500",
                metallic: "from-red-300 via-red-400 to-red-300"
              },
              { 
                icon: FileSearch,
                title: "Full MOT History",
                desc: "Complete test records & advisories",
                gradient: "from-blue-500 to-indigo-500",
                metallic: "from-blue-300 via-blue-400 to-blue-300"
              },
              { 
                icon: AlertTriangle,
                title: "Outstanding Finance",
                desc: "HP, PCP & lease checks included",
                gradient: "from-green-500 to-emerald-500",
                metallic: "from-green-300 via-green-400 to-green-300"
              },
              { 
                icon: CheckCircle,
                title: "Stolen Vehicle Check",
                desc: "PNC database verification",
                gradient: "from-purple-500 to-pink-500",
                metallic: "from-purple-300 via-purple-400 to-purple-300"
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className={`relative group transform transition-all duration-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Metallic Border Glow */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                
                {/* Card Background */}
                <div className="relative h-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 overflow-hidden">
                  {/* Metallic Shimmer Effect */}
                  <div 
                    className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                    style={{
                      background: `linear-gradient(105deg, transparent 40%, ${hoveredCard === index ? 'rgba(255, 215, 0, 0.3)' : 'transparent'} 50%, transparent 60%)`,
                      animation: hoveredCard === index ? 'sweep 1s ease-out' : 'none'
                    }}
                  />
                  
                  {/* Carbon Fiber Pattern */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 2px,
                        rgba(255, 255, 255, 0.03) 2px,
                        rgba(255, 255, 255, 0.03) 4px
                      )`
                    }}
                  />
                  
                  {/* Icon Container */}
                  <div className="relative mb-4">
                    <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${feature.metallic} p-3 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      style={{
                        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer-gold 3s linear infinite'
                      }}>
                      <feature.icon className="w-full h-full text-slate-900" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {feature.desc}
                  </p>
                  
                  {/* Luxury Accent */}
                  <div className="absolute bottom-2 right-2">
                    <Sparkles className="w-4 h-4 text-yellow-400/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Check Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: TrendingUp, title: "Market Valuation", desc: "Current trade & retail values" },
              { icon: Lock, title: "V5C Authentication", desc: "Verify genuine logbook" },
              { icon: Award, title: "Spec & Equipment", desc: "Factory options & modifications" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
                <item.icon className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                  <p className="text-gray-400 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Premium CTA Section */}
          <div className={`text-center ${isVisible ? 'animate-fade-in' : ''}`}>
            {/* What's Included */}
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider">Comprehensive Check Includes</p>
              <div className="flex justify-center items-center gap-3 flex-wrap text-sm">
                <span className="text-gray-300">• Mileage Verification</span>
                <span className="text-gray-300">• Tax Status</span>
                <span className="text-gray-300">• Keeper Changes</span>
                <span className="text-gray-300">• Plate Changes</span>
                <span className="text-gray-300">• Export/Import Status</span>
                <span className="text-gray-300">• Colour Changes</span>
              </div>
            </div>
            
            {/* Premium Features List */}
            <div className="flex justify-center items-center gap-6 text-sm text-gray-400 mb-8">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Instant Results
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                100% Accurate Data
              </span>
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Money Back Guarantee
              </span>
            </div>
            
            {/* Disclaimer */}
            <p className="text-xs text-gray-500 max-w-2xl mx-auto">
              Start with our FREE basic check including MOT status, tax details, and basic specifications. 
              Upgrade to our <span className="text-yellow-400">Premium Report</span> for complete vehicle history 
              including all write-off categories, outstanding finance, and stolen vehicle checks.
            </p>
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes spotlight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }
        
        @keyframes shimmer-gold {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}