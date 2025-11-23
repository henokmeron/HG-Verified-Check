import React from 'react';
import { formatValue } from './formatters';

// Critical fields that need color coding - matches actual API field names
const CRITICAL_FIELDS: Record<string, { pass: string[]; fail: string[]; warn?: string[] }> = {
  // Stolen checks - actual field names from API
  'Stolen': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—', 'not stolen'], 
    fail: ['yes', 'true', '1', 'stolen', 'flagged'],
    warn: ['unknown', 'unclear']
  },
  'Stolen Status': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—', 'not stolen'], 
    fail: ['yes', 'true', '1', 'stolen', 'flagged'],
    warn: ['unknown', 'unclear']
  },
  'Is Stolen': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—', 'not stolen'], 
    fail: ['yes', 'true', '1', 'stolen', 'flagged'],
    warn: ['unknown', 'unclear']
  },
  'PNC Status': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—', 'not stolen'], 
    fail: ['yes', 'true', '1', 'stolen', 'flagged'],
    warn: ['unknown', 'unclear']
  },
  'Flagged': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—'], 
    fail: ['yes', 'true', '1', 'flagged'],
    warn: ['unknown']
  },
  // Imported checks - actual field names
  'Imported': { 
    pass: ['no', 'false', '0', 'uk', 'domestic', '—'], 
    fail: ['yes', 'true', '1', 'imported'],
    warn: ['unknown']
  },
  'Is Imported': { 
    pass: ['no', 'false', '0', 'uk', 'domestic', '—'], 
    fail: ['yes', 'true', '1', 'imported'],
    warn: ['unknown']
  },
  'Is Imported From NI': { 
    pass: ['no', 'false', '0', 'uk', 'domestic', '—'], 
    fail: ['yes', 'true', '1', 'imported'],
    warn: ['unknown']
  },
  'Is Imported From Non EU': { 
    pass: ['no', 'false', '0', 'uk', 'domestic', '—'], 
    fail: ['yes', 'true', '1', 'imported'],
    warn: ['unknown']
  },
  'Is Exported': { 
    pass: ['no', 'false', '0', 'uk', 'domestic', '—'], 
    fail: ['yes', 'true', '1', 'exported'],
    warn: ['unknown']
  },
  'Is Scrapped': { 
    pass: ['no', 'false', '0', 'uk', 'domestic', '—'], 
    fail: ['yes', 'true', '1', 'scrapped'],
    warn: ['unknown']
  },
  'Certificate of Destruction Issued': { 
    pass: ['no', 'false', '0', 'uk', 'domestic', '—'], 
    fail: ['yes', 'true', '1', 'issued'],
    warn: ['unknown']
  },
  'Import Status': { 
    pass: ['no', 'false', '0', 'uk', 'domestic', '—'], 
    fail: ['yes', 'true', '1', 'imported'],
    warn: ['unknown']
  },
  // Finance checks - actual field names
  'Finance': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—', 'no outstanding'], 
    fail: ['yes', 'true', '1', 'outstanding', 'active', 'exists'],
    warn: ['unknown', 'unclear']
  },
  'Outstanding Finance': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—', 'no outstanding'], 
    fail: ['yes', 'true', '1', 'outstanding', 'active', 'exists'],
    warn: ['unknown', 'unclear']
  },
  'Finance Outstanding': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—', 'no outstanding'], 
    fail: ['yes', 'true', '1', 'outstanding', 'active', 'exists'],
    warn: ['unknown', 'unclear']
  },
  'Finance Status': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—', 'no outstanding'], 
    fail: ['yes', 'true', '1', 'outstanding', 'active', 'exists'],
    warn: ['unknown', 'unclear']
  },
  'Records Found': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—'], 
    fail: ['yes', 'true', '1'],
    warn: ['unknown']
  },
  // Write-off checks - actual field names
  'Write-off': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—'], 
    fail: ['yes', 'true', '1', 'written off', 'write-off', 'total loss'],
    warn: ['unknown']
  },
  'Write Off': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—'], 
    fail: ['yes', 'true', '1', 'written off', 'write-off', 'total loss'],
    warn: ['unknown']
  },
  'Insurance Write-off': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—'], 
    fail: ['yes', 'true', '1', 'written off', 'write-off', 'total loss'],
    warn: ['unknown']
  },
  'Insurance Write Off': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—'], 
    fail: ['yes', 'true', '1', 'written off', 'write-off', 'total loss'],
    warn: ['unknown']
  },
  'MIAFTR Status': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—'], 
    fail: ['yes', 'true', '1', 'written off', 'write-off', 'total loss'],
    warn: ['unknown']
  },
  'Write Off Category': { 
    pass: ['none', 'clear', 'n/a', '—'], 
    fail: ['a', 'b', 'c', 'd', 'n', 's', 'total loss', 'written off'],
    warn: ['unknown']
  },
  // Mileage checks
  'Mileage Anomaly': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—', 'no anomaly'], 
    fail: ['yes', 'true', '1', 'anomaly', 'suspicious'],
    warn: ['possible', 'unclear']
  },
  'Mileage Status': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—', 'no anomaly'], 
    fail: ['yes', 'true', '1', 'anomaly', 'suspicious'],
    warn: ['possible', 'unclear']
  },
  'Anomaly': { 
    pass: ['no', 'false', '0', 'clear', 'none', 'n/a', '—', 'no anomaly'], 
    fail: ['yes', 'true', '1', 'anomaly', 'suspicious'],
    warn: ['possible', 'unclear']
  },
};

function getRiskClass(label: string, value: any): 'pass' | 'fail' | 'warn' | null {
  const normalizedLabel = label.trim();
  const normalizedValue = typeof value === 'string' ? value.toLowerCase().trim() : String(value).toLowerCase().trim();
  
  // Handle empty/null values
  if (!normalizedValue || normalizedValue === '—' || normalizedValue === 'n/a') {
    return null;
  }
  
  // Check if this is a critical field (case-insensitive match)
  const fieldConfig = CRITICAL_FIELDS[normalizedLabel] || 
                     Object.entries(CRITICAL_FIELDS).find(([key]) => 
                       normalizedLabel.toLowerCase().includes(key.toLowerCase()) || 
                       key.toLowerCase().includes(normalizedLabel.toLowerCase())
                     )?.[1];
  
  if (!fieldConfig) return null;
  
  // Check for pass values
  if (fieldConfig.pass.some(p => normalizedValue === p || normalizedValue.includes(p))) {
    return 'pass';
  }
  
  // Check for fail values
  if (fieldConfig.fail.some(f => normalizedValue === f || normalizedValue.includes(f))) {
    return 'fail';
  }
  
  // Check for warn values
  if (fieldConfig.warn && fieldConfig.warn.some(w => normalizedValue === w || normalizedValue.includes(w))) {
    return 'warn';
  }
  
  return null;
}

interface KeyValueProps {
  label: string;
  value: any;
  type?: string;
  fieldPath?: string;
}

export const KeyValue: React.FC<KeyValueProps> = ({label, value, type, fieldPath}) => {
  const riskClass = getRiskClass(label, value);
  const className = riskClass ? `kv kv--${riskClass}` : 'kv';
  const formattedValue = formatValue(value, type, label, fieldPath);
  
  return (
    <div className={className}>
      <div className="kv__k">{label}:</div>
      <div className="kv__v">{formattedValue}</div>
    </div>
  );
};