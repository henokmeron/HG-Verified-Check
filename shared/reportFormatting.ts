import { getFieldConfig, type FieldConfig, type UnitType } from './reportConfig';

const UNIT_SUFFIX: Record<UnitType, string> = {
  mm: 'mm',
  kg: 'kg',
  mph: 'mph',
  kph: 'kph',
  bhp: 'bhp',
  ps: 'PS',
  kw: 'kW',
  nm: 'Nm',
  lbft: 'lb ft',
  mpg: 'mpg',
  lPer100km: 'L/100km',
  gPerKm: 'g/km',
  miles: 'miles',
  cc: 'cc',
  litres: 'litres',
  seconds: 's',
  db: 'dB',
  rpm: 'rpm',
  days: 'days'
};

const EMPTY_VALUE = '—';

const isFiniteNumber = (value: any): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const coerceNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (isFiniteNumber(value)) return value;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

export const formatDateValue = (value: any): string => {
  if (!value) return EMPTY_VALUE;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return EMPTY_VALUE;
    return date.toLocaleDateString('en-GB');
  } catch {
    return EMPTY_VALUE;
  }
};

export const formatCurrencyValue = (value: any): string => {
  const numeric = coerceNumber(value);
  if (numeric === null) return EMPTY_VALUE;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numeric);
};

const appendUnit = (value: string | number, unit?: UnitType): string => {
  if (!unit) return String(value);
  const suffix = UNIT_SUFFIX[unit];
  return `${value} ${suffix}`.trim();
};

const formatWithUnit = (value: any, unit?: UnitType): string => {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE;
  if (!unit) return String(value);
  const numeric = coerceNumber(value);
  if (numeric === null) return `${value} ${UNIT_SUFFIX[unit]}`.trim();
  const formatted =
    unit === 'mpg' || unit === 'lPer100km' || unit === 'litres'
      ? numeric.toFixed(1)
      : unit === 'seconds'
      ? numeric.toFixed(1)
      : numeric.toLocaleString('en-GB');
  return appendUnit(formatted, unit);
};

const applyFormatter = (value: any, config?: FieldConfig): string => {
  if (!config) return String(value);
  switch (config.formatter) {
    case 'date':
    case 'datetime':
      return formatDateValue(value);
    case 'currency':
      return formatCurrencyValue(value);
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'uppercase':
      return typeof value === 'string' ? value.toUpperCase() : String(value);
    default:
      return String(value);
  }
};

export const formatReportValue = (value: any, fieldPath?: string, fallbackLabel?: string): string => {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE;

  const config = fieldPath ? getFieldConfig(fieldPath) : undefined;
  if (config?.hidden) return EMPTY_VALUE;

  // Formatter takes precedence
  if (config?.formatter) {
    const formatted = applyFormatter(value, config);
    if (config.unit && formatted !== EMPTY_VALUE) {
      return appendUnit(formatted, config.unit);
    }
    return formatted;
  }

  if (config?.unit) {
    return formatWithUnit(value, config.unit);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (value instanceof Date) {
    return formatDateValue(value);
  }

  if (fallbackLabel && fallbackLabel.toLowerCase().includes('date')) {
    return formatDateValue(value);
  }

  return String(value);
};

