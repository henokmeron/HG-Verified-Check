import type { UnifiedReportData } from './unifiedReportData';

type JsPDFConstructor = typeof import('jspdf').jsPDF;

let cachedJsPDF: JsPDFConstructor | null = null;

const PAGE_TOP = 20;
const PAGE_BOTTOM = 275;

const resolveExport = <T = any>(candidates: Array<T | undefined>): T | null => {
  for (const candidate of candidates) {
    if (candidate && (typeof candidate === 'function' || typeof candidate === 'object')) {
      return candidate as T;
    }
  }
  return null;
};

async function loadJsPDFConstructor(): Promise<JsPDFConstructor> {
  if (cachedJsPDF) return cachedJsPDF;

  const mod: any = await import('jspdf');
  const ctor = resolveExport<JsPDFConstructor>([
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

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T?/;

const formatLabel = (raw: string): string => {
  if (!raw) return '';
  return raw
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (ch) => ch.toUpperCase());
};

const formatDateString = (value: string): string => {
  if (!value) return 'N/A';
  try {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString('en-GB');
  } catch {
    return value;
  }
};

const formatArrayValue = (arr: any[]): string => {
  if (!arr || arr.length === 0) return 'None';
  const flattened = arr.filter((item) => item !== null && item !== undefined);
  if (flattened.length === 0) return 'None';
  if (flattened.every((item) => ['string', 'number', 'boolean'].includes(typeof item))) {
    return flattened.map((item) => formatValue(item)).join(', ');
  }
  return `${flattened.length} item(s)`;
};

function formatValue(value: any): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 'N/A';
    if (ISO_DATE_REGEX.test(trimmed)) {
      return formatDateString(trimmed);
    }
    return trimmed;
  }
  if (Array.isArray(value)) {
    return formatArrayValue(value);
  }
  if (value instanceof Date) {
    return value.toLocaleDateString('en-GB');
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return 'N/A';
    return `${keys.length} field(s)`;
  }
  return String(value);
}

const ensurePageSpace = (doc: any, yPos: number, required = 0): number => {
  if (yPos + required > PAGE_BOTTOM) {
    doc.addPage();
    return PAGE_TOP;
  }
  return yPos;
};

const addSectionTitle = (
  doc: any,
  title: string,
  yPos: number,
  primaryColor: [number, number, number]
): number => {
  yPos = ensurePageSpace(doc, yPos, 20);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(title, 20, yPos);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.6);
  doc.line(20, yPos + 2, 190, yPos + 2);
  return yPos + 10;
};

const addSubSectionTitle = (
  doc: any,
  title: string,
  yPos: number,
  primaryColor: [number, number, number]
): number => {
  yPos = ensurePageSpace(doc, yPos, 14);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(title, 25, yPos);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.3);
  doc.line(25, yPos + 1, 185, yPos + 1);
  return yPos + 6;
};

type GridEntry = { label: string; value: string };

interface GridOptions {
  startX?: number;
  columnWidth?: number;
  columnGap?: number;
}

const renderKeyValueGrid = (
  doc: any,
  entries: GridEntry[],
  yPos: number,
  options: GridOptions = {}
): number => {
  if (!entries.length) return yPos;

  const startX = options.startX ?? 25;
  const columnWidth = options.columnWidth ?? 75;
  const columnGap = options.columnGap ?? 15;
  const columns = 2;

  let index = 0;
  while (index < entries.length) {
    const row = entries.slice(index, index + columns);
    const rowMetrics = row.map((entry) => {
      const labelLines = doc.splitTextToSize(entry.label, columnWidth);
      const valueLines = doc.splitTextToSize(entry.value, columnWidth);
      const labelHeight = labelLines.length * 4.5;
      const valueHeight = valueLines.length * 5;
      return {
        labelLines,
        valueLines,
        blockHeight: labelHeight + valueHeight + 6
      };
    });

    const rowHeight = rowMetrics.reduce((max, current) => Math.max(max, current.blockHeight), 12);
    yPos = ensurePageSpace(doc, yPos, rowHeight + 4);

    row.forEach((entry, idx) => {
      const metric = rowMetrics[idx];
      const x = startX + idx * (columnWidth + columnGap);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(metric.labelLines, x, yPos, { maxWidth: columnWidth });

      const valueY = yPos + metric.labelLines.length * 4.5 + 2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(metric.valueLines, x, valueY, { maxWidth: columnWidth });
    });

    yPos += rowHeight + 4;
    index += columns;
  }

  return yPos;
};

