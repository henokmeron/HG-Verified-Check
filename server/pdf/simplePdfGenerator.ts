import type { UnifiedReportData } from './unifiedReportData';
import { formatReportValue } from '@shared/reportFormatting';
import { getFieldConfig, isFieldHidden as isSharedHidden } from '@shared/reportConfig';

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

const DASH = '—';
const EMPTY_VALUE = '—';

const isNil = (value: any) => value === null || value === undefined;

const getLabelForPath = (path: string, fallback: string) => {
  const override = getFieldConfig(path);
  return override?.label || fallback;
};

const shouldHideField = (pathOrName: string) => {
  if (!pathOrName) return false;
  return isSharedHidden(pathOrName);
};

const formatFieldValue = (value: any, path: string, fallbackLabel: string): string => {
  const formatted = formatReportValue(value, path, fallbackLabel);
  return formatted || EMPTY_VALUE;
};

const createFieldEntry = (path: string, fallbackLabel: string, value: any): GridEntry | null => {
  if (shouldHideField(path) || shouldHideField(path.split('.').pop() || '')) {
    return null;
  }
  if (isNil(value) || value === '') {
    return null;
  }

  const formatted = formatFieldValue(value, path, fallbackLabel);
  if (!formatted || formatted === EMPTY_VALUE) {
    return null;
  }

  const label = getLabelForPath(path, fallbackLabel);
  const valueColor = resolveStatusColor(path, formatted);
  return { label: `${label}:`, value: formatted, valueColor };
};

const toNumber = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const cleaned = String(value).replace(/,/g, '').replace(/[^\d.-]/g, '');
  if (!cleaned) return null;
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : null;
};

const formatNumber = (value: any, options: { decimals?: number; group?: boolean } = {}): string => {
  const num = toNumber(value);
  if (num === null) return DASH;
  const decimals = options.decimals ?? 0;
  const useGrouping = options.group !== false;
  return num.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping
  });
};

const formatUnit = (value: any, unit: string, options?: { decimals?: number; group?: boolean }): string => {
  if (typeof value === 'string' && value.trim() && !toNumber(value)) {
    return value.trim();
  }
  const base = formatNumber(value, options);
  if (base === DASH) return DASH;
  return `${base} ${unit}`.trim();
};

const boolToText = (value: any): string => {
  if (value === null || value === undefined) return DASH;
  return value ? 'Yes' : 'No';
};

const formatDate = (value: any, options: { includeTime?: boolean } = {}): string => {
  if (!value) return DASH;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : DASH;
  }
  if (options.includeTime) {
    return date
      .toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      .replace(',', '');
  }
  return date.toLocaleDateString('en-GB');
};

const textOrDash = (value: any): string => {
  if (value === null || value === undefined) return DASH;
  const str = String(value).trim();
  return str || DASH;
};

const LABEL_OVERRIDES: Record<string, string> = {
  Vrm: 'VRM',
  Vin: 'VIN',
  VinLast5: 'VIN Last 5',
  DvlaMake: 'DVLA Make',
  DvlaModel: 'DVLA Model',
  DvlaWheelPlan: 'DVLA Wheel Plan',
  DateFirstRegisteredInUk: 'Date First Registered in UK',
  DateFirstRegistered: 'Date First Registered',
  DateOfManufacture: 'Date Of Manufacture',
  YearOfManufacture: 'Year Of Manufacture',
  PreviousVrmNi: 'Previous VRM NI',
  DvlaBodyType: 'DVLA Body Type',
  DvlaFuelType: 'DVLA Fuel Type',
  IsImportedFromNi: 'Is Imported From NI',
  IsImportedFromOutsideEu: 'Is Imported From Non EU',
  DvlaCo2: 'DVLA CO2',
  DvlaCo2Band: 'DVLA CO2 Band',
  DvlaBand: 'DVLA Band',
  SixMonths: 'Six Months',
  TwelveMonths: 'Twelve Months',
  KeeperStartDate: 'Keeper Start Date',
  PreviousKeeperDisposalDate: 'Previous Keeper Disposal Date',
  IssueDate: 'Issue Date',
  Co2Emissions: 'CO2 Emissions',
  ManufacturerCo2: 'Manufacturer CO2',
  CombinedMpg: 'Combined MPG',
  UrbanMpg: 'Urban MPG',
  ExtraUrbanMpg: 'Extra Urban MPG',
  CombinedLPer100Km: 'Combined L/100km',
  UrbanLPer100Km: 'Urban L/100km',
  ExtraUrbanLPer100Km: 'Extra Urban L/100km'
};

const UNIT_OVERRIDES: Record<string, string> = {
  DvlaCo2: 'g/km',
  Co2Emissions: 'g/km',
  EngineCapacity: 'cc',
  EngineCapacityCc: 'cc',
  EngineCapacityLitres: 'litres',
  MassInService: 'kg',
  KerbWeight: 'kg',
  GrossVehicleWeight: 'kg',
  GrossCombinedWeight: 'kg',
  MaxPermissibleBrakedTrailerMass: 'kg',
  MaxPermissibleUnbrakedTrailerMass: 'kg',
  FuelTankCapacityLitres: 'litres',
  Height: 'mm',
  Width: 'mm',
  Length: 'mm',
  WheelbaseLength: 'mm',
  MaxSpeedKph: 'kph',
  MaxSpeedMph: 'mph',
  ZeroToSixtyMph: 's',
  TorqueNm: 'Nm',
  TorqueLbFt: 'lb ft',
  PowerPs: 'PS',
  PowerKw: 'kW',
  PowerBhp: 'bhp'
};

const formatLabel = (raw: string): string => {
  if (!raw) return '';
  if (LABEL_OVERRIDES[raw]) return LABEL_OVERRIDES[raw];
  return raw
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (ch) => ch.toUpperCase());
};

const formatArrayValue = (arr: any[]): string => {
  if (!arr || arr.length === 0) return DASH;
  const flattened = arr.filter((item) => item !== null && item !== undefined);
  if (!flattened.length) return DASH;
  return flattened.map((item) => textOrDash(item)).join(', ');
};

const formatGenericValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return DASH;
  if (Array.isArray(value)) return formatArrayValue(value);
  if (typeof value === 'boolean') return boolToText(value);
  if (value instanceof Date) return formatDate(value);
  if (typeof value === 'number') {
    if (UNIT_OVERRIDES[key]) {
      return formatUnit(value, UNIT_OVERRIDES[key]);
    }
    return value.toLocaleString('en-GB');
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (!keys.length) return DASH;
    return `${keys.length} field(s)`;
  }
  if (UNIT_OVERRIDES[key]) {
    return formatUnit(value, UNIT_OVERRIDES[key]);
  }
  return textOrDash(value);
};

interface NormalizedMotTest {
  index: number;
  date: Date | null;
  dateLabel: string;
  expiryDate: string;
  mileage: number | null;
  mileageLabel: string;
  testNumber: string;
  location: string;
  resultLabel: string;
  passed: boolean;
  isRetest: boolean;
  advisories: string[];
  failures: string[];
}

const extractMotTests = (motData: any): any[] => {
  if (!motData) return [];
  if (Array.isArray(motData)) return motData;
  if (Array.isArray(motData.MotTestDetailsList)) return motData.MotTestDetailsList;
  if (Array.isArray(motData.MotTestHistory)) return motData.MotTestHistory;
  if (Array.isArray(motData.MotTestHistoryList?.Tests)) return motData.MotTestHistoryList.Tests;
  if (Array.isArray(motData.MotTests?.MotTest)) return motData.MotTests.MotTest;
  if (Array.isArray(motData.MotTests)) return motData.MotTests;
  if (Array.isArray(motData.Tests)) return motData.Tests;
  if (Array.isArray(motData.TestHistory)) return motData.TestHistory;
  return [];
};

const categorizeAnnotations = (items: any[] = []): { advisories: string[]; failures: string[] } => {
  const advisories: string[] = [];
  const failures: string[] = [];

  items.forEach((item) => {
    if (!item) return;
    const type = (
      item.Type ||
      item.Result ||
      item.Outcome ||
      item.Severity ||
      item.Category ||
      ''
    )
      .toString()
      .toUpperCase();
    const text =
      item.Text ||
      item.Comment ||
      item.Advisory ||
      item.AdvisoryNotice ||
      item.FailureReason ||
      item.Description ||
      item.Notes;
    if (!text) return;
    if (type.includes('FAIL') || type.includes('PRS') || type.includes('DANGEROUS')) {
      failures.push(text);
    } else {
      advisories.push(text);
    }
  });

  return { advisories, failures };
};

const normalizeMotTests = (motData: any): NormalizedMotTest[] => {
  const rawTests = extractMotTests(motData);
  return rawTests
    .map((test, index) => {
      const dateValue = test.TestDate || test.Date || test.CompletedDate || test.MotTestDate;
      const date = dateValue ? new Date(dateValue) : null;
      const passed =
        typeof test.TestPassed === 'boolean'
          ? test.TestPassed
          : (test.TestResult || '').toString().toLowerCase().includes('pass');
      const isRetest = Boolean(test.IsRetest);
      const resultLabel = passed ? 'PASS' : 'FAIL';
      const mileage = toNumber(test.OdometerReading ?? test.Mileage ?? test.Odometer ?? test.OdometerValue);
      const mileageLabel = mileage !== null ? `${mileage.toLocaleString('en-GB')} miles` : DASH;
      const expiryDate = formatDate(test.ExpiryDate);
      const testNumber = textOrDash(test.TestNumber || test.CertificateNumber);
      const location = textOrDash(test.TestLocation || test.StationName || test.TestStationName);
      const annotationBuckets = categorizeAnnotations([
        ...(Array.isArray(test.AnnotationList) ? test.AnnotationList : []),
        ...(Array.isArray(test.AdvisoryNoticeList) ? test.AdvisoryNoticeList : []),
        ...(Array.isArray(test.FailureReasonList) ? test.FailureReasonList : []),
        ...(Array.isArray(test.RfrAndComments) ? test.RfrAndComments : []),
        ...(Array.isArray(test.Failures) ? test.Failures : []),
        ...(Array.isArray(test.Advisories) ? test.Advisories : [])
      ]);

      return {
        index,
        date,
        dateLabel: date ? formatDate(date) : DASH,
        expiryDate,
        mileage,
        mileageLabel,
        testNumber,
        location,
        resultLabel: isRetest ? `${resultLabel} (Retest)` : resultLabel,
        passed,
        isRetest,
        advisories: annotationBuckets.advisories,
        failures: annotationBuckets.failures
      };
    })
    .sort((a, b) => {
      const aTime = a.date ? a.date.getTime() : 0;
      const bTime = b.date ? b.date.getTime() : 0;
      return bTime - aTime;
    });
};

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

type GridEntry = {
  label: string;
  value: string;
  valueColor?: [number, number, number];
};

const GOOD_COLOR: [number, number, number] = [16, 185, 129];
const BAD_COLOR: [number, number, number] = [220, 38, 38];
const MUTED_TEXT: [number, number, number] = [90, 90, 90];

const CRITICAL_STATUS_RULES: Record<string, { positive: string[] }> = {
  'VehicleDetails.VehicleStatus.IsImported': { positive: ['no'] },
  'VehicleDetails.VehicleStatus.IsImportedFromNi': { positive: ['no'] },
  'VehicleDetails.VehicleStatus.IsImportedFromOutsideEu': { positive: ['no'] },
  'VehicleDetails.VehicleStatus.CertificateOfDestructionIssued': { positive: ['no'] },
  'VehicleDetails.VehicleStatus.IsExported': { positive: ['no'] },
  'VehicleDetails.VehicleStatus.IsScrapped': { positive: ['no'] },
  'VehicleDetails.VehicleStatus.IsUnscrapped': { positive: ['yes'] },
  'VehicleDetails.VehicleStatus.IsUnscrappedVehicle': { positive: ['yes'] },
  'VehicleTaxDetails.TaxIsCurrentlyValid': { positive: ['yes'] },
  'VehicleTaxDetails.TaxStatus': { positive: ['taxed'] },
  'VehicleTaxDetails.MotStatus': { positive: ['valid'] },
  'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.DvlaBand': { positive: ['f', 'e', 'd', 'c', 'b', 'a'] }
};

