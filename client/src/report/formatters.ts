export const isEmpty = (v: any) =>
  v === null || v === undefined || (typeof v === 'string' && v.trim() === '');

// Field name patterns that need units
const UNIT_PATTERNS: Record<string, string> = {
  // Weight fields
  'weight': 'kg',
  'mass': 'kg',
  'grossweight': 'kg',
  'kerbweight': 'kg',
  'unladenweight': 'kg',
  'payloadweight': 'kg',
  'revenueweight': 'kg',
  // Power fields
  'power': 'kW',
  'maxnetpower': 'kW',
  'bhp': 'bhp',
  'ps': 'PS',
  // Speed fields
  'speed': 'mph',
  'topspeed': 'mph',
  'acceleration': 's',
  // Capacity fields
  'capacity': 'cc',
  'enginecapacity': 'cc',
  'enginesize': 'cc',
  // Emissions
  'co2': 'g/km',
  'co2emissions': 'g/km',
  'emissions': 'g/km',
  'dvlaco2': 'g/km',
  // Distance
  'mileage': 'miles',
  'distance': 'miles',
  // Dimensions
  'height': 'mm',
  'width': 'mm',
  'length': 'mm',
  'wheelbase': 'mm',
  'wheelbaselength': 'mm',
  'internalloadlength': 'mm',
  // Currency
  'price': '£',
  'cost': '£',
  'valuation': '£',
  'value': '£',
  'revenue': '£',
  'amount': '£',
  'tax': '£',
  'taxrate': '£',
  'taxamount': '£',
  'duty': '£',
  'annualtax': '£',
  'annualtaxcost': '£',
  'taxcost': '£',
  // Time
  'year': '',
  'date': '',
  // Percentage
  'rate': '%',
  'percentage': '%',
  'passrate': '%',
};

function getUnitForField(label: string, value: any, type?: string): string {
  const normalizedLabel = label.toLowerCase().replace(/[^a-z0-9]/g, '');
  const originalLabel = label.toLowerCase().trim();
  
  // Special handling for tax-related fields - check actual labels first
  // Tax rates appear as "Six Months", "Twelve Months" in VED Rate sections
  // These are always currency values when they appear in tax contexts
  // Also check if Type is "Decimal" which indicates currency for these fields
  if (originalLabel === 'six months' || originalLabel === 'twelve months' || 
      originalLabel.includes('six months') || originalLabel.includes('twelve months')) {
    // These are tax rate fields - always format as currency
    if (typeof value === 'string' && value.includes('£')) {
      return '';
    }
    // If it's a number, numeric string, or Decimal type, it's a tax rate
    // Also check if value is a valid number (including 0)
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    if (type === 'Decimal' || typeof value === 'number' || (!isNaN(numValue) && value !== '' && value !== null && value !== undefined)) {
      return '£';
    }
  }
  
  // Check for other tax-related patterns
  const taxPatterns = ['taxrate', 'annualtax', 'taxamount', 'tax', 'vedrate', 'rate'];
  for (const taxPattern of taxPatterns) {
    if (normalizedLabel.includes(taxPattern) || (normalizedLabel.includes('tax') && (normalizedLabel.includes('rate') || normalizedLabel.includes('annual')))) {
      if (typeof value === 'string' && value.includes('£')) {
        return '';
      }
      return '£';
    }
  }
  
  // Check for dimension fields - use actual labels
  // Dimensions are Integer type fields with labels like "Height", "Width", "Length", "Wheelbase Length"
  if (originalLabel === 'height' || originalLabel === 'width' || originalLabel === 'length' || 
      originalLabel === 'wheelbase length' || originalLabel === 'internal load length') {
    // These are dimension fields that should have mm units
    // Check if Type is Integer or if it's a numeric value
    if (typeof value === 'string' && value.toLowerCase().includes('mm')) {
      return '';
    }
    // If Type is Integer or value is a number, it's a dimension in mm
    if (type === 'Integer' || type === 'Int' || typeof value === 'number' || (typeof value === 'string' && !isNaN(parseInt(value)) && value !== '')) {
      return 'mm';
    }
  }
  
  // Check for exact matches in patterns
  for (const [pattern, unit] of Object.entries(UNIT_PATTERNS)) {
    if (normalizedLabel.includes(pattern)) {
      // Special handling for currency - check if value is already formatted
      if (unit === '£' && typeof value === 'string' && value.includes('£')) {
        return '';
      }
      return unit;
    }
  }
  
  return '';
}

export function formatValue(v: any, t?: string, label?: string): string {
  // Check for currency formatting FIRST (before converting to string)
  if (label) {
    const unit = getUnitForField(label, v, t);
    if (unit === '£') {
      // Format as currency - handle both number and string values
      const numValue = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''));
      if (!isNaN(numValue)) {
        return `£${numValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }
  }
  
  if (v === 0) {
    const unit = label ? getUnitForField(label, v, t) : '';
    if (unit === '£') {
      return '£0.00';
    }
    return `0${unit ? ' ' + unit : ''}`;
  }
  if (isEmpty(v)) return '—';
  if (t === 'Boolean') return v ? 'Yes' : 'No';
  if (t === 'DateTime') {
    try {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    } catch {}
  }
  
  const strValue = String(v);
  const unit = label ? getUnitForField(label, v, t) : '';
  
  // Don't add unit if value already contains it
  if (unit && !strValue.toLowerCase().includes(unit.toLowerCase())) {
    // Format currency values (double-check)
    if (unit === '£') {
      const numValue = typeof v === 'number' ? v : parseFloat(strValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(numValue)) {
        return `£${numValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }
    // Format numeric values with units (for dimensions, etc.)
    if (unit && unit !== '£' && !isNaN(parseFloat(strValue))) {
      return `${strValue} ${unit}`;
    }
  }
  
  return strValue;
}

// derive simple risk status from payload (tweak as you standardize flags)
export type Risk = 'pass' | 'warn' | 'fail' | 'na';

export function deriveRisk(payload: any, key: string): Risk {
  // examples — replace with your definitive rules later
  const data = payload?.Results || payload?.results || payload;
  switch (key) {
    case 'Finance': {
      const financeHits = data?.FinanceDetails?.length || 0;
      return financeHits > 0 ? 'fail' : 'pass';
    }
    case 'MIAFTR': {
      const writeOff = data?.MiaftrDetails?.some?.((x: any)=>x?.Category) || false;
      return writeOff ? 'fail' : 'pass';
    }
    case 'PNC': {
      const pnc = data?.PncDetails?.some?.((x:any)=>x?.Flagged) || false;
      return pnc ? 'warn' : 'pass';
    }
    case 'Mileage': {
      const nmr = data?.['Mileage Check Details'] || data?.MileageCheckDetails;
      const anomaly = Array.isArray(nmr) && nmr.some((x:any)=>x?.Anomaly);
      return anomaly ? 'warn' : 'pass';
    }
    default: return 'na';
  }
}

export function cx(...parts: Array<string|false|undefined|null>) {
  return parts.filter(Boolean).join(' ');
}