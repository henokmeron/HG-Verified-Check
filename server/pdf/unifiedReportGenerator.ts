import puppeteer from 'puppeteer';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { VehicleReport } from '../../client/src/report/VehicleReport';
import { MileageGraph } from '../../client/src/report/MileageGraph';
import { FuelEfficiencyChart } from '../../client/src/report/FuelEfficiencyChart';
import { MotHistory } from '../../client/src/report/MotHistory';
import { VidicheckSchema } from '../../client/src/report/types';
import fs from 'fs/promises';
import path from 'path';

// Load the schema
async function loadSchema(): Promise<VidicheckSchema> {
  const schemaPath = path.join(process.cwd(), 'client/src/data/vidcheck-package-schema.json');
  const schemaContent = await fs.readFile(schemaPath, 'utf-8');
  return JSON.parse(schemaContent);
}

// Define package documents - matching the actual Free Check schema from portal.vehicledataglobal.com
// FREE CHECK (Freecheckapi) includes only: VehicleDetails, ModelDetails, MotHistoryDetails, VehicleTaxDetails
// Note: VehicleHistory and DvlaTechnicalDetails are NESTED inside VehicleDetails, not separate sections
const freePackageDocs = {
  'Vehicle Details': true,           // VehicleDetails section (includes VehicleHistory, DvlaTechnicalDetails as nested fields)
  'Model Details': true,             // ModelDetails section with all nested data (Identification, Classification, Body, Dimensions, Weights, Powertrain, Safety, Emissions, Performance)
  'Mot History Details': true,       // MOT History section with full history - INCLUDED in free check
  'Vehicle Tax Details': true,       // VehicleTaxDetails section - INCLUDED in free check
  // FREE CHECK does NOT include these (only in paid packages):
  'PNC Details': false,              // NOT in free check
  'MIAFTR Details': false,           // NOT in free check (was 'Miaftr Details')
  'Finance Details': false,          // NOT in free check
  'Valuation Details': false,        // NOT in free check (was 'Ukvd Valuation Details')
  'Spec & Options Details': false,   // NOT in free check (was 'Spec And Options Details')
  'Battery Details': false,          // NOT in free check
  'Tyre Details': false,             // NOT in free check
  'Vehicle Images': false,           // NOT in free check (was 'Vehicle Image Details')
  'Mileage Check Details': false     // NOT in free check
};

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