const resolveStatusColor = (path: string, formattedValue: string): [number, number, number] | undefined => {
  const rule = CRITICAL_STATUS_RULES[path];
  if (!rule) return undefined;
  const normalized = formattedValue?.toString().trim().toLowerCase();
  if (!normalized) return undefined;
  return rule.positive.includes(normalized) ? GOOD_COLOR : BAD_COLOR;
};

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
        blockHeight: labelHeight + valueHeight + 6,
        valueColor: entry.valueColor
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
      doc.setTextColor(...(metric.valueColor ?? MUTED_TEXT));
      doc.text(metric.valueLines, x, valueY, { maxWidth: columnWidth });
      doc.setTextColor(0, 0, 0);
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
  depth = 0,
  basePath = ''
): number => {
  if (!data || typeof data !== 'object') return yPos;

  const directEntries: GridEntry[] = [];
  const nestedEntries: Array<{ title: string; value: any; path: string }> = [];

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    const currentPath = basePath ? `${basePath}.${key}` : key;
    if (shouldHideField(currentPath) || shouldHideField(key)) continue;

    if (Array.isArray(value)) {
      const primitiveArray = value.every(
        (item) => item === null || item === undefined || typeof item !== 'object'
      );
      if (primitiveArray) {
        const entry = createFieldEntry(currentPath, formatLabel(key), formatArrayValue(value));
        if (entry) {
          directEntries.push(entry);
        }
      } else {
        value.forEach((item, index) => {
          if (!item || typeof item !== 'object') return;
          nestedEntries.push({
            title: `${getLabelForPath(currentPath, formatLabel(key))}${value.length > 1 ? ` ${index + 1}` : ''}`.trim(),
            value: item,
            path: currentPath
          });
        });
      }
      continue;
    }

    if (typeof value === 'object') {
      if (Object.keys(value).length === 0) continue;
      nestedEntries.push({
        title: getLabelForPath(currentPath, formatLabel(key)),
        value,
        path: currentPath
      });
      continue;
    }

    const entry = createFieldEntry(currentPath, formatLabel(key), value);
    if (entry) {
      directEntries.push(entry);
    }
  }

  if (directEntries.length) {
    const startX = depth > 0 ? 30 : 25;
    yPos = renderKeyValueGrid(doc, directEntries, yPos, { startX });
  }

  for (const nested of nestedEntries) {
    yPos = addSubSectionTitle(doc, nested.title, yPos, primaryColor);
    yPos = renderObjectContent(doc, nested.value, yPos, primaryColor, depth + 1, nested.path);
  }

  return yPos;
};

