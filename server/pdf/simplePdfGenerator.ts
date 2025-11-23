import type { UnifiedReportData } from './unifiedReportData';

type JsPDFConstructor = typeof import('jspdf').jsPDF;
type AutoTableFn = (...args: any[]) => any;

let cachedJsPDF: JsPDFConstructor | null = null;
let cachedAutoTable: AutoTableFn | null = null;

const resolveExport = <T = any>(label: string, candidates: Array<T | undefined>): T | null => {
  for (const candidate of candidates) {
    if (typeof candidate === 'function' || typeof candidate === 'object' && candidate) {
      return candidate as T;
    }
  }
  return null;
};

async function loadJsPDFConstructor(): Promise<JsPDFConstructor> {
  if (cachedJsPDF) return cachedJsPDF;

  const mod: any = await import('jspdf');
  const ctor = resolveExport<JsPDFConstructor>('jsPDF', [
    mod?.jsPDF,
    mod?.default?.jsPDF,
    mod?.default,
    mod
  ]);

  if (typeof ctor !== 'function') {
    console.error(
      'Failed to resolve jsPDF constructor. Module keys:',
      Object.keys(mod || {}),
      'default keys:',
      Object.keys(mod?.default || {})
    );
    throw new Error('Failed to load jsPDF constructor');
  }

  cachedJsPDF = ctor;
  return ctor;
}

async function loadAutoTable(): Promise<AutoTableFn> {
  if (cachedAutoTable) return cachedAutoTable;

  const mod: any = await import('jspdf-autotable');
  const fn = resolveExport<AutoTableFn>('autoTable', [mod?.default, mod]);

  if (typeof fn !== 'function') {
    console.error(
      'Failed to resolve jspdf-autotable export. Module keys:',
      Object.keys(mod || {}),
      'default keys:',
      Object.keys(mod?.default || {})
    );
    throw new Error('Failed to load jspdf-autotable plugin');
  }

  cachedAutoTable = fn;
  return fn;
}

// Helper to format values for display
function formatValue(value: any): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object' && !Array.isArray(value)) {
    // For nested objects, return a summary or skip
    return '—';
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None';
    return value.length.toString() + ' item(s)';
  }
  return String(value);
}

// Helper to extract all key-value pairs from an object recursively
function extractKeyValuePairs(obj: any, prefix = '', maxDepth = 3, currentDepth = 0): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return pairs;
  }
  
  // Prevent infinite recursion
  if (currentDepth >= maxDepth) {
    return pairs;
  }
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip internal/system fields
    if (key === 'RequestInformation' || key === 'ResponseInformation') {
      continue;
    }
    
    // Format label - use human-readable format
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
    const label = prefix ? `${prefix} - ${formattedKey}` : formattedKey;
    
    if (value === null || value === undefined) {
      continue; // Skip null/undefined
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        continue;
      }
      // For arrays of primitives, show values
      if (value.length > 0 && (typeof value[0] === 'string' || typeof value[0] === 'number' || typeof value[0] === 'boolean')) {
        pairs.push([label, value.join(', ')]);
      } else {
        // For arrays of objects, show count
        pairs.push([label, `${value.length} item(s)`]);
      }
    } else if (typeof value === 'object') {
      // For nested objects, recursively extract fields
      const nested = extractKeyValuePairs(value, label, maxDepth, currentDepth + 1);
      if (nested.length > 0) {
        pairs.push(...nested);
      } else {
        // If nested object has no extractable fields, show as object
        pairs.push([label, '—']);
      }
    } else {
      pairs.push([label, formatValue(value)]);
    }
  }
  
  return pairs;
}

// Helper to add a section header
function addSectionHeader(
  doc: any,
  title: string,
  yPos: number,
  primaryColor: [number, number, number]
): number {
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(title, 20, yPos);
  yPos += 2;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 8;
  
  return yPos;
}

// Helper to render a data section
function renderDataSection(
  doc: any,
  autoTable: AutoTableFn,
  data: any,
  yPos: number,
  primaryColor: [number, number, number],
  textColor: [number, number, number]
): number {
  if (!data || typeof data !== 'object') {
    return yPos;
  }
  
  const pairs = extractKeyValuePairs(data);
  if (pairs.length === 0) {
    return yPos;
  }
  
  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: pairs,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 110 }
    },
    margin: { left: 20, right: 20 }
  });
  
  return (doc as any).lastAutoTable.finalY + 10;
}