export async function generateUnifiedPDF(
  vehicleData: any,
  reportRaw: any,
  isPremium: boolean,
  dateOfCheck?: Date | string,
  reference?: string
): Promise<Buffer> {
  try {
    // Clean reportRaw to remove RequestInformation and ResponseInformation sections
    // This ensures Package, Response ID, Status Code, Status Message, Document Version are hidden
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
    
    // Load schema
    const schema = await loadSchema();
    
    // Load CSS
    const cssPath = path.join(process.cwd(), 'client/src/report/report.css');
    const reportCSS = await fs.readFile(cssPath, 'utf-8');
    console.log('📄 CSS loaded, size:', reportCSS.length, 'bytes');
    
    // Load logo and convert to base64 for PDF - try multiple locations
    let logoUrl = '';
    const logoPaths = [
      path.join(process.cwd(), 'public', 'logo.png'),
      path.join(process.cwd(), 'client', 'src', 'assets', 'logo square perfect_1757451903301.png'),
      path.join(process.cwd(), 'public', 'logo square perfect_1757451903301.png'),
      path.join(process.cwd(), 'public', 'Circle logo.png'),
    ];
    
    for (const logoPath of logoPaths) {
      try {
        if (await fs.access(logoPath).then(() => true).catch(() => false)) {
          const logoBuffer = await fs.readFile(logoPath);
          const logoBase64 = logoBuffer.toString('base64');
          const ext = path.extname(logoPath).toLowerCase();
          const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
          logoUrl = `data:${mimeType};base64,${logoBase64}`;
          console.log('✅ Logo loaded successfully from:', logoPath);
          break;
        }
      } catch (error) {
        // Try next path
        continue;
      }
    }
    
    if (!logoUrl) {
      console.warn('⚠️ Could not load logo from any location, report will render without logo');
    }
    
    // Extract date of check and reference from reportRaw if not provided
    const checkDate = dateOfCheck || reportRaw?.dateOfCheck || reportRaw?.checkTimestamp || new Date();
    const reportReference = reference || reportRaw?.reportReference || reportRaw?.Reference || 'N/A';
    
    // Extract registration number - try multiple sources
    const registration = vehicleData?.registration 
      || vehicleData?.Registration
      || cleanedReportRaw?.Results?.VehicleDetails?.VehicleIdentification?.Vrm 
      || cleanedReportRaw?.Results?.VehicleDetails?.VehicleIdentification?.RegistrationNumber
      || cleanedReportRaw?.Vrm 
      || cleanedReportRaw?.Registration
      || cleanedReportRaw?.registration
      || '';
    
    console.log('🚗 Registration Debug:');
    console.log('  - vehicleData?.registration:', vehicleData?.registration);
    console.log('  - cleanedReportRaw?.Results?.VehicleDetails?.VehicleIdentification?.Vrm:', cleanedReportRaw?.Results?.VehicleDetails?.VehicleIdentification?.Vrm);
    console.log('  - cleanedReportRaw?.Vrm:', cleanedReportRaw?.Vrm);
    console.log('  - Final registration:', registration);
    
    // Debug: Check if we have data for charts
    const motData = cleanedReportRaw?.Results?.MotHistoryDetails;
    const fuelData = cleanedReportRaw?.Results?.ModelDetails?.Performance?.FuelEconomy;
    console.log('📊 PDF Generation Debug:');
    console.log('  - MOT Data exists:', !!motData);
    console.log('  - MOT Tests count:', motData?.MotTestDetailsList?.length || 0);
    console.log('  - Fuel Economy exists:', !!fuelData);
    console.log('  - Combined MPG:', fuelData?.CombinedMpg || 'N/A');
    console.log('  - Vehicle Data exists:', !!vehicleData);
    
    // Render React component to HTML
    // Use cleanedReportRaw to ensure hidden fields are not rendered
    let reportHTML: string;
    try {
      reportHTML = ReactDOMServer.renderToString(
        React.createElement(VehicleReport, {
          schema,
          payload: cleanedReportRaw, // Use cleaned data instead of raw
          mode: isPremium ? 'full' : 'free',
          hideStrategy: 'hide', // For PDF, hide instead of blur
          packageDocs: isPremium ? fullPackageDocs : freePackageDocs,
          brand: {
            name: 'HG Verified Vehicle Check',
            logoUrl: logoUrl,
            primary: '#0b5fff',
            accent: '#0ea5e9'
          },
          dateOfCheck: checkDate,
          reference: reportReference,
          registration: registration,
          vehicleData: vehicleData // Pass vehicleData for fuel efficiency chart
        })
      );
    } catch (error: any) {
      console.error('❌ Error rendering VehicleReport:', error.message);
      console.error('Stack:', error.stack);
      throw new Error(`Failed to render report: ${error.message}`);
    }
    
    // Debug: Check if charts are in the HTML
    const hasMileageGraph = reportHTML.includes('mileage-graph') || reportHTML.includes('Mileage History Graph');
    const hasFuelChart = reportHTML.includes('fuel-efficiency-chart') || reportHTML.includes('Fuel Efficiency');
    const hasHeaderBar = reportHTML.includes('report__header-bar');
    console.log('📄 Generated HTML Debug:');
    console.log('  - Contains mileage-graph:', hasMileageGraph);
    console.log('  - Contains fuel-efficiency-chart:', hasFuelChart);
    console.log('  - Contains header-bar:', hasHeaderBar);
    const hasRegistration = reportHTML.includes('report__registration') || reportHTML.includes(registration) || reportHTML.includes('Registration:');
    console.log('  - Contains registration:', hasRegistration);
    console.log('  - Registration value in HTML:', registration ? `YES (${registration})` : 'NO');
    const regIndex = reportHTML.indexOf('report__registration');
    if (regIndex > -1) {
      const snippet = reportHTML.substring(Math.max(0, regIndex - 50), Math.min(reportHTML.length, regIndex + 250));
      console.log('  - Registration HTML snippet:', snippet.substring(0, 300));
    }
    console.log('  - HTML length:', reportHTML.length, 'bytes');
    
    // Insert manual headers for pages 2+ by adding header divs with page breaks
    // We'll insert a header div after the first major section (after header bar and first content)
    // Find the end of the header bar section
    const headerBarEndIndex = reportHTML.indexOf('</div>', reportHTML.indexOf('report__header-bar'));
    let modifiedReportHTML = reportHTML;
    
    // Create header HTML for pages 2+ (will be inserted after first section)
    const pageHeaderHTML = `
    <div class="pdf-page-header" style="page-break-before: always; display: none;">
      <div class="pdf-page-header-content">
        <div class="pdf-page-header-title">
          <div class="pdf-page-header-title-main">Vehicle Check Report</div>
          <div class="pdf-page-header-title-sub">HG Verified Vehicle Check</div>
        </div>
        <div class="pdf-page-header-number">Page 2</div>
      </div>
    </div>`;
    
    // Insert header after the first section (after header bar closes)
    // We'll insert it after the first major closing div after the header bar
    if (headerBarEndIndex > -1) {
      // Find the end of the first content section after header bar
      const firstSectionEnd = reportHTML.indexOf('</div>', headerBarEndIndex + 5);
      if (firstSectionEnd > -1) {
        // Insert page break and header after first section
        modifiedReportHTML = reportHTML.substring(0, firstSectionEnd + 6) + pageHeaderHTML + reportHTML.substring(firstSectionEnd + 6);
      }
    }
    
    // Create full HTML document with enhanced PDF styling
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vehicle Report - ${vehicleData?.registration || 'Unknown'}</title>
  <style>
    ${reportCSS}
    
    /* PDF-specific enhancements */
    @page {
      size: A4;
      margin: 0mm 12mm 10mm 12mm; /* No top margin - headerTemplate is hidden */
    }
    
    @page:first {
      margin-top: 0mm !important; /* First page: NO headerTemplate margin */
    }
    
    /* Pages 2+: Add top margin for headerTemplate */
    @page:not(:first) {
      margin-top: 50mm !important; /* Space for headerTemplate on pages 2+ */
    }
    
    /* CRITICAL: Hide headerTemplate on first page by making it invisible */
    /* Since Puppeteer renders headerTemplate on all pages, we make it height 0 on page 1 */
    @page:first {
      margin-top: 0mm !important;
    }
    
    /* Ensure headerTemplate doesn't appear on first page */
    /* We'll use JavaScript to hide it, but CSS margin 0mm should prevent it from taking space */
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      margin: 0;
      padding: 0;
    }
    
    .report {
      margin: 0;
      padding: 0;
      max-width: 100%;
    }
    
    /* CRITICAL FIX: First page - NO headerTemplate space needed */
    @page:first .report {
      padding-top: 0 !important;
      margin-top: 0 !important;
    }
    
    /* First page: content starts at very top */
    @page:first body > #root {
      padding-top: 0 !important;
      margin-top: 0 !important;
    }
    
    /* CRITICAL: First page header bar starts at top - NO headerTemplate */
    @page:first .report__header-bar {
      margin-top: 0 !important;
      padding-top: 0 !important;
      position: relative !important;
      background: #0b5fff !important;
    }
    
    /* Ensure body/root doesn't add extra spacing on first page */
    @page:first body > #root {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
    
    /* Spacer is not needed - Puppeteer margin handles spacing */
    .pdf-header-spacer {
      display: none !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Professional Colored Header Bar - FIXED HEIGHT for PDF */
    /* Compact height to prevent gap */
    .report__header-bar {
      background: #0b5fff !important;
      padding: 8px 16px !important;
      margin: 0 0 30px 0 !important; /* Increased bottom margin to prevent overlap with section headers */
      border-radius: 0 !important;
      color: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      page-break-after: avoid !important;
      break-after: avoid !important;
      height: 140px !important;
      max-height: 140px !important;
      min-height: 140px !important;
      overflow: hidden !important;
      display: block !important;
      position: relative !important;
      box-sizing: border-box !important;
    }
    
    .report__header-bar > div:first-child {
      margin-bottom: 2px !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      height: auto !important;
      max-height: 40px !important;
      overflow: hidden !important;
    }
    
    .report__header-bar h1 {
      color: white !important;
      font-size: 20px !important;
      font-weight: 800 !important;
      line-height: 1.0 !important;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .report__header-bar h1 span {
      font-size: 20px !important;
      font-weight: 800 !important;
      color: white !important;
      line-height: 1.0 !important;
    }
    
    .report__header-bar p {
      margin: 0 !important;
      font-size: 10px !important;
      line-height: 1.1 !important;
    }
    
    .report__header-bar .report__meta {
      color: white !important;
      border-top-color: rgba(255, 255, 255, 0.3) !important;
      padding-top: 4px !important;
      margin-top: 4px !important;
      font-size: 10px !important;
      font-weight: 600 !important;
      line-height: 1.1 !important;
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 10px !important;
      height: auto !important;
      max-height: 24px !important;
      overflow: hidden !important;
    }
    
    /* Registration Number - PDF styling */
    .report__header-bar .report__registration {
      margin-bottom: 4px !important;
      padding-bottom: 4px !important;
      border-bottom: 2px solid rgba(255, 255, 255, 0.3) !important;
      max-height: 28px !important;
      overflow: hidden !important;
    }
    
    .report__header-bar .report__registration > div {
      max-height: 28px !important;
      overflow: hidden !important;
    }
    
    .report__header-bar .report__registration span:first-child {
      font-size: 11px !important;
      font-weight: 600 !important;
    }
    
    .report__header-bar .report__registration-number {
      font-size: 18px !important;
      font-weight: 900 !important;
      color: white !important;
      letter-spacing: 0.08em !important;
      text-transform: uppercase !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      line-height: 1.1 !important;
    }
    
    .report__header-bar .report__meta span {
      font-weight: 600 !important;
      font-size: 12px !important;
    }
    
    .report__header-bar .brand {
      width: 40px !important;
      height: 40px !important;
      padding: 2px !important;
      flex-shrink: 0 !important;
      max-width: 40px !important;
      max-height: 40px !important;
    }
    
    .report__header {
      display: none !important;
    }
    
    body {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
    
    /* Ensure report container has no extra spacing */
    .report {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
    
    /* Force content to start with proper spacing after header */
    .report > *:not(.report__header-bar) {
      margin-top: 0 !important;
    }
    
    /* Ensure section headers have proper spacing and aren't covered */
    .section {
      margin-top: 24px !important;
      padding-top: 0 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* First section after header bar needs extra spacing to prevent overlap */
    .report__header-bar + .section,
    .report__header-bar + * {
      margin-top: 40px !important;
      padding-top: 0 !important;
    }
    
    /* On first page, ensure proper spacing after header bar */
    @page:first .report__header-bar + * {
      margin-top: 40px !important;
    }
    
    /* Risk summary and other elements after header also need spacing */
    .report__header-bar ~ .risk-summary {
      margin-top: 40px !important;
    }
    
    /* Ensure first content element after header has proper spacing */
    .report > *:first-of-type:not(.report__header-bar):not(.pdf-header-spacer) {
      margin-top: 50px !important;
    }
    
    .section__header {
      margin-top: 0 !important;
      padding-top: 0 !important;
      margin-bottom: 20px !important;
      position: relative !important;
      z-index: 1 !important;
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    
    /* Prevent header from expanding */
    .report__header-bar * {
      box-sizing: border-box !important;
    }
    
    /* Force header bar to exact height - override any inline styles */
    .report__header-bar[style] {
      height: 140px !important;
      max-height: 140px !important;
      min-height: 140px !important;
      overflow: hidden !important;
    }
    
    /* Additional aggressive fixes for PDF gap */
    .report__header-bar > * {
      max-height: 100% !important;
      overflow: hidden !important;
    }
    
    /* Ensure no content expands beyond header */
    .report__header-bar div[style*="flex"] {
      max-height: 50px !important;
      overflow: hidden !important;
    }
    
    .report__header-bar .report__meta[style] {
      max-height: 24px !important;
      overflow: hidden !important;
    }
    
    /* Force all children to respect parent height */
    .report__header-bar > div {
      max-height: calc(100% - 8px) !important;
    }
    
    .report__header-bar > div > div {
      max-height: 100% !important;
    }
    
    .section__header {
      padding: 0 0 16px 0 !important;
      border-bottom: 4px solid #0b5fff !important;
      margin-bottom: 20px !important;
      margin-top: 0 !important;
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    
    .section__header h2 {
      font-size: 32px !important;
      font-weight: 900 !important;
      color: #000000 !important;
      text-decoration: underline !important;
      text-decoration-thickness: 3px !important;
      text-underline-offset: 8px !important;
      text-decoration-color: #0b5fff !important;
      margin: 0 !important;
    }
    
    /* CRITICAL: Force 2-column layout for PDF - must match website exactly */
    .obj-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 12px !important;
      row-gap: 6px !important;
      width: 100% !important;
      padding: 0 !important;
      border: none !important;
      background: transparent !important;
    }
    
    .kv {
      display: flex !important;
      flex-direction: column !important;
      gap: 2px !important;
      align-items: flex-start !important;
      padding: 4px 0 !important;
      border-bottom: none !important;
      margin: 0 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    .kv__k {
      width: 100% !important;
      color: #1a1a1a !important;
      font-weight: 700 !important;
      font-size: 15px !important;
      margin-bottom: 2px !important;
    }
    
    .kv__v {
      width: 100% !important;
      word-break: break-word !important;
      font-size: 15px !important;
      color: #000000 !important;
      font-weight: 600 !important;
    }
    
    .obj-nested {
      grid-column: 1 / -1 !important;
      border: none !important;
      padding: 4px 0 !important;
      margin: 4px 0 !important;
      background: transparent !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    .obj-nested__title {
      font-weight: 800 !important;
      font-size: 18px !important;
      color: #000000 !important;
      margin-bottom: 12px !important;
    }
    
    .obj-list__title {
      font-weight: 800 !important;
      font-size: 18px !important;
      color: #000000 !important;
      margin: 0 0 12px 0 !important;
    }
    
    .timeline__date {
      color: #1a1a1a !important;
      font-size: 14px !important;
      font-weight: 700 !important;
    }
    
    .timeline__title {
      font-weight: 800 !important;
      font-size: 16px !important;
      color: #000000 !important;
    }
    
    .timeline__meta {
      color: #1a1a1a !important;
      font-size: 14px !important;
      font-weight: 600 !important;
    }
    
    .timeline__list {
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #000000 !important;
      break-inside: avoid !important;
    }
    
    /* MOT Pass Rate Box - Ensure visibility in PDF */
    [style*="MOT Pass Rate"] {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* MOT test cards styling for PDF */
    .mot-test-card {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    .obj-list {
      grid-column: 1 / -1 !important;
      margin: 16px 0 !important;
    }
    
    .obj-list__item {
      border: none !important;
      padding: 4px 0 !important;
      margin-bottom: 4px !important;
      background: transparent !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    .section {
      margin-bottom: 12px !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      width: 100% !important;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
      padding: 4px 0 !important;
    }
    
    /* Additional section header styling for PDF - ensure no overlap */
    .section__header {
      page-break-after: avoid !important;
      break-after: avoid !important;
      padding: 0 0 12px 0 !important;
      border-bottom: 3px solid #0b5fff !important;
      margin-bottom: 16px !important;
      margin-top: 0 !important;
      background: transparent !important;
      position: relative !important;
      z-index: 1 !important;
    }
    
    .section__header h2 {
      color: #0b5fff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .section__header::before {
      background: #0b5fff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .section__body {
      padding: 0 !important;
      margin-top: 0 !important;
    }
    
    .risk-summary {
      grid-column: 1 / -1 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    .timeline__row {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    .vd-blur {
      display: none !important;
    }
    
    .brand {
      max-width: 64px !important;
      max-height: 64px !important;
      width: 64px !important;
      height: 64px !important;
      object-fit: contain !important;
    }
    
    /* Ensure colored boxes are visible in PDF - must match website exactly */
    .kv--pass {
      background: transparent !important;
      border-left: none !important;
      padding-left: 0 !important;
      margin: 4px 0 !important;
      border-radius: 0 !important;
    }
    
    .kv--pass .kv__v,
    div.kv--pass div.kv__v {
      font-weight: 700 !important;
      background: #10b981 !important;
      color: white !important;
      padding: 4px 12px !important;
      border-radius: 4px !important;
      display: inline-block !important;
      margin-top: 2px !important;
      border: none !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    .kv--fail {
      background: transparent !important;
      border-left: none !important;
      padding-left: 0 !important;
      margin: 4px 0 !important;
      border-radius: 0 !important;
    }
    
    .kv--fail .kv__v,
    div.kv--fail div.kv__v {
      font-weight: 700 !important;
      background: #ef4444 !important;
      color: white !important;
      padding: 4px 12px !important;
      border-radius: 4px !important;
      display: inline-block !important;
      margin-top: 2px !important;
      border: none !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    .kv--warn {
      background: transparent !important;
      border-left: none !important;
      padding-left: 0 !important;
      margin: 4px 0 !important;
      border-radius: 0 !important;
    }
    
    .kv--warn .kv__v,
    div.kv--warn div.kv__v {
      font-weight: 700 !important;
      background: #f59e0b !important;
      color: white !important;
      padding: 4px 12px !important;
      border-radius: 4px !important;
      display: inline-block !important;
      margin-top: 2px !important;
      border: none !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Mileage Graph - PDF styling */
    #mileage-graph {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-bottom: 24px !important;
    }
    
    #mileage-graph .section__header {
      border-bottom: 3px solid #0b5fff !important;
    }
    
    #mileage-graph .section__header h2 {
      color: #0b5fff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    #mileage-graph svg {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Fuel Efficiency Chart - PDF styling */
    #fuel-efficiency-chart {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-bottom: 24px !important;
    }
    
    #fuel-efficiency-chart .section__header {
      border-bottom: 3px solid #0b5fff !important;
    }
    
    #fuel-efficiency-chart .section__header h2 {
      color: #0b5fff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Ensure chart bars are visible in PDF */
    #fuel-efficiency-chart [style*="background"] {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    /* Manual headers for pages 2+ - inserted via HTML content */
    .pdf-page-header {
      display: none !important; /* Hidden on website */
    }
    
    @media print {
      .pdf-page-header {
        display: block !important;
        background: linear-gradient(135deg, #0b5fff 0%, #0b5fffdd 100%) !important;
        color: white !important;
        padding: 8px 20px !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        height: 42px !important;
        max-height: 42px !important;
        margin: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      
      .pdf-page-header-content {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        height: 100% !important;
      }
      
      .pdf-page-header-title {
        display: flex !important;
        flex-direction: column !important;
        gap: 1px !important;
        line-height: 1.1 !important;
      }
      
      .pdf-page-header-title-main {
        font-size: 13px !important;
        font-weight: 800 !important;
        color: white !important;
      }
      
      .pdf-page-header-title-sub {
        font-size: 11px !important;
        font-weight: 700 !important;
        opacity: 0.95 !important;
        color: white !important;
      }
      
      .pdf-page-header-number {
        font-size: 9px !important;
        opacity: 0.9 !important;
        color: white !important;
      }
    }
  </style>
</head>
<body>
  <div id="root">
    ${modifiedReportHTML}
  </div>
</body>
</html>
`;
    
    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set content
    await page.setContent(fullHTML, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF with headerTemplate for pages 2+
    // Note: headerTemplate shows on all pages, but we'll make it invisible on page 1 using CSS
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false, /* DISABLED - headerTemplate removed completely to prevent overlap on page 1 */
      footerTemplate: '<div></div>', // Empty footer
      margin: {
        top: '0mm', /* NO margin - headerTemplate disabled, headers added manually to pages 2+ */
        right: '12mm',
        bottom: '10mm',
        left: '12mm'
      }
    });
    
    await browser.close();
    
    return Buffer.from(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating unified PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}
}