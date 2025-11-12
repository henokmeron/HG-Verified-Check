import { useState, useEffect, useRef } from "react";
import { Plus, Minus } from "lucide-react";
import { Link } from "wouter";

interface HexagonWidgetProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  expandedContent?: React.ReactNode;
  defaultExpanded?: boolean;
  linkTo?: string;
}

export default function HexagonWidget({ 
  icon, 
  title, 
  color, 
  expandedContent,
  defaultExpanded = false,
  linkTo = "/pricing"
}: HexagonWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isVisible, setIsVisible] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
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
      className={`hexagon-widget-container transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDelay: `${Math.random() * 200}ms` }}
    >
      <div 
        className="hexagon-widget-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        onClick={() => expandedContent && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="hexagon-icon group-hover:rotate-12 transition-transform duration-300"
              style={{ 
                '--hex-color': color,
                width: '48px',
                height: '48px',
                position: 'relative'
              } as React.CSSProperties}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon 
                  points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" 
                  fill="none" 
                  stroke={color}
                  strokeWidth="2"
                  className="group-hover:fill-current group-hover:fill-opacity-10 transition-all duration-300"
                />
              </svg>
              <div 
                className="absolute inset-0 flex items-center justify-center transition-colors duration-300" 
                style={{ color }}
              >
                {icon}
              </div>
            </div>
            <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
              {title}
            </span>
          </div>
          {expandedContent && (
            <div className="flex items-center">
              {isExpanded ? (
                <Minus className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
              ) : (
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
              )}
            </div>
          )}
        </div>
        
        {isExpanded && expandedContent && (
          <div className="mt-4 pl-16 text-sm text-gray-600 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            {expandedContent}
            {linkTo && (
              <Link href={linkTo} className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center mt-2 hover-group">
                More 
                <span className="ml-1 hover-group:hover:translate-x-1 transition-transform duration-200">›</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}