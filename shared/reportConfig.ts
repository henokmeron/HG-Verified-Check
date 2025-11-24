export type UnitType =
  | 'mm'
  | 'kg'
  | 'mph'
  | 'kph'
  | 'bhp'
  | 'ps'
  | 'kw'
  | 'nm'
  | 'lbft'
  | 'mpg'
  | 'lPer100km'
  | 'gPerKm'
  | 'miles'
  | 'cc'
  | 'litres'
  | 'seconds'
  | 'db'
  | 'rpm'
  | 'days';

export type FieldFormatter =
  | 'date'
  | 'datetime'
  | 'currency'
  | 'boolean'
  | 'uppercase';

export interface FieldConfig {
  label?: string;
  unit?: UnitType;
  formatter?: FieldFormatter;
  hidden?: boolean;
}

type FieldConfigMap = Record<string, FieldConfig>;

export const FIELD_CONFIG: FieldConfigMap = {
  // Vehicle identification
  'VehicleDetails.VehicleIdentification.Vrm': { label: 'VRM', formatter: 'uppercase' },
  'VehicleDetails.VehicleIdentification.Vin': { label: 'VIN', formatter: 'uppercase' },
  'VehicleDetails.VehicleIdentification.VinLast5': { label: 'VIN Last 5', formatter: 'uppercase' },
  'VehicleDetails.VehicleIdentification.DateFirstRegisteredInUk': { formatter: 'date' },
  'VehicleDetails.VehicleIdentification.DateFirstRegistered': { formatter: 'date' },
  'VehicleDetails.VehicleIdentification.DateOfManufacture': { formatter: 'date' },
  // Vehicle status / VED
  'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.DvlaCo2': { unit: 'gPerKm' },
  'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.VedRate.Standard.SixMonths': { formatter: 'currency' },
  'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.VedRate.Standard.TwelveMonths': { formatter: 'currency' },
  'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.VedRate.FirstYear.SixMonths': { formatter: 'currency' },
  'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.VedRate.FirstYear.TwelveMonths': { formatter: 'currency' },
  'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.VedRate.PremiumVehicle.SixMonths': { formatter: 'currency' },
  'VehicleDetails.VehicleStatus.VehicleExciseDutyDetails.VedRate.PremiumVehicle.TwelveMonths': { formatter: 'currency' },
  'VehicleDetails.VehicleStatus.DateImported': { formatter: 'date' },
  'VehicleDetails.VehicleStatus.DateExported': { formatter: 'date' },
  'VehicleDetails.VehicleStatus.DateScrapped': { formatter: 'date' },
  // Vehicle tax details
  'VehicleTaxDetails.Co2Emissions': { unit: 'gPerKm' },
  'VehicleTaxDetails.TaxDueDate': { formatter: 'date' },
  'VehicleTaxDetails.TaxDaysRemaining': { unit: 'days' },
  'VehicleTaxDetails.Standard.SixMonths': { formatter: 'currency' },
  'VehicleTaxDetails.Standard.TwelveMonths': { formatter: 'currency' },
  'VehicleTaxDetails.FirstYear.SixMonths': { formatter: 'currency' },
  'VehicleTaxDetails.FirstYear.TwelveMonths': { formatter: 'currency' },
  // DVLA Technical Details
  'VehicleDetails.DvlaTechnicalDetails.EngineCapacity': { unit: 'cc' },
  'VehicleDetails.DvlaTechnicalDetails.EngineCapacityCc': { unit: 'cc' },
  'VehicleDetails.DvlaTechnicalDetails.MaxNetPower': { unit: 'kw' },
  'VehicleDetails.DvlaTechnicalDetails.MaxNetPowerKw': { unit: 'kw' },
  'VehicleDetails.DvlaTechnicalDetails.MassInService': { unit: 'kg' },
  'VehicleDetails.DvlaTechnicalDetails.MassInServiceKg': { unit: 'kg' },
  'VehicleDetails.DvlaTechnicalDetails.MaxPermissibleBrakedTrailerMass': { unit: 'kg' },
  'VehicleDetails.DvlaTechnicalDetails.MaxPermissibleBrakedTrailerMassKg': { unit: 'kg' },
  'VehicleDetails.DvlaTechnicalDetails.MaxPermissibleUnbrakedTrailerMass': { unit: 'kg' },
  'VehicleDetails.DvlaTechnicalDetails.MaxPermissibleUnbrakedTrailerMassKg': { unit: 'kg' },
  // Model dimensions
  'ModelDetails.Dimensions.HeightMm': { unit: 'mm' },
  'ModelDetails.Dimensions.LengthMm': { unit: 'mm' },
  'ModelDetails.Dimensions.WidthMm': { unit: 'mm' },
  'ModelDetails.Dimensions.WheelbaseLengthMm': { unit: 'mm' },
  // Model weights
  'ModelDetails.Weights.KerbWeightKg': { unit: 'kg' },
  'ModelDetails.Weights.GrossVehicleWeightKg': { unit: 'kg' },
  'ModelDetails.Weights.GrossCombinedWeightKg': { unit: 'kg' },
  // Powertrain
  'ModelDetails.Powertrain.EngineCapacityCc': { unit: 'cc' },
  'ModelDetails.Powertrain.EngineCapacityLitres': { unit: 'litres' },
  'ModelDetails.Powertrain.Transmission.NumberOfGears': {},
  // Performance - torque
  'ModelDetails.Performance.Torque.Nm': { unit: 'nm' },
  'ModelDetails.Performance.Torque.LbFt': { unit: 'lbft' },
  // Performance - power
  'ModelDetails.Performance.Power.Bhp': { unit: 'bhp' },
  'ModelDetails.Performance.Power.Ps': { unit: 'ps' },
  'ModelDetails.Performance.Power.Kw': { unit: 'kw' },
  'ModelDetails.Performance.Power.Rpm': { unit: 'rpm' },
  // Performance - statistics
  'ModelDetails.Performance.Statistics.ZeroToSixtyMph': { unit: 'seconds' },
  'ModelDetails.Performance.Statistics.MaxSpeedKph': { unit: 'kph' },
  'ModelDetails.Performance.Statistics.MaxSpeedMph': { unit: 'mph' },
  // Performance - sound
  'ModelDetails.Emissions.SoundLevels.StationaryDb': { unit: 'db' },
  'ModelDetails.Emissions.SoundLevels.EngineSpeedRpm': { unit: 'rpm' },
  'ModelDetails.Emissions.SoundLevels.DriveByDb': { unit: 'db' },
  // Fuel economy
  'ModelDetails.Performance.FuelEconomy.UrbanMpg': { unit: 'mpg' },
  'ModelDetails.Performance.FuelEconomy.ExtraUrbanMpg': { unit: 'mpg' },
  'ModelDetails.Performance.FuelEconomy.CombinedMpg': { unit: 'mpg' },
  'ModelDetails.Performance.FuelEconomy.UrbanLPer100Km': { unit: 'lPer100km' },
  'ModelDetails.Performance.FuelEconomy.ExtraUrbanLPer100Km': { unit: 'lPer100km' },
  'ModelDetails.Performance.FuelEconomy.CombinedLPer100Km': { unit: 'lPer100km' },
  // Emissions
  'ModelDetails.Emissions.ManufacturerCo2': { unit: 'gPerKm' },
  'ModelDetails.Emissions.DvlaCo2': { unit: 'gPerKm' },
  // Misc hidden/internal metadata
  'ModelDetails.StatusCode': { hidden: true },
  'ModelDetails.StatusMessage': { hidden: true },
  'ModelDetails.DocumentVersion': { hidden: true },
  'ModelDetails.GeneratedAt': { hidden: true },
  'VehicleDetails.UkvdId': { hidden: true },
  'VehicleDetails.StatusCode': { hidden: true },
  'VehicleDetails.StatusMessage': { hidden: true },
  'VehicleDetails.DocumentVersion': { hidden: true },
  'VehicleDetails.GeneratedAt': { hidden: true },
  'VehicleTaxDetails.StatusCode': { hidden: true },
  'VehicleTaxDetails.StatusMessage': { hidden: true },
  'VehicleTaxDetails.DocumentVersion': { hidden: true },
  'VehicleTaxDetails.GeneratedAt': { hidden: true }
};

export function getFieldConfig(path: string): FieldConfig | undefined {
  return FIELD_CONFIG[path];
}

export const HIDDEN_FIELD_NAMES = [
  'PackageName',
  'ResponseId',
  'StatusCode',
  'StatusMessage',
  'DocumentVersion',
  'GeneratedAt',
  'UkvdId',
  'UpdateTimeStamp',
  'RequestInformation',
  'ResponseInformation',
  'SubscriptionOptionList',
  'Software',
  'AdditionalInformation',
  'DocumentVersionDescription'
] as const;

const HIDDEN_PATHS = new Set<string>(
  Object.entries(FIELD_CONFIG)
    .filter(([, config]) => config.hidden)
    .map(([path]) => path)
);

export function isFieldHidden(fieldOrPath: string): boolean {
  const path = fieldOrPath || '';
  if (HIDDEN_PATHS.has(path)) {
    return true;
  }
  const name = path.split('.').pop() ?? fieldOrPath;
  return HIDDEN_FIELD_NAMES.includes(name as any);
}