const renderVehicleDetails = (
  doc: any,
  data: any,
  registration: string,
  yPos: number,
  primaryColor: [number, number, number]
): number => {
  if (!data || typeof data !== 'object') return yPos;
  const entry = (label: string, value: any, path?: string): GridEntry | null => {
    if (path) {
      return createFieldEntry(path, label, value);
    }
    if (value === null || value === undefined || value === '') return null;
    return { label: `${label}:`, value: value ?? DASH };
  };

  yPos = addSectionTitle(doc, 'Vehicle Details', yPos, primaryColor);

  const vehicleId = data?.VehicleIdentification || {};
  const identificationEntries: GridEntry[] = [
    entry('VRM', vehicleId.Vrm || registration, 'VehicleDetails.VehicleIdentification.Vrm'),
    entry('VIN', vehicleId.Vin, 'VehicleDetails.VehicleIdentification.Vin'),
    entry('VIN Last 5', vehicleId.VinLast5, 'VehicleDetails.VehicleIdentification.VinLast5'),
    entry('DVLA Make', vehicleId.DvlaMake, 'VehicleDetails.VehicleIdentification.DvlaMake'),
    entry('DVLA Model', vehicleId.DvlaModel, 'VehicleDetails.VehicleIdentification.DvlaModel'),
    entry('DVLA Wheel Plan', vehicleId.DvlaWheelPlan, 'VehicleDetails.VehicleIdentification.DvlaWheelPlan'),
    entry('Date First Registered in UK', vehicleId.DateFirstRegisteredInUk, 'VehicleDetails.VehicleIdentification.DateFirstRegisteredInUk'),
    entry('Date First Registered', vehicleId.DateFirstRegistered, 'VehicleDetails.VehicleIdentification.DateFirstRegistered'),
    entry('Date Of Manufacture', vehicleId.DateOfManufacture, 'VehicleDetails.VehicleIdentification.DateOfManufacture'),
    entry('Year Of Manufacture', vehicleId.YearOfManufacture, 'VehicleDetails.VehicleIdentification.YearOfManufacture'),
    entry('Vehicle Used Before First Registration', vehicleId.VehicleUsedBeforeFirstRegistration, 'VehicleDetails.VehicleIdentification.VehicleUsedBeforeFirstRegistration'),
    entry('Engine Number', vehicleId.EngineNumber, 'VehicleDetails.VehicleIdentification.EngineNumber'),
    entry('Previous VRM NI', vehicleId.PreviousVrmNi, 'VehicleDetails.VehicleIdentification.PreviousVrmNi'),
    entry('DVLA Body Type', vehicleId.DvlaBodyType, 'VehicleDetails.VehicleIdentification.DvlaBodyType'),
    entry('DVLA Fuel Type', vehicleId.DvlaFuelType, 'VehicleDetails.VehicleIdentification.DvlaFuelType')
  ].filter(Boolean) as GridEntry[];

  if (identificationEntries.length) {
    yPos = addSubSectionTitle(doc, 'Vehicle Identification', yPos, primaryColor);
    yPos = renderKeyValueGrid(doc, identificationEntries, yPos);
  }

  const vehicleStatus = data?.VehicleStatus || {};
  const statusEntries: GridEntry[] = [
    entry('Is Imported', vehicleStatus.IsImported, 'VehicleDetails.VehicleStatus.IsImported'),
    entry('Is Imported From NI', vehicleStatus.IsImportedFromNi, 'VehicleDetails.VehicleStatus.IsImportedFromNi'),
    entry('Is Imported From Non EU', vehicleStatus.IsImportedFromOutsideEu, 'VehicleDetails.VehicleStatus.IsImportedFromOutsideEu'),
    entry('Date Imported', vehicleStatus.DateImported, 'VehicleDetails.VehicleStatus.DateImported'),
    entry('Certificate Of Destruction Issued', vehicleStatus.CertificateOfDestructionIssued, 'VehicleDetails.VehicleStatus.CertificateOfDestructionIssued'),
    entry('Is Exported', vehicleStatus.IsExported, 'VehicleDetails.VehicleStatus.IsExported'),
    entry('Date Exported', vehicleStatus.DateExported, 'VehicleDetails.VehicleStatus.DateExported'),
    entry('Is Scrapped', vehicleStatus.IsScrapped, 'VehicleDetails.VehicleStatus.IsScrapped'),
    entry('Is Unscrapped', vehicleStatus.IsUnscrapped, 'VehicleDetails.VehicleStatus.IsUnscrapped'),
    entry('Date Scrapped', vehicleStatus.DateScrapped, 'VehicleDetails.VehicleStatus.DateScrapped'),
    entry('DVLA Cherished Transfer Marker', vehicleStatus.DvlaCherishedTransferMarker, 'VehicleDetails.VehicleStatus.DvlaCherishedTransferMarker')
  ].filter(Boolean) as GridEntry[];

  if (statusEntries.length) {
    yPos = addSubSectionTitle(doc, 'Vehicle Status', yPos, primaryColor);
    yPos = renderKeyValueGrid(doc, statusEntries, yPos);
  }

  const history = data?.VehicleHistory || {};
  const colorDetails = history?.ColourDetails || {};
  const colorEntries: GridEntry[] = [
    entry('Current Colour', colorDetails.CurrentColour, 'VehicleDetails.VehicleHistory.ColourDetails.CurrentColour'),
    entry('Number Of Colour Changes', colorDetails.NumberOfColourChanges, 'VehicleDetails.VehicleHistory.ColourDetails.NumberOfColourChanges'),
    entry('Original Colour', colorDetails.OriginalColour, 'VehicleDetails.VehicleHistory.ColourDetails.OriginalColour')
  ].filter(Boolean) as GridEntry[];

  const keeperList = Array.isArray(history?.KeeperChangeList) ? history.KeeperChangeList : [];
  const plateList = Array.isArray(history?.PlateChangeList) ? history.PlateChangeList : [];
  const v5cList = Array.isArray(history?.V5cCertificateList) ? history.V5cCertificateList : [];

  if (colorEntries.length || keeperList.length || plateList.length || v5cList.length) {
    yPos = addSubSectionTitle(doc, 'Vehicle History', yPos, primaryColor);
  }

  if (colorEntries.length) {
    yPos = renderKeyValueGrid(doc, colorEntries, yPos);
  }

  const renderTimelineCards = (
    title: string,
    items: any[],
    formatter: (item: any, index: number) => GridEntry[]
  ): number => {
    if (!items.length) return yPos;

    yPos = ensurePageSpace(doc, yPos, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text(title, 25, yPos);
    yPos += 6;

    items.forEach((item: any, idx) => {
      const entries = formatter(item, idx);
      if (!entries.length) return;
      const cardHeight = entries.length * 6 + 6;
      yPos = ensurePageSpace(doc, yPos, cardHeight + 6);

      doc.setDrawColor(224, 229, 244);
      doc.setFillColor(249, 250, 255);
      doc.roundedRect(25, yPos - 3, 160, cardHeight + 6, 3, 3, 'F');
      doc.roundedRect(25, yPos - 3, 160, cardHeight + 6, 3, 3);

      let lineY = yPos + 3;
      entries.forEach((entry) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...primaryColor);
        doc.text(entry.label, 30, lineY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...(entry.valueColor ?? MUTED_TEXT));
        doc.text(entry.value, 90, lineY);
        lineY += 6;
      });

      yPos += cardHeight + 6;
    });
    return yPos + 2;
  };

  if (keeperList.length) {
    yPos = renderTimelineCards('Keeper Change History', keeperList, (item, index) => [
      { label: `Keeper ${index + 1}`, value: textOrDash(item.NumberOfPreviousKeepers) },
      { label: 'Start Date', value: formatDate(item.KeeperStartDate) },
      { label: 'Previous Disposal Date', value: formatDate(item.PreviousKeeperDisposalDate) }
    ]);
  }

  if (plateList.length) {
    yPos = renderTimelineCards('Plate Change History', plateList, (item) => [
      { label: 'Previous Plate', value: textOrDash(item.PreviousPlate) },
      { label: 'Date', value: formatDate(item.PlateChangeDate) }
    ]);
  }

  if (v5cList.length) {
    yPos = renderTimelineCards('V5C Certificate Issue Dates', v5cList, (item) => [
      { label: 'Issue Date', value: formatDate(item.IssueDate) }
    ]);
  }

  const tech = data?.DvlaTechnicalDetails || {};
  const engineCapacityValue = tech.EngineCapacityCc ?? tech.EngineCapacity;
  const engineCapacityPath = tech.EngineCapacityCc
    ? 'VehicleDetails.DvlaTechnicalDetails.EngineCapacityCc'
    : 'VehicleDetails.DvlaTechnicalDetails.EngineCapacity';
  const maxNetPowerValue = tech.MaxNetPowerKw ?? tech.MaxNetPower;
  const maxNetPowerPath = tech.MaxNetPowerKw
    ? 'VehicleDetails.DvlaTechnicalDetails.MaxNetPowerKw'
    : 'VehicleDetails.DvlaTechnicalDetails.MaxNetPower';
  const massInServiceValue = tech.MassInServiceKg ?? tech.MassInService;
  const massInServicePath = tech.MassInServiceKg
    ? 'VehicleDetails.DvlaTechnicalDetails.MassInServiceKg'
    : 'VehicleDetails.DvlaTechnicalDetails.MassInService';

  const techEntries: GridEntry[] = [
    entry('Number Of Seats', tech.NumberOfSeats, 'VehicleDetails.DvlaTechnicalDetails.NumberOfSeats'),
    entry('Engine Capacity', engineCapacityValue, engineCapacityPath),
    entry('Max Net Power', maxNetPowerValue, maxNetPowerPath),
    entry('Mass In Service', massInServiceValue, massInServicePath),
    entry('Power To Weight Ratio', tech.PowerToWeightRatio, 'VehicleDetails.DvlaTechnicalDetails.PowerToWeightRatio'),
    entry(
      'Max Permissible Braked Trailer Mass',
      tech.MaxPermissibleBrakedTrailerMassKg ?? tech.MaxPermissibleBrakedTrailerMass,
      tech.MaxPermissibleBrakedTrailerMassKg
        ? 'VehicleDetails.DvlaTechnicalDetails.MaxPermissibleBrakedTrailerMassKg'
        : 'VehicleDetails.DvlaTechnicalDetails.MaxPermissibleBrakedTrailerMass'
    ),
    entry(
      'Max Permissible Unbraked Trailer Mass',
      tech.MaxPermissibleUnbrakedTrailerMassKg ?? tech.MaxPermissibleUnbrakedTrailerMass,
      tech.MaxPermissibleUnbrakedTrailerMassKg
        ? 'VehicleDetails.DvlaTechnicalDetails.MaxPermissibleUnbrakedTrailerMassKg'
        : 'VehicleDetails.DvlaTechnicalDetails.MaxPermissibleUnbrakedTrailerMass'
    )
  ].filter(Boolean) as GridEntry[];

  if (techEntries.length) {
    yPos = addSubSectionTitle(doc, 'DVLA Technical Details', yPos, primaryColor);
    yPos = renderKeyValueGrid(doc, techEntries, yPos);
  }

  const vehicleTaxDetails = data?.VehicleTaxDetails || {};
  const taxEntries: GridEntry[] = [
    entry('VRM', vehicleTaxDetails.Vrm, 'VehicleTaxDetails.Vrm'),
    entry('Make', vehicleTaxDetails.Make, 'VehicleTaxDetails.Make'),
    entry('CO2 Emissions', vehicleTaxDetails.Co2Emissions, 'VehicleTaxDetails.Co2Emissions'),
    entry('MOT Status', vehicleTaxDetails.MotStatus, 'VehicleTaxDetails.MotStatus'),
    entry('Year Of Manufacture', vehicleTaxDetails.YearOfManufacture, 'VehicleTaxDetails.YearOfManufacture'),
    entry('Tax Due Date', vehicleTaxDetails.TaxDueDate, 'VehicleTaxDetails.TaxDueDate'),
    entry('Tax Status', vehicleTaxDetails.TaxStatus, 'VehicleTaxDetails.TaxStatus'),
    entry('Tax Is Currently Valid', vehicleTaxDetails.TaxIsCurrentlyValid, 'VehicleTaxDetails.TaxIsCurrentlyValid'),
    entry('Tax Days Remaining', vehicleTaxDetails.TaxDaysRemaining, 'VehicleTaxDetails.TaxDaysRemaining')
  ].filter(Boolean) as GridEntry[];

  if (taxEntries.length) {
    yPos = addSectionTitle(doc, 'Vehicle Tax Details', yPos, primaryColor);
    yPos = renderKeyValueGrid(doc, taxEntries, yPos);
  }

  const vedDetails = vehicleStatus?.VehicleExciseDutyDetails || {};
  const vedEntries: GridEntry[] = [
    entry('DVLA CO2', vedDetails.DvlaCo2, 'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.DvlaCo2'),
    entry('DVLA CO2 Band', vedDetails.DvlaCo2Band, 'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.DvlaCo2Band'),
    entry('DVLA Band', vedDetails.DvlaBand, 'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.DvlaBand'),
    entry('Standard Six Months', vedDetails?.VedRate?.Standard?.SixMonths, 'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.VedRate.Standard.SixMonths'),
    entry('Standard Twelve Months', vedDetails?.VedRate?.Standard?.TwelveMonths, 'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.VedRate.Standard.TwelveMonths'),
    entry('First Year Six Months', vedDetails?.VedRate?.FirstYear?.SixMonths, 'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.VedRate.FirstYear.SixMonths'),
    entry('First Year Twelve Months', vedDetails?.VedRate?.FirstYear?.TwelveMonths, 'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.VedRate.FirstYear.TwelveMonths'),
    entry('Premium Vehicle Six Months', vedDetails?.VedRate?.PremiumVehicle?.SixMonths, 'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.VedRate.PremiumVehicle.SixMonths'),
    entry('Premium Vehicle Twelve Months', vedDetails?.VedRate?.PremiumVehicle?.TwelveMonths, 'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.VedRate.PremiumVehicle.TwelveMonths')
  ].filter((pair, idx) => pair && (pair.value !== DASH || idx < 3)) as GridEntry[];

  if (vedEntries.length) {
    yPos = addSectionTitle(doc, 'Vehicle Excise Duty Details', yPos, primaryColor);
    yPos = renderKeyValueGrid(doc, vedEntries, yPos);
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
    const currentPath = `ModelDetails.${key}`;
    if (shouldHideField(currentPath) || shouldHideField(key)) return;
    directEntries.push({ label: `${formatLabel(key)}:`, value: formatGenericValue(key, value) });
  });

  if (directEntries.length) {
    yPos = renderKeyValueGrid(doc, directEntries, yPos, { startX: 25 });
  }

  nestedOrder.forEach(({ key, label }) => {
    const value = data?.[key];
    if (value && typeof value === 'object' && Object.keys(value).length > 0) {
      consumed.add(key);
      yPos = addSubSectionTitle(doc, label, yPos, primaryColor);
      yPos = renderObjectContent(doc, value, yPos, primaryColor, 1, `ModelDetails.${key}`);
    }
  });

  Object.entries(data)
    .filter(([key]) => !consumed.has(key))
    .forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        yPos = addSubSectionTitle(doc, formatLabel(key), yPos, primaryColor);
        yPos = renderObjectContent(doc, value, yPos, primaryColor, 1, `ModelDetails.${key}`);
      }
    });

  return yPos;
};