const renderObjectContent = (
  doc: any,
  data: any,
  yPos: number,
  primaryColor: [number, number, number],
  depth = 0
): number => {
  if (!data || typeof data !== 'object') return yPos;

  const directEntries: GridEntry[] = [];
  const nestedEntries: Array<{ title: string; value: any }> = [];

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      directEntries.push({ label: formatLabel(key), value: formatArrayValue(value) });
      continue;
    }

    if (typeof value === 'object') {
      if (Object.keys(value).length === 0) continue;
      nestedEntries.push({ title: formatLabel(key), value });
      continue;
    }

    directEntries.push({ label: formatLabel(key), value: formatValue(value) });
  }

  if (directEntries.length) {
    const startX = depth > 0 ? 30 : 25;
    yPos = renderKeyValueGrid(doc, directEntries, yPos, { startX });
  }

  for (const nested of nestedEntries) {
    yPos = addSubSectionTitle(doc, nested.title, yPos, primaryColor);
    yPos = renderObjectContent(doc, nested.value, yPos, primaryColor, depth + 1);
  }

  return yPos;
};

const renderVehicleDetails = (
  doc: any,
  data: any,
  yPos: number,
  primaryColor: [number, number, number]
): number => {
  if (!data || typeof data !== 'object') return yPos;
  yPos = addSectionTitle(doc, 'Vehicle Details', yPos, primaryColor);

  const sections = [
    { key: 'VehicleIdentification', label: 'Vehicle Identification' },
    { key: 'VehicleStatus', label: 'Vehicle Status' },
    { key: 'VehicleHistory', label: 'Vehicle History' },
    { key: 'DvlaTechnicalDetails', label: 'DVLA Technical Details' }
  ];

  const consumed = new Set<string>();

  sections.forEach((section) => {
    const content = data?.[section.key];
    if (content && typeof content === 'object' && Object.keys(content).length > 0) {
      consumed.add(section.key);
      yPos = addSubSectionTitle(doc, section.label, yPos, primaryColor);
      yPos = renderObjectContent(doc, content, yPos, primaryColor, 1);
    }
  });

  const remaining = Object.entries(data)
    .filter(([key]) => !consumed.has(key));

  if (remaining.length) {
    yPos = addSubSectionTitle(doc, 'Additional Details', yPos, primaryColor);
    const directEntries = remaining
      .filter(([, value]) => typeof value !== 'object' || Array.isArray(value))
      .map(([key, value]) => ({ label: formatLabel(key), value: formatValue(value) }));
    if (directEntries.length) {
      yPos = renderKeyValueGrid(doc, directEntries, yPos, { startX: 25 });
    }

    remaining.forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        yPos = addSubSectionTitle(doc, formatLabel(key), yPos, primaryColor);
        yPos = renderObjectContent(doc, value, yPos, primaryColor, 1);
      }
    });
  }

  return yPos;
};

const renderModelDetails = (
  doc: any,
  data: any,
  yPos: number,
  primaryColor: [number, number, number]
): number => {
  if (!data || typeof data !== 'object') return yPos;
  yPos = addSectionTitle(doc, 'Model Details', yPos, primaryColor);

  const directEntries: GridEntry[] = [];
  const nestedOrder = [
    { key: 'ModelIdentification', label: 'Model Identification' },
    { key: 'Classification', label: 'Classification' },
    { key: 'Body', label: 'Body' },
    { key: 'Dimensions', label: 'Dimensions' },
    { key: 'Weights', label: 'Weights' },
    { key: 'Powertrain', label: 'Powertrain' },
    { key: 'Safety', label: 'Safety' },
    { key: 'Emissions', label: 'Emissions' },
    { key: 'Performance', label: 'Performance' },
    { key: 'AdditionalInformation', label: 'Additional Information' }
  ];

  const consumed = new Set<string>();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (typeof value === 'object' && !Array.isArray(value)) return;
    directEntries.push({ label: formatLabel(key), value: formatValue(value) });
  });

  if (directEntries.length) {
    yPos = renderKeyValueGrid(doc, directEntries, yPos, { startX: 25 });
  }

  nestedOrder.forEach(({ key, label }) => {
    const value = data?.[key];
    if (value && typeof value === 'object' && Object.keys(value).length > 0) {
      consumed.add(key);
      yPos = addSubSectionTitle(doc, label, yPos, primaryColor);
      yPos = renderObjectContent(doc, value, yPos, primaryColor, 1);
    }
  });

  Object.entries(data)
    .filter(([key]) => !consumed.has(key))
    .forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        yPos = addSubSectionTitle(doc, formatLabel(key), yPos, primaryColor);
        yPos = renderObjectContent(doc, value, yPos, primaryColor, 1);
      }
    });

  return yPos;
};

