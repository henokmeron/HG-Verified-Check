import { useState, useEffect } from "react";
import { CheckCircle2, Shield, Clock, TrendingUp, Users, Database, ArrowRight, Search, BarChart3, Lock, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PublicVehicleLookupForm from "@/components/PublicVehicleLookupForm";
// import PublicVehicleDetails from "@/components/PublicVehicleDetails"; // Removed - old report component
import { useAuth } from "@/hooks/useAuth";
import "@/styles/home-clean.css";
import MiniFeatureGrid from "@/components/home/MiniFeatureGrid";

// Import car images
import luxurySuvImage from "@assets/550cbf03ecad04de2c7c008a_1756978134447.webp";
import electricVehicle from "@assets/generated_images/Electric_vehicle_charging_50d0357a.png";
import inspectionScene from "@assets/generated_images/Vehicle_inspection_scene_4d6b5f28.png";

import grok_video_ezgif_com_video_to_gif_converter from "@assets/grok-video-ezgif.com-video-to-gif-converter_1757122664958.gif";

import UnifiedReportDisplay from "@/components/UnifiedReportDisplay";

export default function PublicPage() {
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [reportRaw, setReportRaw] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const { user } = useAuth();

  const handleLookupResult = (data: any) => {
    console.log('Public page received lookup result:', data);
    
    // Handle both response formats: data.vehicleData OR data.data
    const vehicleData = data.vehicleData || data.data;
    setVehicleData(vehicleData);
    setReportRaw(data.reportRaw);
    setShowReport(true);
    
    // Scroll to report after a short delay - but only scroll a bit, not to bottom
    setTimeout(() => {
      const reportElement = document.getElementById('vehicle-report-section');
      if (reportElement) {
        // Calculate position to scroll - just enough to show the report, not to bottom
        const elementTop = reportElement.getBoundingClientRect().top + window.pageYOffset;
        const offset = 50; // Small offset from top
        window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
      }
    }, 300);
  };

  return (
    <main id="home" className="pt-[0px] pb-[0px] mt-[-61px] mb-[-61px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Microsoft-Style Hero Section with Car Image */}
        <section className="hero mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-[42px] pb-[42px] mt-[-55px] mb-[-55px]">
            <div className="text-left">
              <h1 className="sm:text-4xl md:text-5xl font-bold text-[33px] mt-[39px] mb-[39px]">
                Know Everything.
                <span className="block">Risk Nothing.</span>
              </h1>

              {/* Mini feature grid goes immediately under the hero heading */}
              <div className="mt-4 md:mt-6 mb-8">
                <MiniFeatureGrid />
              </div>

            </div>

            <div className="relative">
              <img 
                src={luxurySuvImage} 
                alt="Premium vehicle inspection" 
                className="w-full h-auto rounded-lg border border-black shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Professional Vehicle Lookup Section with DRAMATIC DARK Background */}
        <section className="py-20 relative mt-[-85px] mb-[-85px]" style={{
          background: `#000000`,
          backgroundImage: `
            linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)
          `,
          position: 'relative'
        }}>
          {/* HIGHLY VISIBLE Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 opacity-30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-30 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
            {/* Add animated stars */}
            <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-40 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-30 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="max-w-5xl mx-auto relative z-10">
            
            
            <div 
              className="border-4 border-yellow-400 shadow-2xl overflow-hidden relative rounded-lg" 
              style={{
                background: `
                  linear-gradient(135deg, 
                    #1a1f3a 0%, 
                    #2d1b69 25%, 
                    #0f172a 50%, 
                    #1e1b4b 75%, 
                    #18181b 100%)
                `,
                backgroundImage: `
                  radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 40% 20%, rgba(255, 219, 98, 0.2) 0%, transparent 50%),
                  linear-gradient(135deg, #1a1f3a 0%, #2d1b69 25%, #0f172a 50%, #1e1b4b 75%, #18181b 100%)
                `,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 100px rgba(120, 119, 198, 0.1)'
              }}
            >
              {/* Premium Glow Effect */}
              <div className="absolute inset-0 opacity-40" style={{
                background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                pointerEvents: 'none'
              }}></div>
              {/* Animated Border Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-70 blur-2xl -z-10"></div>
              <div className="p-0">
                {/* Incredible Professional Background Section */}
                <div className="relative p-16 overflow-hidden bg-[#7e8790]" style={{
                  background: `
                    radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.3) 0%, transparent 40%),
                    radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.3) 0%, transparent 40%),
                    radial-gradient(circle at center, rgba(236, 72, 153, 0.2) 0%, transparent 50%),
                    linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1e1b4b 50%, #18181b 100%)
                  `,
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 15s ease infinite'
                }}>
                  {/* Premium Shimmer Effect */}
                  <div className="absolute inset-0 opacity-30" style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                    backgroundSize: '200% 200%',
                    animation: 'shimmer 3s linear infinite'
                  }}></div>
                  {/* Premium Animated Mesh Background */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
                      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
                    `,
                    backgroundSize: '100px 100px'
                  }}></div>
                  
                  {/* Animated Stars Background */}
                  <div className="absolute inset-0">
                    <div className="absolute top-10 left-10 w-3 h-3 bg-blue-400 rounded-full animate-pulse blur-sm"></div>
                    <div className="absolute top-20 right-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse blur-sm" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-20 left-20 w-3 h-3 bg-pink-400 rounded-full animate-pulse blur-sm" style={{animationDelay: '2s'}}></div>
                    <div className="absolute top-40 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse blur-sm" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute bottom-40 right-1/3 w-3 h-3 bg-indigo-400 rounded-full animate-pulse blur-sm" style={{animationDelay: '1.5s'}}></div>
                    <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-pulse blur-sm" style={{animationDelay: '3s'}}></div>
                  </div>
                  
                  {/* Professional Hexagon Pattern Overlay */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:rgb(59,130,246);stop-opacity:0.1' /%3E%3Cstop offset='100%25' style='stop-color:rgb(168,85,247);stop-opacity:0.1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M50 0 L85 25 L85 75 L50 100 L15 75 L15 25 Z' fill='none' stroke='url(%23grad)' stroke-width='0.5'/%3E%3C/svg%3E")`,
                    backgroundSize: '100px 100px'
                  }}></div>
                  
                  {/* Floating Gradient Orbs with Animation */}
                  <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full filter blur-3xl opacity-30" style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(147,51,234,0.4) 50%, transparent 70%)',
                    animation: 'float 20s ease-in-out infinite'
                  }}></div>
                  <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full filter blur-3xl opacity-30" style={{
                    background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(236,72,153,0.4) 50%, transparent 70%)',
                    animation: 'float 20s ease-in-out infinite reverse',
                    animationDelay: '2s'
                  }}></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-3xl opacity-20" style={{
                    background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(219,39,119,0.2) 50%, transparent 70%)',
                    animation: 'pulse 8s ease-in-out infinite'
                  }}></div>
                  
                  {/* Premium Floating Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white rounded-full shadow-2xl border-2 border-white/40 backdrop-blur-sm z-20">
                    <Zap className="h-5 w-5 animate-pulse" />
                    <span className="text-sm font-bold tracking-wider">LIVE SYSTEM</span>
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </div>
                  
                  {/* Section Header */}
                  <div className="text-center mb-10 relative z-10">
                    <h3 className="text-4xl font-bold mb-3 text-white drop-shadow-2xl">
                      <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Enter Your Vehicle Registration
                      </span>
                    </h3>
                    <p className="text-gray-200 max-w-2xl mx-auto drop-shadow-lg ml-[111px] mr-[111px] text-[19px]">
                      Instant access to complete vehicle history • MOT records • Insurance write-offs • 
                      Outstanding finance • Stolen checks • And much more
                    </p>
                  </div>
                  
                  {/* Main Search Form */}
                  <div className="max-w-3xl mx-auto relative z-10">
                    <PublicVehicleLookupForm onResult={handleLookupResult} />
                    
                    {/* Vehicle Report Display - Directly below search form */}
                    {showReport && reportRaw && (
                      <div id="vehicle-report-section" className="mt-8">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                          <UnifiedReportDisplay
                            vehicleData={vehicleData}
                            reportRaw={reportRaw}
                            isPremium={false}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Trust Indicators Row */}
                  <div className="mt-10 pt-10 border-t border-white/20 relative z-10">
                    <div className="flex flex-wrap justify-center gap-8">
                      <div className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform border-2 border-white/30">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-white">SSL Secured</div>
                          <div className="text-sm text-gray-300">Bank-level encryption</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform border-2 border-white/30">
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-white">DVLA Licensed</div>
                          <div className="text-sm text-gray-300">Official data partner</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform border-2 border-white/30">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-white">Instant Results</div>
                          <div className="text-sm text-gray-300">Under 3 seconds</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            
          </div>
        </section>

        {/* Vehicle Details */}
        {/* {vehicleData && (
          <section className="mb-16">
            <Card>
              <CardContent className="p-0">
                <PublicVehicleDetails vehicleData={vehicleData} reportRaw={reportRaw} />
              </CardContent>
            </Card>
          </section>
        )} */}

        {/* Microsoft-Style Feature Grid Section */}
        <section className="py-16 border-t border-black">
          {/* Comprehensive Data Points Grid */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Complete Vehicle Intelligence Coverage</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { 
                  title: "Technical Specifications", 
                  points: ["Engine size & type", "Emissions & CO2", "Fuel consumption", "Performance data"],
                  icon: Database 
                },
                { 
                  title: "Safety & Compliance", 
                  points: ["MOT history & advisories", "Outstanding recalls", "Safety ratings", "Tax status"],
                  icon: Shield 
                },
                { 
                  title: "Ownership History", 
                  points: ["Previous keepers", "Plate changes", "Color changes", "Import/Export status"],
                  icon: Users 
                },
                { 
                  title: "Financial Status", 
                  points: ["Outstanding finance", "Insurance write-off", "Market valuation", "Total loss register"],
                  icon: TrendingUp 
                },
                { 
                  title: "Mileage Verification", 
                  points: ["Odometer readings", "Mileage anomalies", "Clocking detection", "Service records"],
                  icon: BarChart3 
                },
                { 
                  title: "Security Checks", 
                  points: ["Stolen status (PNC)", "VIN verification", "Cloned vehicle check", "Export marker"],
                  icon: Lock 
                }
              ].map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.title} className="border-black hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className="h-6 w-6" />
                        <h4 className="font-bold text-lg">{category.title}</h4>
                      </div>
                      <ul className="space-y-2">
                        {category.points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                            <span className="text-sm">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Trust Banner */}
            <div className="bg-gray-50 border-2 border-black rounded-lg p-6">
              <div className="flex flex-wrap items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">DVLA</div>
                  <div className="text-sm">Official Partner</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">MIAFTR</div>
                  <div className="text-sm">Insurance Database</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">PNC</div>
                  <div className="text-sm">Police Database</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">VDGI</div>
                  <div className="text-sm">Vehicle Data UK</div>
                </div>
              </div>
            </div>
          </div>

          {/* Electric Vehicle Section with Image */}
          <div className="py-16 border-t border-black">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-3xl font-bold mb-6">Electric & Hybrid Vehicle Intelligence</h3>
                <p className="text-lg mb-6">
                  Specialized reporting for the future of motoring. Our advanced EV analysis provides critical insights 
                  for electric and hybrid vehicles, helping you make informed decisions about sustainable transport.
                </p>
                <Button size="lg" className="w-full md:w-auto bg-black hover:bg-gray-800 text-white border-2 border-black">
                  <Zap className="h-5 w-5 mr-2" />
                  Learn About EV Checks
                </Button>
              </div>
              <div>
                <img 
                  src={electricVehicle} 
                  alt="Electric vehicle charging station" 
                  className="w-full h-auto rounded-lg border border-black"
                />
              </div>
            </div>
          </div>



        </section>
      </div>
    </main>
  );
}