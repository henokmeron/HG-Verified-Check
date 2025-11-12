import React from 'react';
import { VehicleReport } from '@/report/VehicleReport';
import { VidicheckSchema } from '@/report/types';
import PDFDownloadButton from './PDFDownloadButton';
import '@/report/report.css';

// Load the schema - in production this would come from the API
import schemaData from '@/data/vidcheck-package-schema.json';

// Import logo as a module to ensure it loads correctly
import logoImage from '@/assets/logo square perfect_1757451903301.png';

interface UnifiedReportDisplayProps {
  vehicleData: any;
  reportRaw: any;
  isPremium: boolean;
  lookupId?: string;
}

export default function UnifiedReportDisplay({ 
  vehicleData, 
  reportRaw, 
  isPremium,
  lookupId 
}: UnifiedReportDisplayProps) {
  // Ensure we have data to display
  if (!reportRaw) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <p className="text-gray-500 text-xl">No report data available</p>
        </div>
      </div>
    );
  }

  // Clean reportRaw to remove RequestInformation and ResponseInformation sections
  // This ensures Package, Response ID, Status Code, Status Message, Document Version are hidden
  // Single source of truth - same cleaning as PDF generator
  const cleanedReportRaw = { ...reportRaw };
  if (cleanedReportRaw.RequestInformation) {
    delete cleanedReportRaw.RequestInformation;
  }
  if (cleanedReportRaw.ResponseInformation) {
    delete cleanedReportRaw.ResponseInformation;
  }
  // Also clean nested fields if they exist in Results
  if (cleanedReportRaw.Results) {
    if (cleanedReportRaw.Results.RequestInformation) {
      delete cleanedReportRaw.Results.RequestInformation;
    }
    if (cleanedReportRaw.Results.ResponseInformation) {
      delete cleanedReportRaw.Results.ResponseInformation;
    }
  }

  // Define what documents are included in each package
  // FREE CHECK (Freecheckapi) - Only includes basic data from Vehicle Data UK API
  // Based on the actual Free Check schema from portal.vehicledataglobal.com
  // Note: VehicleHistory and DvlaTechnicalDetails are nested INSIDE VehicleDetails, not separate sections
  const freePackageDocs = {
    'Vehicle Details': true,           // VehicleDetails section (includes VehicleHistory, DvlaTechnicalDetails as nested fields)
    'Model Details': true,             // ModelDetails section with all nested data (Identification, Classification, Body, Dimensions, Weights, Powertrain, Safety, Emissions, Performance)
    'Mot History Details': true,       // MOT History section with full history
    'Vehicle Tax Details': true,       // VehicleTaxDetails section
    // FREE CHECK does NOT include these (only in paid packages):
    'PNC Details': false,              // NOT in free check
    'MIAFTR Details': false,           // NOT in free check
    'Finance Details': false,          // NOT in free check
    'Valuation Details': false,        // NOT in free check
    'Spec & Options Details': false,   // NOT in free check
    'Battery Details': false,          // NOT in free check
    'Tyre Details': false,             // NOT in free check
    'Vehicle Images': false,           // NOT in free check
    'Mileage Check Details': false     // NOT in free check
  };

  // FULL CHECK / PREMIUM package includes EVERYTHING from the comprehensive API
  // Based on the complete Full Check schema (VIDCheck) including:
  // - All Vehicle Details (Identification, Status, History, Technical)
  // - All Model Details (Identification, Classification, Body, Dimensions, Weights, Powertrain, Safety, Emissions, Performance)
  // - MOT History with full details and annotations
  // - PNC Details (Police National Computer - stolen vehicle checks)
  // - MIAFTR Details (Motor Insurance Anti-Fraud and Theft Register - write-offs)
  // - Finance Details (Outstanding finance agreements)
  // - Valuation Details (Multiple valuation figures)
  // - Tyre Details (Complete tyre and rim specifications)
  // - Battery Details (Starter battery information)
  // - Vehicle Tax Details (Road tax status and VED rates)
  // - Spec & Options Details (Factory equipment and packages)
  // - Vehicle Images (Multiple angle images)
  // - Mileage Check Details (Mileage history and anomaly detection)
  // FULL CHECK includes all available sections (same as free but with more data in each section)
  const fullPackageDocs = {
    'Vehicle Details': true,              // VehicleDetails with all nested fields (VehicleHistory, DvlaTechnicalDetails)
    'Model Details': true,                // ModelDetails with all nested sections
    'Vehicle Tax Details': true,          // VehicleTaxDetails section
    'PNC Details': true,                  // PncDetails - Police National Computer
    'MIAFTR Details': true,               // MiaftrDetails - Insurance write-off register
    'Finance Details': true,              // FinanceDetails - Outstanding finance
    'Valuation Details': true,            // ValuationDetails - Multiple valuations
    'Spec & Options Details': true,       // SpecAndOptionsDetails - Factory equipment
    'Battery Details': true,              // BatteryDetails - Starter battery info
    'Tyre Details': true,                 // TyreDetails - Complete tyre specifications
    'Vehicle Images': true,               // VehicleImageDetails - Multiple angle images
    'Mot History Details': true,          // MotHistoryDetails with full test history
    'Mileage Check Details': true         // MileageCheckDetails - Mileage history and anomalies
  };

  return (
    <div className="unified-report-container">
      {/* Download Button */}
      <div className="flex justify-end mb-4 p-4 bg-gray-50 border-b">
        <PDFDownloadButton 
          vehicleData={vehicleData}
          reportRaw={reportRaw}
          lookupId={lookupId}
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
        />
      </div>
      
      <VehicleReport
        schema={schemaData as VidicheckSchema}
        payload={cleanedReportRaw} // Use cleaned data to ensure hidden fields are not rendered
        mode={isPremium ? 'full' : 'free'}
        hideStrategy="hide" // Use 'hide' instead of 'blur' to ensure sections are shown if they have data
        packageDocs={isPremium ? fullPackageDocs : freePackageDocs}
        brand={{
          name: 'HG Verified Vehicle Check',
          logoUrl: logoImage,
          primary: '#0b5fff',
          accent: '#0ea5e9'
        }}
        dateOfCheck={reportRaw?.dateOfCheck || reportRaw?.checkTimestamp}
        reference={reportRaw?.reportReference || reportRaw?.Reference || 'N/A'}
        registration={vehicleData?.registration || reportRaw?.Results?.VehicleDetails?.VehicleIdentification?.Vrm || reportRaw?.Vrm || ''}
        vehicleData={vehicleData} // Pass vehicleData for fuel efficiency chart
      />
    </div>
  );
}