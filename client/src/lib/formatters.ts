// Comprehensive data formatters for vehicle reports
import { format, parseISO, differenceInDays } from 'date-fns';

export const F = {
  // Boolean formatters
  yesNo: (v: unknown) => v === true ? "Yes" : v === false ? "No" : "Not available",
  
  // Null/undefined/placeholder handlers
  na: (v: unknown) => {
    if (v === null || v === undefined || v === "[Value]" || v === "null") {
      return "Not available";
    }
    // Don't treat empty string or 0 as "Not available"
    return String(v);
  },
  
  // Date formatters
  date: (v: string | null | undefined) => {
    if (!v || v === "[Value]" || v === "null") return "Not available";
    try {
      return format(parseISO(v), "dd MMM yyyy");
    } catch {
      return "Not available";
    }
  },
  
  dateLong: (v: string | null | undefined) => {
    if (!v || v === "[Value]" || v === "null") return "Not available";
    try {
      return format(parseISO(v), "EEEE, dd MMMM yyyy");
    } catch {
      return "Not available";
    }
  },
  
  // Number formatters
  int: (v: number | string | null | undefined) => {
    if (v === null || v === undefined || v === "[Value]") return "Not available";
    if (v === "") return "0"; // Treat empty string as 0 for numbers
    const num = Number(v);
    if (isNaN(num)) return "Not available";
    // Display 0 as "0", not "Not available"
    return num.toLocaleString("en-GB");
  },
  
  mileage: (v: number | string | null | undefined) => {
    if (v == null || v === "[Value]" || v === "") return "Not recorded";
    const num = Number(v);
    if (isNaN(num)) return "Not recorded";
    return `${num.toLocaleString("en-GB")} miles`;
  },
  
  // Vehicle specific formatters
  co2: (v: number | string | null | undefined) => {
    if (v === null || v === undefined || v === "[Value]") return "Not available";
    const num = Number(v);
    if (isNaN(num)) return "Not available";
    // Display 0 as "0 g/km" for zero-emission vehicles
    return `${num} g/km`;
  },
  
  engineSize: (v: number | string | null | undefined) => {
    if (v == null || v === "[Value]" || v === "") return "Not available";
    const num = Number(v);
    if (isNaN(num)) return "Not available";
    return `${num.toLocaleString("en-GB")}cc`;
  },
  
  power: (v: number | string | null | undefined, unit: string = "bhp") => {
    if (v == null || v === "[Value]" || v === "") return "Not available";
    const num = Number(v);
    if (isNaN(num)) return "Not available";
    return `${num} ${unit}`;
  },
  
  weight: (v: number | string | null | undefined) => {
    if (v == null || v === "[Value]" || v === "") return "Not available";
    const num = Number(v);
    if (isNaN(num)) return "Not available";
    return `${num.toLocaleString("en-GB")} kg`;
  },
  
  // Currency formatters - NEVER show £0.00 for null/undefined
  gbp: (v: number | string | null | undefined) => {
    if (v == null || v === "[Value]" || v === "" || v === "null" || v === undefined) return "—";
    // Handle values that already have £ symbol
    if (typeof v === "string") {
      // Remove £ symbol and any spaces if present
      const cleaned = v.replace(/[£\s]/g, '');
      const num = Number(cleaned);
      if (isNaN(num)) return "—";
      // Show £0.00 for actual zero values (free items)
      return `£${num.toFixed(2)}`;
    } else {
      const num = Number(v);
      if (isNaN(num)) return "—";
      // Show £0.00 for actual zero values (free items)
      return `£${num.toFixed(2)}`;
    }
  },
  
  // VED formatter - preserves £0.00 for zero-emission vehicles
  ved: (v: number | string | null | undefined) => {
    if (v == null || v === "[Value]" || v === "" || v === "null" || v === undefined) return "—";
    // Handle values that already have £ symbol
    if (typeof v === "string") {
      // Remove £ symbol and any spaces if present
      const cleaned = v.replace(/[£\s]/g, '');
      const num = Number(cleaned);
      if (isNaN(num)) return "—";
      // Preserve £0.00 for zero-emission vehicles (legitimate zero value)
      return `£${num.toFixed(2)}`;
    } else {
      const num = Number(v);
      if (isNaN(num)) return "—";
      // Preserve £0.00 for zero-emission vehicles (legitimate zero value)
      return `£${num.toFixed(2)}`;
    }
  },
  
  // Text formatters
  text: (v: unknown) => {
    if (v === null || v === undefined || v === "[Value]" || v === "null" || v === "undefined") return "—";
    // Don't treat empty string or "0" as missing
    const str = String(v).trim();
    return str === "" ? "—" : str;
  },
  
  upper: (v: unknown) => {
    if (!v || v === "[Value]" || v === "null") return "Not available";
    return String(v).toUpperCase().trim();
  },
  
  // MOT specific
  motResult: (v: unknown) => {
    const str = String(v || "").toUpperCase();
    if (str.includes("PASS")) return "PASS";
    if (str.includes("FAIL")) return "FAIL";
    if (str.includes("PRS")) return "PRS";
    return "Unknown";
  },
  
  motStatus: (dueDate: string | null | undefined) => {
    if (!dueDate || dueDate === "[Value]") return "Unknown";
    try {
      const days = differenceInDays(parseISO(dueDate), new Date());
      if (days < 0) return "EXPIRED";
      if (days === 0) return "DUE TODAY";
      if (days <= 30) return `DUE IN ${days} DAYS`;
      return "VALID";
    } catch {
      return "Unknown";
    }
  },
  
  // Percentage
  percentage: (v: number | string | null | undefined) => {
    if (v == null || v === "[Value]" || v === "") return "Not available";
    const num = Number(v);
    if (isNaN(num)) return "Not available";
    return `${num.toFixed(1)}%`;
  },
  
  // Days calculation
  daysSince: (dateStr: string | null | undefined) => {
    if (!dateStr || dateStr === "[Value]") return null;
    try {
      return differenceInDays(new Date(), parseISO(dateStr));
    } catch {
      return null;
    }
  },
  
  daysUntil: (dateStr: string | null | undefined) => {
    if (!dateStr || dateStr === "[Value]") return null;
    try {
      return differenceInDays(parseISO(dateStr), new Date());
    } catch {
      return null;
    }
  }
};

