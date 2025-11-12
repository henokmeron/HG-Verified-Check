import { format } from "date-fns";

/**
 * Native implementation of lodash.get
 */
function get(object: any, path: string, defaultValue?: any): any {
  const keys = path.split('.');
  let result = object;
  
  for (const key of keys) {
    if (result == null) {
      return defaultValue;
    }
    // Handle array indices
    const match = key.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      result = result[match[1]];
      if (result == null) {
        return defaultValue;
      }
      result = result[parseInt(match[2])];
    } else {
      result = result[key];
    }
  }
  
  return result === undefined ? defaultValue : result;
}

/**
 * Safe getter that returns "—" for missing values
 */
export function safeGet(data: any, path: string, defaultValue = "—"): string {
  const value = get(data, path, undefined);
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }
  return String(value);
}

/**
 * Format dates consistently
 */
export function formatDate(value: any): string {
  if (!value) return "—";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "—";
    return format(date, "dd/MM/yyyy");
  } catch {
    return "—";
  }
}

/**
 * Format currency values
 */
export function formatCurrency(value: any): string {
  if (value === null || value === undefined || value === "") return "—";
  try {
    const num = parseFloat(value);
    if (isNaN(num)) return "—";
    return `£${num.toFixed(2)}`;
  } catch {
    return "—";
  }
}

/**
 * Format boolean values
 */
export function formatBoolean(value: any): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "—";
}

/**
 * Format numbers with units
 */
export function formatWithUnit(value: any, unit: string): string {
  if (value === null || value === undefined || value === "") return "—";
  return `${value} ${unit}`;
}

/**
 * Format percentage values
 */
export function formatPercentage(value: any): string {
  if (value === null || value === undefined || value === "") return "—";
  return `${value}%`;
}

/**
 * Process a list/table field
 */
export function processList(data: any, listPath: string): any[] {
  const list = get(data, listPath, undefined);
  if (!Array.isArray(list) || list.length === 0) {
    return [];
  }
  return list;
}

/**
 * Extract and format field value based on field configuration
 */
export function extractFieldValue(data: any, field: any): string {
  if (field.transform) {
    try {
      return field.transform(data) || "—";
    } catch {
      return "—";
    }
  }
  if (field.path) {
    return safeGet(data, field.path);
  }
  return "—";
}

/**
 * Process table data for rendering
 */
export function processTableData(data: any, field: any): any {
  if (!field.listPath || !field.columns) {
    return null;
  }
  
  const rows = processList(data, field.listPath);
  if (rows.length === 0) {
    return null;
  }
  
  return {
    headers: field.columns.map((col: any) => col.label),
    rows: rows.map((row: any) => {
      return field.columns.map((col: any) => {
        if (col.transform) {
          try {
            return col.transform(row, data) || "—";
          } catch {
            return "—";
          }
        }
        if (col.path) {
          return safeGet(row, col.path);
        }
        return "—";
      });
    })
  };
}

/**
 * Sanitize text for safe HTML rendering
 */
export function sanitizeText(text: string): string {
  if (!text) return "—";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Get status badge color based on value
 */
export function getStatusColor(status: string): string {
  const lowerStatus = (status || "").toLowerCase();
  if (lowerStatus === "valid" || lowerStatus === "pass" || lowerStatus === "yes") {
    return "success";
  }
  if (lowerStatus === "invalid" || lowerStatus === "fail" || lowerStatus === "no") {
    return "danger";
  }
  if (lowerStatus === "warning" || lowerStatus === "advisory") {
    return "warning";
  }
  return "default";
}

/**
 * Format mileage with thousand separators
 */
export function formatMileage(value: any): string {
  if (value === null || value === undefined || value === "") return "—";
  try {
    const num = parseInt(value);
    if (isNaN(num)) return "—";
    return num.toLocaleString() + " miles";
  } catch {
    return "—";
  }
}