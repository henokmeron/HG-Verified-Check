import { ReactNode, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Shield, Zap } from "lucide-react";

// Lazy load widget components for performance
const VehicleCheckWidget = lazy(() => import("@/components/widgets/VehicleCheckWidget"));
const MotReminderWidget = lazy(() => import("@/components/widgets/MotReminderWidget"));
const InsuranceQuoteWidget = lazy(() => import("@/components/widgets/InsuranceQuoteWidget"));
const ServiceDocWidget = lazy(() => import("@/components/widgets/ServiceDocWidget"));
const VehicleValuationWidget = lazy(() => import("@/components/widgets/VehicleValuationWidget"));
const RecallCheckWidget = lazy(() => import("@/components/widgets/RecallCheckWidget"));

// Widget loading placeholder
const WidgetSkeleton = () => (
  <div className="bg-gray-100 rounded-lg p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Marketing CTA component for landing page
const MarketingCTA = () => (
  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
      <p className="text-lg mb-6">Join thousands of users who trust our vehicle checks</p>
      <div className="flex gap-4 justify-center">
        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
          <CreditCard className="mr-2 h-5 w-5" />
          View Pricing
        </Button>
        <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
          Learn More
        </Button>
      </div>
    </div>
  </div>
);

// Trust badges component for pricing page
const TrustBadges = () => (
  <div className="bg-gray-100 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-500" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span>Instant Activation</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-blue-500" />
          <span>30-Day Money Back</span>
        </div>
      </div>
    </div>
  </div>
);

// Widget grid container
const WidgetGrid = ({ widgets }: { widgets: Array<React.ComponentType> }) => (
  <div className="bg-gradient-to-b from-gray-50 to-white py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Additional Services</h3>
        <p className="text-gray-600">Enhance your vehicle management experience</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map((Widget, index) => (
          <Suspense key={`widget-${index}`} fallback={<WidgetSkeleton />}>
            <Widget />
          </Suspense>
        ))}
      </div>
    </div>
  </div>
);

// Define bottom extensions for specific routes
const bottomExtensionsConfig: Record<string, () => ReactNode> = {
  '/': () => <MarketingCTA />,
  
  '/pricing': () => <TrustBadges />,
  
  '/dashboard': () => (
    <WidgetGrid widgets={[VehicleCheckWidget, MotReminderWidget, InsuranceQuoteWidget, RecallCheckWidget, VehicleValuationWidget, ServiceDocWidget]} />
  ),
  
  '/public': () => (
    <WidgetGrid widgets={[MotReminderWidget, InsuranceQuoteWidget, VehicleValuationWidget]} />
  ),
  
  // Vehicle report page - show relevant widgets
  '/vehicle-report': () => (
    <WidgetGrid widgets={[RecallCheckWidget, VehicleValuationWidget, MotReminderWidget, InsuranceQuoteWidget]} />
  ),
  
  // Add more route-specific bottom extensions as needed
};

export function getBottomExtensions(pathname: string): ReactNode | null {
  // Handle dynamic routes (e.g., /vehicle-report/ABC123)
  if (pathname.startsWith('/vehicle-report')) {
    return bottomExtensionsConfig['/vehicle-report']?.();
  }
  
  const extension = bottomExtensionsConfig[pathname];
  return extension ? extension() : null;
}