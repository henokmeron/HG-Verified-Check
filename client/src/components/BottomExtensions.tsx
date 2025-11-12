import { useLocation } from "wouter";
import { lazy, Suspense } from "react";

// Lazy load all hexagon widgets
const VehicleIdentityWidget = lazy(() => import("./widgets/VehicleIdentityWidget"));
const FinanceChecksWidget = lazy(() => import("./widgets/FinanceChecksWidget"));
const WriteOffWidget = lazy(() => import("./widgets/WriteOffWidget"));
const MileageChecksWidget = lazy(() => import("./widgets/MileageChecksWidget"));
const KeeperChangesWidget = lazy(() => import("./widgets/KeeperChangesWidget"));
const StolenCheckWidget = lazy(() => import("./widgets/StolenCheckWidget"));
const PlateChangeWidget = lazy(() => import("./widgets/PlateChangeWidget"));
const EngineReplacementWidget = lazy(() => import("./widgets/EngineReplacementWidget"));
const ColourChangeWidget = lazy(() => import("./widgets/ColourChangeWidget"));
const RoadTaxWidget = lazy(() => import("./widgets/RoadTaxWidget"));
const MotCheckWidget = lazy(() => import("./widgets/MotCheckWidget"));
const IndependentValuationWidget = lazy(() => import("./widgets/IndependentValuationWidget"));
const ManufacturerRecallWidget = lazy(() => import("./widgets/ManufacturerRecallWidget"));
const MuchMoreWidget = lazy(() => import("./widgets/MuchMoreWidget"));

// New widgets for varied pages
const BrandLogosWidget = lazy(() => import("./widgets/BrandLogosWidget"));
const TestimonialsWidget = lazy(() => import("./widgets/TestimonialsWidget"));
const CTABannerWidget = lazy(() => import("./widgets/CTABannerWidget"));
const PremiumBottomSection = lazy(() => import("./widgets/PremiumBottomSection"));
const FreeCheckExtensionWidget = lazy(() => import("./widgets/FreeCheckExtensionWidget"));

// Widget loading skeleton
const WidgetSkeleton = () => (
  <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);

// Page-specific widget configurations
type WidgetConfig = {
  hexagonWidgets?: React.ComponentType[];
  fullWidthWidgets?: React.ComponentType[];
};

const pageWidgets: Record<string, WidgetConfig> = {
  "/": {
    hexagonWidgets: [
      VehicleIdentityWidget,
      FinanceChecksWidget,
      WriteOffWidget,
      MileageChecksWidget,
      KeeperChangesWidget,
      StolenCheckWidget,
      PlateChangeWidget,
      EngineReplacementWidget,
      ColourChangeWidget,
      RoadTaxWidget,
      MotCheckWidget,
      IndependentValuationWidget
    ],
    fullWidthWidgets: [BrandLogosWidget, PremiumBottomSection, FreeCheckExtensionWidget]
  },
  "/dashboard": {
    hexagonWidgets: [
      VehicleIdentityWidget,
      FinanceChecksWidget,
      WriteOffWidget,
      MileageChecksWidget,
      KeeperChangesWidget,
      StolenCheckWidget,
      PlateChangeWidget,
      EngineReplacementWidget,
      ColourChangeWidget,
      RoadTaxWidget,
      MotCheckWidget,
      IndependentValuationWidget,
      ManufacturerRecallWidget,
      MuchMoreWidget
    ],
    fullWidthWidgets: []
  },
  "/public": {
    hexagonWidgets: [
      MotCheckWidget,
      RoadTaxWidget,
      VehicleIdentityWidget,
      FinanceChecksWidget,
      WriteOffWidget,
      StolenCheckWidget
    ],
    fullWidthWidgets: [PremiumBottomSection, FreeCheckExtensionWidget]
  },
  "/pricing": {
    fullWidthWidgets: [TestimonialsWidget, FreeCheckExtensionWidget]
  },
  "/about": {
    fullWidthWidgets: [BrandLogosWidget, TestimonialsWidget, FreeCheckExtensionWidget]
  },
  "/support": {
    hexagonWidgets: [
      MotCheckWidget,
      VehicleIdentityWidget,
      FinanceChecksWidget,
      RoadTaxWidget
    ],
    fullWidthWidgets: [CTABannerWidget]
  },
  "/faq": {
    hexagonWidgets: [
      VehicleIdentityWidget,
      FinanceChecksWidget,
      MotCheckWidget,
      RoadTaxWidget,
      WriteOffWidget,
      StolenCheckWidget
    ],
    fullWidthWidgets: [PremiumBottomSection]
  },
  "/terms": {
    fullWidthWidgets: []
  },
  "/privacy": {
    fullWidthWidgets: []
  },
  "/services": {
    hexagonWidgets: [
      VehicleIdentityWidget,
      FinanceChecksWidget,
      WriteOffWidget,
      MileageChecksWidget,
      KeeperChangesWidget,
      StolenCheckWidget,
      PlateChangeWidget,
      EngineReplacementWidget,
      ColourChangeWidget,
      RoadTaxWidget,
      MotCheckWidget,
      IndependentValuationWidget
    ],
    fullWidthWidgets: [BrandLogosWidget, TestimonialsWidget]
  }
};

export default function BottomExtensions() {
  const [location] = useLocation();

  // Get widgets for current path
  let config = pageWidgets[location];
  
  // Handle dynamic routes
  if (!config) {
    if (location.startsWith('/vehicle-report')) {
      config = {
        hexagonWidgets: pageWidgets["/dashboard"].hexagonWidgets,
        fullWidthWidgets: [PremiumBottomSection]
      };
    } else if (location.startsWith('/checkout')) {
      config = { fullWidthWidgets: [TestimonialsWidget] };
    } else {
      // Default fallback
      config = {};
    }
  }

  const { hexagonWidgets = [], fullWidthWidgets = [] } = config;

  // Don't render if no widgets
  if (hexagonWidgets.length === 0 && fullWidthWidgets.length === 0) {
    return null;
  }

  return (
    <>
      

      {/* Full-width widgets */}
      {fullWidthWidgets.map((Widget, index) => (
        <Suspense
          key={`full-widget-${location}-${index}`}
          fallback={
            <div className="w-full h-64 bg-gray-100 animate-pulse" />
          }
        >
          <Widget />
        </Suspense>
      ))}
    </>
  );
}