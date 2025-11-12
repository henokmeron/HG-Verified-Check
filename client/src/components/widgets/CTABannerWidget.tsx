import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";

export default function CTABannerWidget() {
  const [isVisible, setIsVisible] = useState(false);
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

  return (
    <div 
      ref={widgetRef}
      className={`w-full py-16 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 transform transition-all duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Sparkles className="w-12 h-12 text-white mx-auto mb-4 animate-bounce" />
        <h2 className="text-4xl font-bold text-white mb-4 animate-pulse">
          Get Your Full Vehicle Report Today
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of smart buyers who check before they buy. 
          Comprehensive reports from just £7.00
        </p>
        <Link href="/pricing">
          <a className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 hover:scale-105 transform transition-all duration-300 shadow-2xl group">
            View Pricing Plans
            <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
          </a>
        </Link>
        <p className="text-white/70 text-sm mt-6">
          No subscription required • Instant results • Money-back guarantee
        </p>
      </div>
    </div>
  );
}