import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Car, Sparkles, Crown, Diamond, FileText, X } from "lucide-react";
// import UnifiedVehicleReport from "../UnifiedVehicleReport"; // Removed - old report component
// import { sampleVehicleData } from "./sampleReportData"; // Removed - old sample data
import bentleyImage from '@/assets/bentley-continental-gt-orange.png';

// Using imported comprehensive sample data from sampleReportData.ts
const luxuryBrands = [
  {
    name: "Rolls-Royce",
    tagline: "Luxury Without Compromise",
    gradient: "from-purple-600 to-pink-600",
    glowColor: "rgba(147, 51, 234, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
  },
  {
    name: "Bentley",
    tagline: "Extraordinary Journeys",
    gradient: "from-emerald-600 to-teal-600",
    glowColor: "rgba(16, 185, 129, 0.3)",
    imageUrl: bentleyImage, // Stunning orange Bentley Continental GT
  },
  {
    name: "Ferrari",
    tagline: "Pure Italian Excellence",
    gradient: "from-red-600 to-orange-600",
    glowColor: "rgba(239, 68, 68, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80",
  },
  {
    name: "Lamborghini",
    tagline: "Expect The Unexpected",
    gradient: "from-yellow-600 to-amber-600",
    glowColor: "rgba(245, 158, 11, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&q=80", // Real Lamborghini Huracán
  },
  {
    name: "McLaren",
    tagline: "Fearlessly Forward",
    gradient: "from-orange-600 to-red-600",
    glowColor: "rgba(251, 146, 60, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&q=80",
  },
  {
    name: "Aston Martin",
    tagline: "Beauty & Soul",
    gradient: "from-green-600 to-emerald-600",
    glowColor: "rgba(34, 197, 94, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  },
  {
    name: "Porsche",
    tagline: "There Is No Substitute",
    gradient: "from-gray-600 to-slate-600",
    glowColor: "rgba(100, 116, 139, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80",
  },
  {
    name: "Bugatti",
    tagline: "Art, Forme, Technique",
    gradient: "from-blue-600 to-indigo-600",
    glowColor: "rgba(59, 130, 246, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800&q=80",
  },
];

export default function BrandLogosWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (widgetRef.current) {
      observer.observe(widgetRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleViewReport = (brandName: string) => {
    setSelectedBrand(brandName);
    setShowReport(true);
  };

  return (
    <>
      <div 
        ref={widgetRef}
        className="w-full py-20 relative overflow-hidden luxury-section"
        style={{
          background: `transparent`,
          position: 'relative'
        }}
      >
        {/* Beautiful sky gradient overlay - positioned absolutely */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(180deg, 
                transparent 0%,
                rgba(135, 206, 250, 0.03) 10%,
                rgba(173, 216, 230, 0.05) 20%,
                rgba(240, 248, 255, 0.06) 30%,
                rgba(135, 206, 250, 0.08) 40%,
                rgba(70, 130, 180, 0.1) 50%,
                rgba(25, 25, 112, 0.12) 70%,
                rgba(0, 0, 0, 0.15) 90%,
                transparent 100%
              ),
              radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.05) 0%, transparent 40%),
              radial-gradient(ellipse at top right, rgba(135, 206, 250, 0.1) 0%, transparent 40%),
              radial-gradient(ellipse at center, rgba(240, 248, 255, 0.03) 0%, transparent 50%),
              radial-gradient(ellipse at bottom, rgba(255, 223, 0, 0.02) 0%, transparent 60%)
            `,
            backdropFilter: 'blur(1px)'
          }}
        />
        {/* Premium sky-inspired animated background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 80% 30%, rgba(135, 206, 250, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, rgba(240, 248, 255, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 20% 80%, rgba(173, 216, 230, 0.06) 0%, transparent 40%),
                radial-gradient(circle at 90% 70%, rgba(255, 255, 255, 0.04) 0%, transparent 30%)
              `,
              animation: 'float 20s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)
              `,
              backgroundSize: '200% 100%',
              animation: 'shimmer 8s linear infinite'
            }}
          />
        </div>


        {/* CSS for animations */}
        <style>{`
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
      {/* Sample Report Dialog - Fullscreen with transparent background */}
      {showReport && typeof document !== 'undefined' && document.getElementById('modal-root') && createPortal(
        <>
          {/* Transparent overlay background */}
          <div 
            className="fixed inset-0 bg-black/10"
            style={{ zIndex: 9998 }}
            onClick={() => setShowReport(false)}
          />
          
          {/* Fullscreen report content */}
          <div 
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 9999 }}
          >
            <div className="w-full h-full bg-white overflow-hidden relative">
              {/* Close button */}
              <button
                onClick={() => setShowReport(false)}
                className="absolute right-4 top-4 rounded-full bg-gray-200 hover:bg-gray-300 p-3 shadow-lg transition-all"
                style={{ zIndex: 10000 }}
              >
                <X className="h-6 w-6 text-gray-700" />
                <span className="sr-only">Close</span>
              </button>
              
              {/* Report content with scroll */}
              <div className="h-full w-full overflow-y-auto p-4 bg-white">
                {/* Report component temporarily disabled during rebuild */}
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500 text-2xl mb-4">Report Display Under Construction</p>
                    <p className="text-gray-400">The new unified report template is being built</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.getElementById('modal-root')!
      )}
    </>
  );
}