/**
 * Formatting helpers for consistent data presentation
 */

export const nil = (v: any) => v === undefined || v === null || v === "" || v === "null" || v === "NULL";

export const fmt = {
  text: (v: any) => nil(v) ? "—" : String(v).trim(),
  
  date: (v: any) => {
    if (nil(v)) return "—";
    try {
      const date = new Date(v);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return "—";
    }
  },
  
  datetime: (v: any) => {
    if (nil(v)) return "—";
    try {
      const date = new Date(v);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleString("en-GB", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "—";
    }
  },
  
  boolean: (v: any) => {
    if (v === true || v === "true" || v === "True" || v === 1 || v === "1") return "Yes";
    if (v === false || v === "false" || v === "False" || v === 0 || v === "0") return "No";
    return "—";
  },
  
  currency: (v: any) => {
    if (nil(v)) return "—";
    try {
      const num = parseFloat(v);
      if (isNaN(num)) return "—";
      return `£${num.toFixed(2)}`;
    } catch {
      return "—";
    }
  },
  
  co2: (v: any) => nil(v) ? "—" : `${v} g/km`,
  
  cc: (v: any) => nil(v) ? "—" : `${v} cc`,
  
  litres: (v: any) => nil(v) ? "—" : `${v} L`,
  
  mm: (v: any) => nil(v) ? "—" : `${v} mm`,
  
  weight: (v: any) => nil(v) ? "—" : `${v} kg`,
  
  volume: (v: any) => nil(v) ? "—" : `${v} m³`,
  
  power: (v: any) => nil(v) ? "—" : `${v} kW`,
  
  bhp: (v: any) => nil(v) ? "—" : `${v} BHP`,
  
  ps: (v: any) => nil(v) ? "—" : `${v} PS`,
  
  kw: (v: any) => nil(v) ? "—" : `${v} kW`,
  
  nm: (v: any) => nil(v) ? "—" : `${v} Nm`,
  
  lbft: (v: any) => nil(v) ? "—" : `${v} lb-ft`,
  
  rpm: (v: any) => nil(v) ? "—" : `${v} RPM`,
  
  mph: (v: any) => nil(v) ? "—" : `${v} mph`,
  
  kph: (v: any) => nil(v) ? "—" : `${v} km/h`,
  
  seconds: (v: any) => nil(v) ? "—" : `${v} s`,
  
  mpg: (v: any) => nil(v) ? "—" : `${v} mpg`,
  
  l100km: (v: any) => nil(v) ? "—" : `${v} L/100km`,
  
  db: (v: any) => nil(v) ? "—" : `${v} dB`,
  
  percent: (v: any) => nil(v) ? "—" : `${v}%`,
  
  mileage: (v: any) => {
    if (nil(v)) return "—";
    try {
      const num = parseInt(v);
      if (isNaN(num)) return "—";
      return num.toLocaleString("en-GB") + " miles";
    } catch {
      return "—";
    }
  }
};

/**
 * Get nested value from object using dot notation
 */
export function getValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null) return undefined;
    
    // Handle array indices
    const match = key.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      result = result[match[1]];
      if (result == null) return undefined;
      result = result[parseInt(match[2])];
    } else {
      result = result[key];
    }
  }
  
  return result;
}

/**
 * Format value based on type
 */
export function formatValue(value: any, type?: string): string {
  if (!type) return fmt.text(value);
  
  switch (type) {
    case 'date': return fmt.date(value);
    case 'datetime': return fmt.datetime(value);
    case 'boolean': return fmt.boolean(value);
    case 'currency': return fmt.currency(value);
    case 'co2': return fmt.co2(value);
    case 'cc': return fmt.cc(value);
    case 'litres': return fmt.litres(value);
    case 'mm': return fmt.mm(value);
    case 'weight': return fmt.weight(value);
    case 'volume': return fmt.volume(value);
    case 'power': return fmt.power(value);
    case 'bhp': return fmt.bhp(value);
    case 'ps': return fmt.ps(value);
    case 'kw': return fmt.kw(value);
    case 'nm': return fmt.nm(value);
    case 'lbft': return fmt.lbft(value);
    case 'rpm': return fmt.rpm(value);
    case 'mph': return fmt.mph(value);
    case 'kph': return fmt.kph(value);
    case 'seconds': return fmt.seconds(value);
    case 'mpg': return fmt.mpg(value);
    case 'l100km': return fmt.l100km(value);
    case 'db': return fmt.db(value);
    case 'percent': return fmt.percent(value);
    case 'mileage': return fmt.mileage(value);
    default: return fmt.text(value);
  }
}