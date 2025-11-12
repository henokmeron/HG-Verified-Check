import { ReactNode } from "react";
import UniversalNavbar from "./UniversalNavbar";
import Footer from "./Footer";
import BottomExtensions from "./BottomExtensions";
import carBackgroundUrl from '@assets/generated_images/luxury_car_dashboard_background_008f9095.png';

interface BaseLayoutProps {
  children: ReactNode;
  variant: 'marketing' | 'app' | 'admin';
  showFooter?: boolean;
  showBackground?: boolean;
}

export default function BaseLayout({ 
  children, 
  variant, 
  showFooter = true,
  showBackground = true 
}: BaseLayoutProps) {
  // Don't show background for app variant pages
  const shouldShowBackground = showBackground && variant !== 'app';

  return (
    <>
      {/* Professional Background with Car Image */}
      {shouldShowBackground && (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-700 ease-out z-0"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%), url(${carBackgroundUrl})`,
            }}
          />
          
          {/* Animated Gradient Overlay */}
          <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/20 animate-pulse z-0" />
        </>
      )}
      
      {/* Fixed Navbar at top */}
      <div className="fixed top-0 left-0 right-0 z-[1000]">
        <UniversalNavbar variant={variant} />
      </div>
      
      {/* App container with padding for fixed navbar */}
      <div id="app" className="min-h-[100dvh] flex flex-col bg-black relative pt-[120px] sm:pt-[95px] md:pt-[105px]">
        {/* Main content area */}
        <main className="flex-1 w-full relative z-10">
          {children}
        </main>
        
        {/* Bottom Extensions Slot */}
        <BottomExtensions />
        
        {showFooter && <Footer />}
      </div>
    </>
  );
}