/**
 * Single source of truth for fields that should be hidden from reports
 * This applies to both website and PDF reports
 */
export const HIDDEN_FIELDS = [
  'PackageName',
  'ResponseId',
  'StatusCode',
  'StatusMessage',
  'DocumentVersion'
] as const;

/**
 * Check if a field name should be hidden
 */
export function isFieldHidden(fieldName: string): boolean {
  return HIDDEN_FIELDS.includes(fieldName as any);
}

