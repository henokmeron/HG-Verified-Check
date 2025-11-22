export interface UnifiedReportContext {
  registration: string;
  lookupId?: string;
  dateOfCheck: string;
  reference: string;
  userEmail?: string;
  reportType: string;
  isPremium: boolean;
}

export interface UnifiedReportData {
  context: UnifiedReportContext;
  vehicleData: any;
  reportRaw: any;
}

export interface BuildUnifiedReportDataParams {
  registration: string;
  lookupId?: string;
  vehicleData?: any;
  reportRaw?: any;
  userEmail?: string;
  createdAt?: Date | string;
  reference?: string;
  reportType?: string;
  isPremium?: boolean;
}

const resolveDate = (value?: Date | string): string => {
  if (!value) return new Date().toISOString();
  const parsed = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
};

export function buildUnifiedReportData(params: BuildUnifiedReportDataParams): UnifiedReportData {
  const {
    registration,
    lookupId,
    vehicleData = {},
    reportRaw = {},
    userEmail,
    createdAt,
    reference,
    reportType,
    isPremium
  } = params;

  const rawVehicleId = reportRaw?.Results?.VehicleDetails?.VehicleIdentification;
  const normalizedRegistration =
    (registration ||
      vehicleData?.registration ||
      vehicleData?.Registration ||
      rawVehicleId?.Vrm ||
      rawVehicleId?.RegistrationNumber ||
      reportRaw?.Vrm ||
      'UNKNOWN')
      .toString()
      .toUpperCase();

  const finalReference =
    reference ||
    reportRaw?.reportReference ||
    reportRaw?.Reference ||
    lookupId ||
    normalizedRegistration;

  const derivedReportType =
    reportType ||
    reportRaw?.reportType ||
    reportRaw?.report_type ||
    (isPremium ? 'full' : 'free');

  const finalIsPremium =
    typeof isPremium === 'boolean' ? isPremium : derivedReportType !== 'free';

  const finalVehicleData = {
    ...(vehicleData || {}),
    registration: (vehicleData?.registration || normalizedRegistration).toUpperCase()
  };

  return {
    context: {
      registration: normalizedRegistration,
      lookupId,
      dateOfCheck:
        reportRaw?.dateOfCheck ||
        reportRaw?.checkTimestamp ||
        resolveDate(createdAt),
      reference: finalReference,
      userEmail,
      reportType: derivedReportType,
      isPremium: finalIsPremium
    },
    vehicleData: finalVehicleData,
    reportRaw
  };
}
