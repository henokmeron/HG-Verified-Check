export type HideStrategy = 'hide' | 'blur';
export type ReportMode = 'full' | 'free';

export interface PackageDocsMap {
  // key names should match your "Data Documents" names in your package UI
  // e.g. "Miaftr Details", "Finance Details", "Pnc Details", etc.
  [documentName: string]: boolean; // true if included in this package
}

export interface SchemaNode {
  Name: string;
  Label?: string;
  Description?: string;
  Type: 'String'|'Integer'|'Long'|'Decimal'|'Boolean'|'DateTime'|'Object';
  IsList: boolean;
  IsNullable: boolean;
  ObjectName?: string;
  ObjectProperties?: SchemaNode[];
  PossibleValues?: string[];
  EnumIntegers?: number[];
}

export interface VidicheckSchema {
  RequestInformation: SchemaNode[];
  ResponseInformation: SchemaNode[];
  BillingInformation: SchemaNode[];
  Results: {
    [blockName: string]: SchemaNode[]; // e.g. VehicleDetails, ModelDetails, etc.
  };
}

export interface VehicleReportProps {
  schema: VidicheckSchema;
  payload: any; // actual API result
  mode: ReportMode;           // 'full' | 'free'
  hideStrategy: HideStrategy; // 'hide' | 'blur'
  packageDocs: PackageDocsMap;
  brand?: { name?: string; logoUrl?: string; primary?: string; accent?: string };
  dateOfCheck?: Date | string; // Date when the check was performed
  reference?: string; // Unique reference code for this report
  registration?: string; // Vehicle registration number
}