const renderGenericSection = (
  doc: any,
  title: string,
  data: any,
  yPos: number,
  primaryColor: [number, number, number]
): number => {
  if (!data || typeof data !== 'object') return yPos;
  yPos = addSectionTitle(doc, title, yPos, primaryColor);
  return renderObjectContent(doc, data, yPos, primaryColor, 0);
};

const renderMotHistory = (
  doc: any,
  motData: any,
  yPos: number,
  palette: {
    primary: [number, number, number];
    text: [number, number, number];
    gray: [number, number, number];
    advisory: [number, number, number];
    failure: [number, number, number];
  }
): number => {
  if (!motData) return yPos;

  let motTests: any[] = [];
  if (Array.isArray(motData)) {
    motTests = motData;
  } else if (Array.isArray(motData?.MotTestDetailsList)) {
    motTests = motData.MotTestDetailsList;
  } else if (Array.isArray(motData?.MotTests)) {
    motTests = motData.MotTests;
  }

  if (!motTests.length) return yPos;

  yPos = addSectionTitle(doc, 'MOT History', yPos, palette.primary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...palette.text);
  doc.text(`${motTests.length} MOT test(s) found`, 20, yPos);
  yPos += 8;

  motTests.forEach((test, index) => {
    yPos = ensurePageSpace(doc, yPos, 32);

    doc.setFillColor(245, 247, 255);
    doc.roundedRect(20, yPos - 3, 170, 9, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...palette.text);
    doc.text(`Test ${index + 1} – ${formatValue(test.TestDate)}`, 25, yPos + 3);

    const isPass = (test.TestResult || '').toString().toLowerCase() === 'pass';
    doc.setFillColor(...(isPass ? [16, 185, 129] : [239, 68, 68]));
    doc.roundedRect(150, yPos - 3, 35, 9, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text((test.TestResult || 'N/A').toString().toUpperCase(), 167, yPos + 3, { align: 'center' });

    yPos += 12;

    const infoEntries: GridEntry[] = [];
    if (test.OdometerReading !== undefined && test.OdometerReading !== null) {
      const mileage = Number(test.OdometerReading);
      infoEntries.push({
        label: 'Mileage',
        value: Number.isNaN(mileage) ? formatValue(test.OdometerReading) : `${mileage.toLocaleString()} miles`
      });
    }
    if (test.ExpiryDate) {
      infoEntries.push({ label: 'Expiry Date', value: formatValue(test.ExpiryDate) });
    }
    if (test.TestNumber) {
      infoEntries.push({ label: 'Test Number', value: formatValue(test.TestNumber) });
    }
    if (test.TestLocation) {
      infoEntries.push({ label: 'Test Location', value: formatValue(test.TestLocation) });
    }
    if (test.TestClass) {
      infoEntries.push({ label: 'Test Class', value: formatValue(test.TestClass) });
    }

    if (infoEntries.length) {
      yPos = renderKeyValueGrid(doc, infoEntries, yPos, { startX: 25, columnWidth: 70, columnGap: 20 });
    }

    const renderList = (items: any[], title: string, color: [number, number, number]) => {
      if (!items || !items.length) return yPos;
      yPos = ensurePageSpace(doc, yPos, items.length * 5 + 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...color);
      doc.text(`${title} (${items.length}):`, 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...palette.gray);
      items.forEach((item) => {
        const text = item?.AdvisoryNotice || item?.FailureReason || formatValue(item);
        const lines = doc.splitTextToSize(text, 160);
        doc.text(lines, 30, yPos);
        yPos += lines.length * 4;
      });
      return yPos + 2;
    };

    if (test.AdvisoryNoticeList?.length) {
      yPos = renderList(test.AdvisoryNoticeList, 'Advisories', palette.advisory);
    }

    if (test.FailureReasonList?.length) {
      yPos = renderList(test.FailureReasonList, 'Failures', palette.failure);
    }

    yPos += 6;
  });

  return yPos;
};

/**
 * Comprehensive PDF generator that works on Vercel serverless
 * Uses jsPDF and renders sections using the same structure as the website
 */
export async function generateSimplePDF(unified: UnifiedReportData): Promise<Buffer> {
  console.log('📄 Generating comprehensive PDF with jsPDF (serverless-compatible)');

  const jsPDF = await loadJsPDFConstructor();

  const { context, reportRaw = {} } = unified;
  const { registration, dateOfCheck, reference, isPremium } = context;
  const resolvedReference = reference || registration;
  const resolvedDate = new Date(dateOfCheck);
  const checkDate = Number.isNaN(resolvedDate.getTime()) ? new Date() : resolvedDate;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const palette = {
    primary: [11, 95, 255] as [number, number, number],
    text: [0, 0, 0] as [number, number, number],
    gray: [120, 120, 120] as [number, number, number],
    advisory: [217, 119, 6] as [number, number, number],
    failure: [220, 38, 38] as [number, number, number]
  };

  // Header
  doc.setFillColor(...palette.primary);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('Vehicle Check Report', 105, 14, { align: 'center' });
  doc.setFontSize(14);
  doc.text('HG Verified Vehicle Check', 105, 25, { align: 'center' });

  doc.setFillColor(255, 215, 0);
  doc.roundedRect(70, 30, 70, 12, 2, 2, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text(registration.toUpperCase(), 105, 39, { align: 'center' });

  let yPos = 52;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...palette.text);
  doc.text(`Date of Check: ${checkDate.toLocaleDateString('en-GB')}`, 20, yPos);
  yPos += 5;
  doc.text(`Reference: ${resolvedReference}`, 20, yPos);
  yPos += 5;
  doc.text(`Report Type: ${isPremium ? 'Comprehensive' : 'Basic'}`, 20, yPos);
  yPos += 12;

  const results = reportRaw?.Results || {};

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
    { key: 'MotHistoryDetails', title: 'MOT History' }
  ];

  const freeSections = new Set([
    'VehicleDetails',
    'ModelDetails',
    'VehicleTaxDetails',
    'MotHistoryDetails'
  ]);

  for (const section of sectionOrder) {
    const sectionData = results?.[section.key];
    if (!sectionData) continue;
    if (!isPremium && !freeSections.has(section.key)) continue;

    switch (section.key) {
      case 'VehicleDetails':
        yPos = renderVehicleDetails(doc, sectionData, yPos, palette.primary);
        break;
      case 'ModelDetails':
        yPos = renderModelDetails(doc, sectionData, yPos, palette.primary);
        break;
      case 'VehicleTaxDetails':
        yPos = renderGenericSection(doc, section.title, sectionData, yPos, palette.primary);
        break;
      case 'MotHistoryDetails':
        yPos = renderMotHistory(doc, sectionData, yPos, palette);
        break;
      default:
        yPos = renderGenericSection(doc, section.title, sectionData, yPos, palette.primary);
        break;
    }
  }

  yPos = ensurePageSpace(doc, yPos, 40);
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 270, 210, 27, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...palette.gray);
  doc.text('This report was generated by HG Verified Vehicle Check', 105, 278, { align: 'center' });
  doc.text(`Report Reference: ${resolvedReference}`, 105, 283, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 105, 288, { align: 'center' });

  const pdfBuffer = doc.output('arraybuffer') as ArrayBuffer;
  console.log('✅ Comprehensive PDF generated successfully with jsPDF, size:', pdfBuffer.byteLength, 'bytes');

  return Buffer.from(pdfBuffer);
}
