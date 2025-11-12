import { useEffect, useRef, useState } from "react";
import { TrendingUp, Users, Shield, Star } from "lucide-react";

const stats = [
  { icon: Users, value: "2.5M+", label: "Happy Customers", color: "#3b82f6" },
  { icon: Shield, value: "35M+", label: "Vehicles Checked", color: "#10b981" },
  { icon: Star, value: "4.9/5", label: "Customer Rating", color: "#f59e0b" },
  { icon: TrendingUp, value: "99.9%", label: "Uptime Reliability", color: "#8b5cf6" }
];

export default function StatsWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate numbers
          stats.forEach((stat, index) => {
            const target = parseFloat(stat.value.replace(/[^0-9.]/g, ''));
            const increment = target / 50;
            let current = 0;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              setCounts(prev => {
                const newCounts = [...prev];
                newCounts[index] = current;
                return newCounts;
              });
            }, 30);
          });
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
      className="w-full py-16 bg-gradient-to-r from-blue-600 to-indigo-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const displayValue = stat.value.includes('.')
              ? counts[index].toFixed(1)
              : Math.floor(counts[index]).toString();
            const suffix = stat.value.replace(/[0-9.]/g, '');
            
            return (
              <div
                key={stat.label}
                className={`text-center text-white transform transition-all duration-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold mb-2 animate-pulse">
                  {displayValue}{suffix}
                </div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}