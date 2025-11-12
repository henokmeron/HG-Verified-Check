import { lazy, Suspense, useEffect, useRef, useState } from "react";

const FreeCheckSection = lazy(() => import("./FreeCheckSection"));

export default function FreeCheckExtensionWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsLoaded(true);
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isLoaded]);

  return (
    <div 
      ref={sectionRef}
      id="free-check-extensions"
      className="w-full"
    >
      {isLoaded && (
        <Suspense fallback={
          <div className="w-full h-96 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 animate-pulse flex items-center justify-center">
            <div className="text-white text-lg">Loading...</div>
          </div>
        }>
          <FreeCheckSection />
        </Suspense>
      )}
    </div>
  );
}