const renderGenericSection = (
  doc: any,
  title: string,
  data: any,
  yPos: number,
  primaryColor: [number, number, number],
  sectionPath?: string
): number => {
  if (!data || typeof data !== 'object') return yPos;
  yPos = addSectionTitle(doc, title, yPos, primaryColor);
  return renderObjectContent(doc, data, yPos, primaryColor, 0, sectionPath);
};

const renderMileageSummary = (
  doc: any,
  tests: NormalizedMotTest[],
  yPos: number,
  primaryColor: [number, number, number]
): number => {
  const mileageRecords = tests
    .filter((test) => test.mileage !== null && test.date)
    .sort((a, b) => {
      const aTime = a.date ? a.date.getTime() : 0;
      const bTime = b.date ? b.date.getTime() : 0;
      return aTime - bTime;
    });

  if (!mileageRecords.length) return yPos;

  const first = mileageRecords[0];
  const last = mileageRecords[mileageRecords.length - 1];
  const totalIncrease =
    first && last && first.mileage !== null && last.mileage !== null ? last.mileage - first.mileage : null;
  const yearsDiff =
    first && last && first.date && last.date ? (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24 * 365.25) : null;
  const averagePerYear = totalIncrease !== null && yearsDiff && yearsDiff > 0 ? totalIncrease / yearsDiff : null;

  yPos = addSectionTitle(doc, 'Mileage History Summary', yPos, primaryColor);
  yPos = ensurePageSpace(doc, yPos, 40);

  const summaryEntries: GridEntry[] = [
    { label: 'First Recorded:', value: first ? `${first.dateLabel} • ${first.mileageLabel}` : DASH },
    { label: 'Latest Recorded:', value: last ? `${last.dateLabel} • ${last.mileageLabel}` : DASH },
    { label: 'Total Increase:', value: totalIncrease !== null ? `${totalIncrease.toLocaleString('en-GB')} miles` : DASH },
    { label: 'Average Per Year:', value: averagePerYear !== null ? `${averagePerYear.toFixed(0)} miles/year` : DASH },
    { label: 'Records:', value: `${mileageRecords.length} entries` }
  ];

  yPos = renderKeyValueGrid(doc, summaryEntries, yPos, { startX: 25, columnWidth: 80, columnGap: 20 });

  yPos = ensurePageSpace(doc, yPos, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('Mileage Over Time', 25, yPos);
  yPos += 8;

  // Line chart - increased height to match old report
  const chartHeight = 80;
  const chartWidth = 160;
  const chartStartX = 25;
  const chartStartY = yPos + chartHeight;
  const minMileage = Math.min(...mileageRecords.map((r) => r.mileage ?? 0));
  const maxMileage = Math.max(...mileageRecords.map((r) => r.mileage ?? 0));
  const mileageRange = Math.max(maxMileage - minMileage, 1);

  doc.setDrawColor(200, 200, 200);
  doc.rect(chartStartX, yPos, chartWidth, chartHeight);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text(`${maxMileage.toLocaleString('en-GB')} mi`, chartStartX - 2, yPos + 4, { align: 'right' });
  doc.text(`${minMileage.toLocaleString('en-GB')} mi`, chartStartX - 2, chartStartY, { align: 'right' });

  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.6);
  let lastPoint: { x: number; y: number } | null = null;
  mileageRecords.forEach((record, idx) => {
    const ratio = (record.mileage! - minMileage) / mileageRange;
    const x =
      chartStartX + (idx / Math.max(mileageRecords.length - 1, 1)) * chartWidth;
    const y = chartStartY - ratio * chartHeight;
    if (lastPoint) {
      doc.line(lastPoint.x, lastPoint.y, x, y);
    }
    lastPoint = { x, y };
  });

  mileageRecords.forEach((record, idx) => {
    const ratio = (record.mileage! - minMileage) / mileageRange;
    const x =
      chartStartX + (idx / Math.max(mileageRecords.length - 1, 1)) * chartWidth;
    const y = chartStartY - ratio * chartHeight;
    doc.setFillColor(...primaryColor);
    doc.circle(x, y, 1.5, 'F');
  });

  const firstYear = mileageRecords[0].date?.getFullYear();
  const lastYear = mileageRecords[mileageRecords.length - 1].date?.getFullYear();
  const middleYear =
    mileageRecords[Math.floor(mileageRecords.length / 2)].date?.getFullYear();
  doc.setFontSize(8);
  doc.setTextColor(...MUTED_TEXT);
  if (typeof firstYear === 'number') {
    doc.text(firstYear.toString(), chartStartX, chartStartY + 6, { align: 'center' });
  }
  if (typeof middleYear === 'number' && middleYear !== firstYear && middleYear !== lastYear) {
    doc.text(middleYear.toString(), chartStartX + chartWidth / 2, chartStartY + 6, { align: 'center' });
  }
  if (typeof lastYear === 'number') {
    doc.text(lastYear.toString(), chartStartX + chartWidth, chartStartY + 6, { align: 'center' });
  }

  yPos += chartHeight + 10;

  // Mileage table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('Detailed Mileage Records', 25, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const recordBoxWidth = 160;
  const recordBoxHeight = 16;
  const changeBoxWidth = 60;

  mileageRecords.forEach((record, idx) => {
    yPos = ensurePageSpace(doc, yPos, recordBoxHeight + 6);
    doc.setDrawColor(225, 228, 240);
    doc.roundedRect(25, yPos, recordBoxWidth, recordBoxHeight, 3, 3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...primaryColor);
    doc.text(record.dateLabel, 30, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED_TEXT);
    doc.text(record.mileageLabel, 30, yPos + 12);

    const changeValue =
      idx === 0 || record.mileage === null || mileageRecords[idx - 1].mileage === null
        ? null
        : record.mileage - (mileageRecords[idx - 1].mileage ?? 0);
    const changeText =
      changeValue === null
        ? '—'
        : `${changeValue >= 0 ? '+' : ''}${changeValue.toLocaleString('en-GB')} miles`;

    const changeX = 25 + recordBoxWidth - changeBoxWidth - 6;
    const changeY = yPos + 2;
    doc.setFillColor(240, 244, 255);
    doc.setDrawColor(205, 216, 240);
    doc.roundedRect(changeX, changeY, changeBoxWidth + 6, recordBoxHeight - 4, 3, 3, 'F');
    doc.roundedRect(changeX, changeY, changeBoxWidth + 6, recordBoxHeight - 4, 3, 3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text(changeText, changeX + (changeBoxWidth + 6) / 2, yPos + 11, { align: 'center' });

    yPos += recordBoxHeight + 6;
  });

  return yPos + 4;
};

const renderFuelEfficiencyPanel = (
  doc: any,
  results: any,
  vehicleData: any,
  yPos: number,
  primaryColor: [number, number, number]
): number => {
  const fuelEconomy = results?.ModelDetails?.Performance?.FuelEconomy || {};
  let combinedMpg = toNumber(fuelEconomy.CombinedMpg);
  let urbanMpg = toNumber(fuelEconomy.UrbanMpg);
  let extraUrbanMpg = toNumber(fuelEconomy.ExtraUrbanMpg);
  let combinedL = toNumber(fuelEconomy.CombinedLPer100Km);
  let urbanL = toNumber(fuelEconomy.UrbanLPer100Km);
  let extraL = toNumber(fuelEconomy.ExtraUrbanLPer100Km);

  if (!combinedMpg && vehicleData?.fuelEconomyCombined) {
    combinedMpg = toNumber(vehicleData.fuelEconomyCombined);
  }

  if (!combinedL && combinedMpg) combinedL = 282.481 / combinedMpg;
  if (!urbanL && urbanMpg) urbanL = 282.481 / urbanMpg;
  if (!extraL && extraUrbanMpg) extraL = 282.481 / extraUrbanMpg;
  if (!urbanMpg && urbanL) urbanMpg = 282.481 / urbanL;
  if (!extraUrbanMpg && extraL) extraUrbanMpg = 282.481 / extraL;

  const co2 = toNumber(
    results?.VehicleDetails?.VehicleStatus?.VehicleExciseDutyDetails?.DvlaCo2 ||
      results?.ModelDetails?.Emissions?.Co2Emissions
  );
  const fuelType = textOrDash(results?.VehicleDetails?.VehicleIdentification?.DvlaFuelType || vehicleData?.fuelType);

  if (!combinedMpg && !urbanMpg && !extraUrbanMpg && !co2) return yPos;

  let efficiencyRating = 50;
  if (combinedMpg) {
    if (combinedMpg >= 60) efficiencyRating = 95;
    else if (combinedMpg >= 50) efficiencyRating = 85;
    else if (combinedMpg >= 40) efficiencyRating = 75;
    else if (combinedMpg >= 30) efficiencyRating = 65;
    else if (combinedMpg >= 20) efficiencyRating = 50;
    else efficiencyRating = 35;
  }

  let category = 'Average';
  if (efficiencyRating >= 85) category = 'Excellent';
  else if (efficiencyRating >= 75) category = 'Very Good';
  else if (efficiencyRating >= 65) category = 'Good';
  else if (efficiencyRating < 50) category = 'Below Average';

  yPos = addSectionTitle(doc, 'Fuel Economy & Efficiency', yPos, primaryColor);
  yPos = ensurePageSpace(doc, yPos, 50);

  const stats: GridEntry[] = [
    { label: 'Combined MPG:', value: combinedMpg ? `${combinedMpg.toFixed(1)} mpg` : DASH },
    { label: 'Urban MPG:', value: urbanMpg ? `${urbanMpg.toFixed(1)} mpg` : DASH },
    { label: 'Extra Urban MPG:', value: extraUrbanMpg ? `${extraUrbanMpg.toFixed(1)} mpg` : DASH },
    { label: 'Combined L/100km:', value: combinedL ? `${combinedL.toFixed(1)} L/100km` : DASH },
    { label: 'CO2 Emissions:', value: co2 !== null ? `${co2.toFixed(0)} g/km` : DASH },
    { label: 'Fuel Type:', value: fuelType }
  ];

  yPos = renderKeyValueGrid(doc, stats, yPos, { startX: 25, columnWidth: 80, columnGap: 20 });
  yPos = ensurePageSpace(doc, yPos, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('Efficiency Rating', 25, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text(`${efficiencyRating}% • ${category}`, 65, yPos);

  return yPos + 10;
};

const renderMotHistory = (
  doc: any,
  motData: any,
  vehicleData: any,
  results: any,
  yPos: number,
  palette: {
    primary: [number, number, number];
    text: [number, number, number];
    gray: [number, number, number];
    advisory: [number, number, number];
    failure: [number, number, number];
  }
): number => {
  const motTests = normalizeMotTests(motData);
  if (!motTests.length) return yPos;

  yPos = addSectionTitle(doc, 'MOT History & Mileage Records', yPos, palette.primary);

  const nonRetest = motTests.filter((test) => !test.isRetest);
  const passCount = nonRetest.filter((test) => test.passed).length;
  const failCount = nonRetest.length - passCount;
  const passRate = nonRetest.length ? Math.round((passCount / nonRetest.length) * 100) : 0;

  yPos = ensurePageSpace(doc, yPos, 18);
  doc.setFillColor(245, 247, 255);
  doc.roundedRect(20, yPos - 10, 170, 18, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...palette.primary);
  doc.text(`Pass Rate: ${passRate}%`, 25, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...palette.text);
  doc.text(`Based on ${nonRetest.length} tests (excluding retests)`, 25, yPos + 6);
  doc.setTextColor(...GOOD_COLOR);
  doc.text(`Passed: ${passCount}`, 120, yPos);
  doc.setTextColor(...BAD_COLOR);
  doc.text(`Failed: ${failCount}`, 120, yPos + 6);
  doc.setTextColor(...palette.text);

  yPos += 15;

  type PreparedCard = {
    test: NormalizedMotTest;
    index: number;
    detailLines: { label: string; lines: string[]; height: number }[];
    advisoryBlocks: string[][];
    failureBlocks: string[][];
    cardHeight: number;
  };

  const preparedCards: PreparedCard[] = motTests.map((test, index) => {
    const makeLine = (label: string, value?: string): PreparedCard['detailLines'][number] | null => {
      if (!value || value === DASH) return null;
      const lines = doc.splitTextToSize(value, 105);
      return { label, lines, height: lines.length * 4 + 2 };
    };

    const detailLines = [
      makeLine('Mileage At Test', test.mileageLabel),
      makeLine('Expiry Date', test.expiryDate),
      makeLine('Test Centre', test.location),
      makeLine('Certificate', test.testNumber),
      test.isRetest ? makeLine('Retest', 'Yes') : null
    ].filter(Boolean) as PreparedCard['detailLines'];

    const advisoryBlocks = test.advisories.map((text) => doc.splitTextToSize(`• ${text}`, 150));
    const failureBlocks = test.failures.map((text) => doc.splitTextToSize(`• ${text}`, 150));

    const detailHeight = detailLines.reduce((sum, line) => sum + line.height + 2, 0);
    const advisoryHeight = advisoryBlocks.length
      ? 8 + advisoryBlocks.reduce((sum, block) => sum + block.length * 4 + 2, 0)
      : 0;
    const failureHeight = failureBlocks.length
      ? 8 + failureBlocks.reduce((sum, block) => sum + block.length * 4 + 2, 0)
      : 0;

    const cardHeight = 20 + detailHeight + advisoryHeight + failureHeight + 8;

    return { test, index, detailLines, advisoryBlocks, failureBlocks, cardHeight };
  });

  preparedCards.forEach((card) => {
    yPos = ensurePageSpace(doc, yPos, card.cardHeight + 6);
    const cardTop = yPos;

    doc.setFillColor(248, 249, 255);
    doc.setDrawColor(225, 229, 244);
    doc.roundedRect(20, cardTop - 4, 170, card.cardHeight + 8, 4, 4, 'F');
    doc.roundedRect(20, cardTop - 4, 170, card.cardHeight + 8, 4, 4);

    let innerY = cardTop + 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...palette.text);
    doc.text(`Test ${card.index + 1} – ${card.test.dateLabel}`, 26, innerY);

    const badgeColor = card.test.passed ? GOOD_COLOR : BAD_COLOR;
    doc.setFillColor(...badgeColor);
    doc.roundedRect(155, innerY - 6, 30, 10, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9.5);
    doc.text(card.test.resultLabel, 170, innerY, { align: 'center' });

    innerY += 10;
    doc.setTextColor(...palette.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    card.detailLines.forEach((line) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...palette.primary);
      doc.text(`${line.label}:`, 26, innerY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...palette.text);
      doc.text(line.lines, 70, innerY, { maxWidth: 110 });
      innerY += line.height;
    });

    if (card.advisoryBlocks.length) {
      innerY = ensurePageSpace(doc, innerY, 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...palette.advisory);
      doc.text(`Advisories (${card.advisoryBlocks.length})`, 26, innerY);
      innerY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...palette.gray);
      card.advisoryBlocks.forEach((block) => {
        doc.text(block, 28, innerY, { maxWidth: 160 });
        innerY += block.length * 4 + 1;
      });
    }

    if (card.failureBlocks.length) {
      innerY = ensurePageSpace(doc, innerY, 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...palette.failure);
      doc.text(`Failures (${card.failureBlocks.length})`, 26, innerY);
      innerY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...palette.gray);
      card.failureBlocks.forEach((block) => {
        doc.text(block, 28, innerY, { maxWidth: 160 });
        innerY += block.length * 4 + 1;
      });
    }

    yPos = Math.max(innerY + 6, cardTop + card.cardHeight + 4);
  });

  yPos = renderMileageSummary(doc, motTests, yPos, palette.primary);
  yPos = renderFuelEfficiencyPanel(doc, results, vehicleData, yPos, palette.primary);

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
  doc.rect(0, 0, 210, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('Vehicle Check Report', 105, 14, { align: 'center' });
  doc.setFontSize(14);
  doc.text('HG Verified Vehicle Check', 105, 25, { align: 'center' });

  doc.setFillColor(255, 215, 0);
  doc.roundedRect(60, 28, 90, 16, 3, 3, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(registration.toUpperCase(), 105, 40, { align: 'center' });

  let yPos = 55;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...palette.text);
  doc.text(`Registration: ${registration.toUpperCase()}`, 20, yPos);
  yPos += 6;
  doc.text(`Date Of Check: ${formatDate(checkDate, { includeTime: true })}`, 20, yPos);
  yPos += 6;
  doc.text(`Reference: ${resolvedReference}`, 20, yPos);
  yPos += 10;

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
        yPos = renderVehicleDetails(doc, sectionData, registration, yPos, palette.primary);
        break;
      case 'ModelDetails':
        yPos = renderModelDetails(doc, sectionData, yPos, palette.primary);
        break;
      case 'VehicleTaxDetails':
        yPos = renderGenericSection(doc, section.title, sectionData, yPos, palette.primary, section.key);
        break;
      case 'MotHistoryDetails':
        yPos = renderMotHistory(doc, sectionData, unified.vehicleData, results, yPos, palette);
        break;
      default:
        yPos = renderGenericSection(doc, section.title, sectionData, yPos, palette.primary, section.key);
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