// Helper to render MOT History with full details
function renderMOTHistory(
  doc: any,
  autoTable: AutoTableFn,
  motTests: any[],
  yPos: number,
  primaryColor: [number, number, number],
  textColor: [number, number, number],
  grayColor: [number, number, number]
): number {
  if (!motTests || motTests.length === 0) {
    return yPos;
  }
  
  yPos = addSectionHeader(doc, 'MOT History', yPos, primaryColor);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  doc.text(`${motTests.length} MOT test(s) found`, 20, yPos);
  yPos += 8;
  
  // Render ALL MOT tests (not just 5)
  for (let i = 0; i < motTests.length; i++) {
    const test = motTests[i];
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Test header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos - 4, 170, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text(`Test ${i + 1} - Date: ${test.TestDate || 'N/A'}`, 25, yPos);
    
    // Result badge
    const isPass = test.TestResult === 'Pass' || test.TestResult === 'PASS';
    doc.setFillColor(isPass ? 16 : 239, isPass ? 185 : 68, isPass ? 129 : 68);
    doc.roundedRect(150, yPos - 4, 35, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(test.TestResult || 'N/A', 167, yPos - 1, { align: 'center' });
    
    yPos += 8;
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // Test details
    const testInfo: Array<[string, string]> = [];
    if (test.OdometerReading !== undefined) {
      testInfo.push(['Mileage', `${test.OdometerReading.toLocaleString()} miles`]);
    }
    if (test.ExpiryDate) {
      testInfo.push(['Expiry Date', test.ExpiryDate]);
    }
    if (test.TestNumber) {
      testInfo.push(['Test Number', test.TestNumber]);
    }
    if (test.TestLocation) {
      testInfo.push(['Test Location', test.TestLocation]);
    }
    if (test.TestClass) {
      testInfo.push(['Test Class', test.TestClass]);
    }
    
    if (testInfo.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [],
        body: testInfo,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 1.5 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 120 }
        },
        margin: { left: 25, right: 25 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 2;
    }
    
    // Advisories
    if (test.AdvisoryNoticeList && test.AdvisoryNoticeList.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(217, 119, 6);
      doc.setFont('helvetica', 'bold');
      doc.text(`Advisories (${test.AdvisoryNoticeList.length}):`, 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      
      test.AdvisoryNoticeList.forEach((adv: any) => {
        const text = adv.AdvisoryNotice || adv.toString();
        const lines = doc.splitTextToSize(text, 160);
        doc.setTextColor(...grayColor);
        doc.text(lines, 30, yPos);
        yPos += lines.length * 4;
      });
    }
    
    // Failures
    if (test.FailureReasonList && test.FailureReasonList.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.text(`Failures (${test.FailureReasonList.length}):`, 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      
      test.FailureReasonList.forEach((fail: any) => {
        const text = fail.FailureReason || fail.toString();
        const lines = doc.splitTextToSize(text, 160);
        doc.setTextColor(220, 38, 38);
        doc.text(lines, 30, yPos);
        yPos += lines.length * 4;
      });
    }
    
    yPos += 6;
  }
  
  return yPos;
}

/**
 * Comprehensive PDF generator that works on Vercel serverless
 * Uses jsPDF and includes ALL sections matching the website report
 */
export async function generateSimplePDF(unified: UnifiedReportData): Promise<Buffer> {
  console.log('📄 Generating comprehensive PDF with jsPDF (serverless-compatible)');

  // Dynamic imports to avoid ESM issues in serverless
  const jsPDF = await loadJsPDFConstructor();
  const autoTable = await loadAutoTable();

  const { context, vehicleData = {}, reportRaw = {} } = unified;
  const { registration, dateOfCheck, reference, isPremium } = context;
  const resolvedReference = reference || registration;
  const resolvedDate = new Date(dateOfCheck);
  const checkDate = Number.isNaN(resolvedDate.getTime()) ? new Date() : resolvedDate;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Colors
  const primaryColor: [number, number, number] = [11, 95, 255];
  const textColor: [number, number, number] = [0, 0, 0];
  const grayColor: [number, number, number] = [128, 128, 128];
  
  let yPos = 20;
  
  // Header with blue background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle Check Report', 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('HG Verified Vehicle Check', 105, 25, { align: 'center' });
  
  // Registration in yellow box
  doc.setFillColor(255, 215, 0);
  doc.roundedRect(70, 30, 70, 12, 2, 2, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(registration.toUpperCase(), 105, 37, { align: 'center' });
  
  yPos = 50;
  
  // Report metadata
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date of Check: ${checkDate.toLocaleDateString('en-GB')}`, 20, yPos);
  yPos += 5;
  doc.text(`Reference: ${resolvedReference}`, 20, yPos);
  yPos += 5;
  doc.text(`Report Type: ${isPremium ? 'Comprehensive' : 'Basic'}`, 20, yPos);
  yPos += 10;

  const results = reportRaw?.Results || {};
  
  // Define section order matching the website
  const sectionOrder = [
    { key: 'VehicleDetails', title: 'Vehicle Details' },
    { key: 'ModelDetails', title: 'Model Details' },
    { key: 'VehicleTaxDetails', title: 'Vehicle Tax Details' },
    { key: 'PncDetails', title: 'PNC Details' },
    { key: 'MiaftrDetails', title: 'MIAFTR Details' },
    { key: 'FinanceDetails', title: 'Finance Details' },
    { key: 'ValuationDetails', title: 'Valuation Details' },
    { key: 'SpecAndOptionsDetails', title: 'Spec & Options Details' },
    { key: 'BatteryDetails', title: 'Battery Details' },
    { key: 'TyreDetails', title: 'Tyre Details' },
    { key: 'VehicleImageDetails', title: 'Vehicle Images' },
    { key: 'MileageCheckDetails', title: 'Mileage Check Details' },
    { key: 'MotHistoryDetails', title: 'MOT History' },
  ];
  
  // Free check sections (always shown)
  const freeSections = ['VehicleDetails', 'ModelDetails', 'VehicleTaxDetails', 'MotHistoryDetails'];
  
  // Render sections in order
  for (const section of sectionOrder) {
    const sectionData = results[section.key];
    
    // Skip if no data
    if (!sectionData) continue;
    
    // Skip premium-only sections if not premium
    if (!isPremium && !freeSections.includes(section.key)) {
      continue;
    }
    
    // Special handling for VehicleDetails (has nested sections)
    if (section.key === 'VehicleDetails') {
      yPos = addSectionHeader(doc, section.title, yPos, primaryColor);
      
      // Extract VehicleDetails data
      const vehicleDetails = sectionData;
      const vehicleId = vehicleDetails.VehicleIdentification || {};
      const vehicleStatus = vehicleDetails.VehicleStatus || {};
      const vehicleHistory = vehicleDetails.VehicleHistory || {};
      const dvlaTechnical = vehicleDetails.DvlaTechnicalDetails || {};
      
      // Vehicle Identification
      if (Object.keys(vehicleId).length > 0) {
        yPos = renderDataSection(doc, autoTable, vehicleId, yPos, primaryColor, textColor);
      }
      
      // Vehicle Status
      if (Object.keys(vehicleStatus).length > 0) {
        yPos = addSectionHeader(doc, 'Vehicle Status', yPos, primaryColor);
        yPos = renderDataSection(doc, autoTable, vehicleStatus, yPos, primaryColor, textColor);
      }
      
      // Vehicle History
      if (Object.keys(vehicleHistory).length > 0) {
        yPos = addSectionHeader(doc, 'Vehicle History', yPos, primaryColor);
        yPos = renderDataSection(doc, autoTable, vehicleHistory, yPos, primaryColor, textColor);
      }
      
      // DVLA Technical Details
      if (Object.keys(dvlaTechnical).length > 0) {
        yPos = addSectionHeader(doc, 'DVLA Technical Details', yPos, primaryColor);
        yPos = renderDataSection(doc, autoTable, dvlaTechnical, yPos, primaryColor, textColor);
      }
    } else if (section.key === 'MotHistoryDetails') {
      // MOT History gets special rendering with full test details
      const motHistory = sectionData;
      const motTests = motHistory?.MotTestDetailsList || [];
      if (motTests.length > 0) {
        yPos = renderMOTHistory(doc, autoTable, motTests, yPos, primaryColor, textColor, grayColor);
      }
    } else {
      // Standard section rendering
      yPos = addSectionHeader(doc, section.title, yPos, primaryColor);
      yPos = renderDataSection(doc, autoTable, sectionData, yPos, primaryColor, textColor);
    }
  }
  
  // Footer on last page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  yPos = 270;
  doc.setFillColor(245, 245, 245);
  doc.rect(0, yPos, 210, 27, 'F');
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('This report was generated by HG Verified Vehicle Check', 105, yPos + 8, { align: 'center' });
  doc.text(`Report Reference: ${resolvedReference}`, 105, yPos + 13, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 105, yPos + 18, { align: 'center' });
  
  // Convert to buffer
  const pdfBuffer = doc.output('arraybuffer') as ArrayBuffer;
  console.log('✅ Comprehensive PDF generated successfully with jsPDF, size:', pdfBuffer.length, 'bytes');
  
  return Buffer.from(pdfBuffer);
}