// Helper functions used in reports
export const isEmptyish = (v: any): boolean => {
  return v === null || v === undefined || v === 'N/A' || v === 'Not available' || v === '[Value]';
  // Don't treat empty string or 0 as "emptyish"
};

export const fmtVal = (v: any, fallback = '—'): string => {
  if (isEmptyish(v)) return fallback;
  if (typeof v === 'object') return fallback;
  // Show "0" for zero values, not the fallback
  const str = String(v);
  return str === '' ? fallback : str;
};

export const fmtGBP = (v: any): string => {
  return F.gbp(v);
};

export const formatCurrencyGBP = fmtGBP;

// Check if report is full/comprehensive (not free)
export const isFullReport = (data: any): boolean => {
  return data?.vehicleData?.isComprehensive === true || 
         data?.isComprehensive === true ||
         data?.packageType === 'full' ||
         data?.packageType === 'comprehensive';
};

// Premium field detection for gating
const PREMIUM_FIELDS = [
  'mileage', 'keeper', 'v5c', 'vin', 'export', 'import', 'scrapped',
  'plateChanges', 'stolen', 'finance', 'writeOff', 'condition'
];

export const isPremiumField = (fieldName: string): boolean => {
  return PREMIUM_FIELDS.some(field => 
    fieldName.toLowerCase().includes(field.toLowerCase())
  );
};

// Main format value function with premium gating
export const formatValue = (value: any, fieldName = '', reportData?: any): string => {
  // Gate premium fields for free reports  
  if (fieldName && reportData && !isFullReport(reportData) && isPremiumField(fieldName)) {
    return 'Upgrade for access';
  }
  
  // Use appropriate formatter based on field type
  if (fieldName.toLowerCase().includes('date')) {
    return F.date(value);
  }
  
  if (fieldName.toLowerCase().includes('price') || 
      fieldName.toLowerCase().includes('cost') ||
      fieldName.toLowerCase().includes('value')) {
    return fmtGBP(value);
  }
  
  return fmtVal(value);
};

// Format dates in UK format (DD/MM/YYYY)  
export const formatDate = (dateStr: any): string => {
  if (isEmptyish(dateStr)) return '—';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    
    // Format as DD/MM/YYYY
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
};

// Format dates with month name (21 May 2018)  
export const formatDateLong = (dateStr: any): string => {
  if (isEmptyish(dateStr)) return '—';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
};

// Strip all placeholder values from an object
export function stripPlaceholders(obj: any): any {
  if (obj === "[Value]" || obj === "null" || obj === "undefined") return null;
  
  if (Array.isArray(obj)) {
    return obj.map(item => stripPlaceholders(item));
  }
  
  if (obj && typeof obj === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = stripPlaceholders(value);
    }
    return cleaned;
  }
  
  return obj;
}