// Comprehensive report normalization
import { F, stripPlaceholders } from './formatters';

// Used-cars CO2 thresholds (g/km)
const CO2_USED_THRESHOLDS: Array<{max:number|typeof Infinity; band:string}> = [
  { max: 100, band: "A" },
  { max: 110, band: "B" },
  { max: 120, band: "C" },
  { max: 130, band: "D" },
  { max: 140, band: "E" },
  { max: 150, band: "F" },
  { max: 165, band: "G" },
  { max: 175, band: "H" },
  { max: 185, band: "I" },
  { max: 200, band: "J" },
  { max: 225, band: "K" },
  { max: 255, band: "L" },
  { max: Infinity, band: "M" },
];

function co2ToBandUsedCars(v: number | undefined | null): string | undefined {
  if (v == null || isNaN(Number(v))) return undefined;
  const n = Number(v);
  return CO2_USED_THRESHOLDS.find(t => n <= t.max)?.band;
}

export interface NormalizedMOTRecord {
  testDate: string;
  result: string;
  mileage: string;
  expiryDate: string;
  testNumber: string;
  station: string;
  stationTown: string;
  retest: string;
  defects: Array<{
    type: string;
    text: string;
    dangerous: boolean;
  }>;
  advisories: Array<{
    text: string;
  }>;
}

export interface NormalizedReport {
  isComprehensive: boolean;
  packageType: string;
  // CO2 and fuel economy fields
  co2?: number;               // g/km
  fuelBand?: string;          // A–M (used cars scale)
  v5cList?: Array<{
    documentRef?: string;
    issuedOn?: string;
    previousKeeperCount?: number;
    notes?: string;
  }>;
  // Additional write-off records
  writeOffRecords?: Array<{
    category: string;
    date: string;
    lossType: string;
    miaftrReference?: string;
    miafidDate?: string;
  }>;
  vehicleIdentification: {
    registration: string;
    vin: string;
    vinLast5: string;
    engineNumber: string;
    make: string;
    model: string;
    colour: string;
    bodyType: string;
    fuelType: string;
    wheelPlan: string;
    yearOfManufacture: string;
    dateFirstRegistered: string;
    dateFirstRegisteredUK: string;
    dateOfManufacture: string;
    vehicleUsedBeforeFirstReg: string;
    previousVrmNI: string;
    // Additional fields from comprehensive data
    dvlaMake?: string;
    dvlaModel?: string;
    engineSize?: string;
    engineCC?: string;
    co2Emissions?: string;
    euroStatus?: string;
    doors?: string;
    numberOfDoors?: string;
    transmission?: string;
    driveType?: string;
    revenueWeight?: string;
    taxExpiry?: string;
    taxStatus?: string;
    taxBand?: string;
    motExpiry?: string;
    motResult?: string;
    // FullcheckAPI specific fields
    isImported?: string;
    isExported?: string;
    isScrapped?: string;
    sornStatus?: string;
  };
  vehicleStatus: {
    certOfDestruction: string;
    isImported: string;
    isImportedNI: string;
    isImportedNonEU: string;
    dateImported: string;
    isExported: string;
    dateExported: string;
    isScrapped: string;
    dateScrapped: string;
    cherishedMarker: string;
    isUnscrapped: string;
  };
  vehicleExciseDuty: {
    co2: string;
    band: string;
    co2Band: string;
    firstYear6Months: string;
    firstYear12Months: string;
    standard6Months: string;
    standard12Months: string;
    premium6Months: string;
    premium12Months: string;
  };
  vehicleHistory: {
    currentColour: string;
    originalColour: string;
    previousColour: string;
    numberOfColourChanges: string;
    latestColourChangeDate: string;
    numberOfPreviousKeepers: string;
    keeperStartDate: string;
    previousKeeperDisposalDate: string;
    v5cIssueDate: string;
  };
  technicalDetails: {
    numberOfSeats: string;
    engineCapacity: string;
    grossWeight: string;
    maxNetPower: string;
    massInService: string;
    powerToWeightRatio: string;
    maxBrakedTrailerMass: string;
    maxUnbrakedTrailerMass: string;
    // Additional technical fields
    numberOfAxles?: string;
    grossCombinedWeight?: string;
    grossTrainWeight?: string;
    payloadWeight?: string;
    kerbWeight?: string;
    unladenWeight?: string;
  };
  motSummary: {
    status: string;
    dueDate: string;
    latestTestDate: string;
    daysToDue: number | null;
    daysSinceLast: number | null;
    passRate: string;
    totalTests: number;
    totalPasses: number;
    totalFails: number;
    avgMileagePerYear: string;
  };
  motRecords: NormalizedMOTRecord[];
  mileageHistory: Array<{
    date: string;
    mileage: string;
    delta: string;
  }>;
  miaftr: {
    recordsFound: string;
    writeOffCategory: string;
    writeOffDate: string;
    lossType: string;
  };
  finance: {
    recordsFound: string;
    agreementType: string;
    financeCompany: string;
    agreementDate: string;
    vehicleDescription: string;
  };
  stolen: {
    isStolen: string;
    stolenDate: string;
    policeForce: string;
  };
  performance: {
    topSpeed: string;
    acceleration: string;
    bhp: string;
    torque: string;
    urbanMpg: string;
    extraUrbanMpg: string;
    combinedMpg: string;
    // Additional performance metrics
    maxSpeedKph?: string;
    zeroTo100Kph?: string;
    rpm?: string;
    ps?: string;
    kw?: string;
    nm?: string;
    lbft?: string;
    urbanColdLkm?: string;
    extraUrbanLkm?: string;
    combinedLkm?: string;
  };
  safety: {
    euroNcapRating: string;
    adultOccupant: string;
    childOccupant: string;
    pedestrianProtection: string;
    safetyAssist: string;
  };
  // Additional comprehensive sections
  dimensions?: {
    width: string;
    height: string;
    length: string;
    wheelbase: string;
    internalLoadLength: string;
  };
  modelDetails?: {
    make: string;
    model: string;
    range: string;
    variant: string;
    series: string;
    mark: string;
    startDate: string;
    endDate: string;
    countryOfOrigin: string;
    typeApprovalCategory: string;
    marketSectorCode: string;
    vehicleClass: string;
    taxationClass: string;
  };
  powertrain?: {
    type: string;
    fuelType: string;
    engineFamily: string;
    engineLocation: string;
    engineDescription: string;
    engineManufacturer: string;
    fuelDelivery: string;
    aspiration: string;
    cylinderArrangement: string;
    numberOfCylinders: string;
    bore: string;
    stroke: string;
    valveGear: string;
    valvesPerCylinder: string;
    numberOfGears: string;
    drivingAxle: string;
  };
  bodyDetails?: {
    bodyShape: string;
    bodyStyle: string;
    wheelbaseType: string;
    fuelTankCapacity: string;
    cabType: string;
    platformName: string;
    platformShared: string;
  };
  emissions?: {
    euroStatus: string;
    manufacturerCo2: string;
    stationaryDb: string;
    engineSpeedRpm: string;
    driveByDb: string;
  };
  keeperChanges?: Array<{
    numberOfPreviousKeepers: string;
    keeperStartDate: string;
    previousKeeperDisposalDate: string;
  }>;
  v5cCertificates?: Array<{
    issueDate: string;
  }>;
  plateChanges?: Array<{
    previousVrm: string;
    changeDate: string;
  }>;
  colourChanges?: Array<{
    colour: string;
    changeDate: string;
  }>;
  colourDetails?: {
    currentColour: string;
    originalColour: string;
    previousColour: string;
    numberOfColourChanges: string;
    latestColourChangeDate: string;
  };
  vedRates?: {
    firstYear6Months: string;
    firstYear12Months: string;
    standard6Months: string;
    standard12Months: string;
    premium6Months: string;
    premium12Months: string;
  };
  dvlaTechnicalDetails?: {
    numberOfSeats: string;
    engineCapacity: string;
    grossWeight: string;
    maxNetPower: string;
    massInService: string;
    powerToWeightRatio: string;
    maxBrakedTrailerMass: string;
    maxUnbrakedTrailerMass: string;
  };
  software?: {
    supportsOTA: string;
  };
  subscriptionOptions?: Array<{
    optionName: string;
    optionDescription: string;
  }>;
  warrantyInformation?: {
    manufacturerWarrantyMiles: string;
    manufacturerWarrantyMonths: string;
  };
  vehicleImages?: Array<{
    imageUrl: string;
    imageType: string;
  }>;
  mpgDetails?: {
    urbanColdMpg: string;
    extraUrbanMpg: string;
    combinedMpg: string;
    urbanColdLPer100Km: string;
    extraUrbanLPer100Km: string;
    combinedLPer100Km: string;
  };
}

export function normalizeReport(raw: any): NormalizedReport {
  // Clean raw data first
  const data = stripPlaceholders(raw);
  
  // Extract nested structures safely
  const vd = data?.vehicleData || {};
  const reportRaw = data?.reportRaw || vd?.reportRaw || {};
  const results = reportRaw?.Results || {};
  
  // Primary data sections from FullcheckAPI
  const vehicleDetails = results?.VehicleDetails || {};
  const vehicleIdent = vehicleDetails?.VehicleIdentification || {};
  const vehicleStatus = vehicleDetails?.VehicleStatus || {};
  const vehicleTaxDetails = results?.VehicleTaxDetails || {};
  const vedDetails = vehicleStatus?.VehicleExciseDutyDetails || vehicleTaxDetails?.VehicleExciseDutyDetails || {};
  // API uses VedRate (singular), not VedRates (plural)
  const vedRates = vedDetails?.VedRate || vedDetails?.VedRates || {};
  // VehicleHistory is at top-level of Results, NOT inside VehicleDetails
  const vehicleHistory = results?.VehicleHistory || {};
  const colourDetails = vehicleHistory?.ColourDetails || {};
  const keeperChangeList = vehicleHistory?.KeeperChangeList || [];
  // Correct property name: V5cCertificateList (lowercase 'c', not double C)
  const v5cCertificateList = vehicleHistory?.V5cCertificateList || [];
  const plateChangeList = vehicleHistory?.PlateChangeList || [];
  const dvlaTechDetails = vehicleDetails?.DvlaTechnicalDetails || {};
  
  // Model details section
  const modelDetails = results?.ModelDetails || {};
  const modelIdent = modelDetails?.ModelIdentification || {};
  const modelClass = modelDetails?.ModelClassification || {};
  const bodyDetails = modelDetails?.BodyDetails || {};
  const dimensions = modelDetails?.Dimensions || {};
  const weights = modelDetails?.Weights || {};
  const powertrain = modelDetails?.Powertrain || {};
  const iceDetails = powertrain?.IceDetails || {};
  const transmission = powertrain?.Transmission || {};
  const performance = modelDetails?.Performance || {};
  const perfStats = performance?.Statistics || {};
  const fuelEcon = performance?.FuelEconomy || {};
  const torqueData = performance?.Torque || {};
  const powerData = performance?.Power || {};
  const emissions = modelDetails?.Emissions || {};
  const soundLevels = modelDetails?.SoundLevels || {};
  const safety = modelDetails?.Safety?.EuroNcap || {};
  const additionalInfo = modelDetails?.AdditionalInformation || {};
  const warrantyInfo = additionalInfo?.VehicleWarrantyInformation || {};
  const subscriptionOptionList = additionalInfo?.SubscriptionOptionList || [];
  const software = additionalInfo?.Software || {};
  
  const motDetails = results?.MotHistoryDetails || {};
  
  // Determine if this is a comprehensive report
  const packageName = reportRaw?.RequestInformation?.PackageName || '';
  const isComprehensive = packageName === 'FullcheckAPI' || 
                          vd?.isComprehensive === true ||
                          (reportRaw && reportRaw.Results && packageName !== 'Freecheckapi');
  const packageType = packageName || (isComprehensive ? 'FullcheckAPI' : 'Freecheckapi');
  // Handle both MotRecords (test data) and MotTestDetailsList (real API)
  const motRecordsRaw = motDetails?.MotRecords || motDetails?.MotTestDetailsList || [];
  // Also check if MOT data is in the vehicleData.motHistory array (from simplified API response)
  const motRecords = motRecordsRaw.length > 0 ? motRecordsRaw : (vd?.motHistory || []);
  const miaftrDetails = results?.MiaftrDetails || {};
  const financeDetails = results?.FinanceDetails || {};
  const stolenDetails = results?.StolenDetails || {};
  
  // Calculate MOT statistics
  const validMotRecords = motRecords.filter((r: any) => r?.TestDate);
  const passCount = validMotRecords.filter((r: any) => 
    String(r?.TestPassed || "").toLowerCase() === "true" || 
    String(r?.TestPassed || "").toUpperCase() === "PASS"
  ).length;
  const failCount = validMotRecords.length - passCount;
  const passRate = validMotRecords.length > 0 
    ? Math.round((passCount / validMotRecords.length) * 100) 
    : 0;
  
  // Process MOT records with full details
  const normalizedMotRecords = validMotRecords.map((record: any) => {
    const defects: any[] = [];
    const advisories: any[] = [];
    
    // Process test annotations (from test data or full API)
    const annotations = record?.TestAnnotations || record?.AnnotationList || record?.annotations || [];
    annotations.forEach((ann: any) => {
      const type = String(ann?.Type || ann?.type || "").toLowerCase();
      const text = ann?.Text || ann?.text || ann?.Description || "";
      
      if (type === "advisory" || type === "advice") {
        advisories.push({
          text: F.text(text)
        });
      } else if (type === "failure" || type === "fail" || type === "major" || type === "dangerous" || type === "minor") {
        defects.push({
          type: type === "fail" ? "FAILURE" : type.toUpperCase(),
          text: F.text(text),
          dangerous: ann?.IsDangerous === true || ann?.isDangerous === true || type === "dangerous"
        });
      }
    });
    
    // Handle simplified motHistory format from the API
    const testDateValue = record?.TestDate || record?.date;
    const expiryDateValue = record?.ExpiryDate || record?.expiryDate;
    const mileageValue = record?.OdometerReading || record?.mileage;
    const testPassedValue = record?.TestPassed !== undefined ? record?.TestPassed : 
                            (record?.result === "PASS" || record?.result === "Pass");
    
    // Parse defects and advisories from the simplified format if annotations are not available
    if (annotations.length === 0 && record?.defects) {
      if (typeof record.defects === "string" && record.defects !== "None") {
        defects.push({
          type: "FAILURE",
          text: record.defects,
          dangerous: false
        });
      } else if (Array.isArray(record.defects)) {
        record.defects.forEach((defect: any) => {
          if (typeof defect === "string") {
            defects.push({
              type: "FAILURE",
              text: defect,
              dangerous: false
            });
          } else if (defect?.text) {
            defects.push({
              type: defect.type || "FAILURE",
              text: defect.text,
              dangerous: defect.dangerous || false
            });
          }
        });
      }
    }
    
    // Parse advisories from simplified format if not already parsed
    if (annotations.length === 0 && record?.annotations && Array.isArray(record.annotations)) {
      record.annotations.forEach((ann: any) => {
        if (ann?.Type === "advisory" && ann?.Text) {
          advisories.push({
            text: F.text(ann.Text)
          });
        } else if (ann?.Type && ann?.Type !== "advisory" && ann?.Text) {
          defects.push({
            type: ann.Type.toUpperCase(),
            text: F.text(ann.Text),
            dangerous: ann?.IsDangerous === true
          });
        }
      });
    }
    
    // More aggressive extraction for test details from various possible field names
    const testNumber = record?.TestNumber || record?.TestCertificateNumber || record?.MotTestNumber || 
                      record?.testNumber || record?.testCertificateNumber || record?.motTestNumber ||
                      record?.CertificateNumber || record?.certificateNumber || "";
                      
    const testStation = record?.TestStation || record?.TestStationName || record?.station || 
                       record?.StationName || record?.testStation || record?.testStationName ||
                       record?.StationNumber || record?.stationNumber || "";
    
    return {
      testDate: F.date(testDateValue),
      result: testPassedValue === true || String(testPassedValue).toLowerCase() === "true" || 
              testPassedValue === "PASS" || testPassedValue === "Pass" ? "PASS" : "FAIL",
      mileage: F.mileage(mileageValue),
      expiryDate: F.date(expiryDateValue),
      testNumber: F.text(testNumber),
      station: F.text(testStation),
      stationTown: F.text(record?.TestStationTown || record?.stationTown || record?.StationTown || ""),
      retest: F.yesNo(record?.IsRetest || record?.retest),
      defects,
      advisories
    };
  });
  
  // Calculate mileage history with deltas
  const mileageHistory: any[] = [];
  let previousMileage: number | null = null;
  
  normalizedMotRecords.forEach((record: any, index: number) => {
    const mileageStr = record.mileage.replace(/[^0-9]/g, '');
    const currentMileage = mileageStr ? parseInt(mileageStr) : null;
    
    if (currentMileage !== null) {
      let delta = "First record";
      if (previousMileage !== null && index > 0) {
        const diff = currentMileage - previousMileage;
        delta = diff >= 0 ? `+${diff.toLocaleString("en-GB")}` : diff.toLocaleString("en-GB");
      }
      
      mileageHistory.push({
        date: record.testDate,
        mileage: record.mileage,
        delta
      });
      
      previousMileage = currentMileage;
    }
  });
  
  // Calculate average mileage per year
  let avgMileagePerYear = "Not available";
  if (mileageHistory.length >= 2) {
    const firstRecord = mileageHistory[mileageHistory.length - 1];
    const lastRecord = mileageHistory[0];
    const firstMileage = parseInt(firstRecord.mileage.replace(/[^0-9]/g, ''));
    const lastMileage = parseInt(lastRecord.mileage.replace(/[^0-9]/g, ''));
    
    if (firstRecord.date !== "Not available" && lastRecord.date !== "Not available") {
      const years = F.daysSince(firstRecord.date.replace(/(\d+)\s+(\w+)\s+(\d+)/, '$1-$2-$3')) || 0;
      if (years > 0) {
        const yearsCount = years / 365;
        const avgPerYear = Math.round((lastMileage - firstMileage) / yearsCount);
        avgMileagePerYear = `${avgPerYear.toLocaleString("en-GB")} miles/year`;
      }
    }
  }
  
  // Process keeper changes array - ensure we process ALL keeper records
  const keeperChangesRaw = Array.isArray(keeperChangeList) ? keeperChangeList : 
                           (keeperChangeList ? [keeperChangeList] : []);
  const keeperChanges = keeperChangesRaw.map((keeper: any) => ({
    numberOfPreviousKeepers: F.int(keeper?.NumberOfPreviousKeepers),
    keeperStartDate: F.date(keeper?.KeeperStartDate),
    previousKeeperDisposalDate: F.date(keeper?.PreviousKeeperDisposalDate)
  }));
  
  // Process V5C certificates array - ensure we process ALL certificates
  const v5cCertificatesRaw = Array.isArray(v5cCertificateList) ? v5cCertificateList : 
                             (v5cCertificateList ? [v5cCertificateList] : []);
  const v5cCertificates = v5cCertificatesRaw.map((cert: any) => ({
    issueDate: F.date(cert?.IssueDate)
  }));
  
  // Process plate changes array - handle both array and single object
  const plateChangesRaw = Array.isArray(plateChangeList) ? plateChangeList : 
                          (plateChangeList ? [plateChangeList] : []);
  // Map API fields correctly: PreviousVrm, CurrentVrm, TransferType, DateOfTransaction, DateOfReceipt
  const plateChanges = plateChangesRaw.map((plate: any) => ({
    previousVrm: F.text(plate?.PreviousVrm || plate?.previousVrm),
    currentVrm: F.text(plate?.CurrentVrm || plate?.currentVrm),
    transferType: F.text(plate?.TransferType || plate?.transferType),
    changeDate: F.date(plate?.DateOfTransaction || plate?.DateOfReceipt || plate?.ChangeDate || plate?.changeDate),
    transactionDate: F.date(plate?.DateOfTransaction),
    receiptDate: F.date(plate?.DateOfReceipt)
  })).filter(p => p.previousVrm && p.previousVrm !== "—");
  
  // Process colour change history
  const colourChangeListRaw = vehicleHistory?.ColourChangeList || [];
  const colourChangeList = Array.isArray(colourChangeListRaw) ? colourChangeListRaw : 
                           (colourChangeListRaw ? [colourChangeListRaw] : []);
  const colourChanges = colourChangeList.map((colour: any) => ({
    colour: F.text(colour?.Colour),
    changeDate: F.date(colour?.ChangeDate)
  })).filter(c => c.colour && c.colour !== "—");
  
  // Extract subscription options (already have additionalInfo and software from above)
  const subscriptionOptions = subscriptionOptionList.map((opt: any) => ({
    optionName: F.text(opt?.OptionName),
    optionDescription: F.text(opt?.OptionDescription)
  }));
  
  // Extract vehicle images
  const imageDetails = results?.VehicleImageDetails || {};
  const imageList = imageDetails?.ImageList || [];
  const vehicleImages = imageList.map((img: any) => ({
    imageUrl: F.text(img?.ImageUrl),
    imageType: F.text(img?.ImageType)
  }));
  
  // Process MIAFTR write-off records
  const miaftrRecordList = miaftrDetails?.WriteOffRecordList || [];
  const writeOffRecordsProcessed = miaftrRecordList.map((record: any) => ({
    category: F.text(record?.Category || record?.DamageCode),
    date: F.date(record?.LossDate),
    lossType: F.text(record?.LossType),
    miaftrReference: F.text(record?.MiaftrReference),
    miafidDate: F.date(record?.MiafidDate)
  })).filter((r: any) => r.category && r.category !== "—");
  
  // Extract CO2 data and calculate fuel band
  const co2Value = vedDetails?.DvlaCo2 || emissions?.ManufacturerCo2 || vd?.co2 || 
                   vd?.co2Emissions || vehicleIdent?.Co2Emissions || results?.Co2Emissions ||
                   data?.dvla?.co2 || data?.technical?.co2 || data?.co2Emissions;
  const co2Number = co2Value != null ? Number(co2Value) : undefined;
  const fuelBand = co2ToBandUsedCars(co2Number);
  
  // Process V5C certificate list
  const v5cListRaw = data?.v5c_certificate_list || data?.dvla?.v5c || data?.v5cList ||
                     vehicleHistory?.V5cCertificateList || v5cCertificateList || [];
  const v5cListArray = Array.isArray(v5cListRaw) ? v5cListRaw : 
                       (v5cListRaw ? [v5cListRaw] : []);
  const v5cList = v5cListArray.map((cert: any) => ({
    documentRef: F.text(cert?.document_reference || cert?.docRef || cert?.DocumentReference),
    issuedOn: F.date(cert?.issued_on || cert?.issueDate || cert?.IssueDate),
    previousKeeperCount: cert?.keeper_count !== undefined ? Number(cert.keeper_count) : 
                         cert?.previousKeepers !== undefined ? Number(cert.previousKeepers) :
                         cert?.NumberOfPreviousKeepers !== undefined ? Number(cert.NumberOfPreviousKeepers) :
                         undefined,
    notes: F.text(cert?.notes || cert?.Notes)
  })).filter(cert => cert.documentRef || cert.issuedOn);
  
  return {
    isComprehensive,
    packageType,
    co2: co2Number,
    fuelBand,
    v5cList,
    vehicleIdentification: {
      registration: F.upper(vd?.registration || vehicleIdent?.Vrm),
      vin: F.text(vehicleIdent?.Vin),
      vinLast5: F.text(vehicleIdent?.VinLast5),
      engineNumber: F.text(vehicleIdent?.EngineNumber || vd?.engineNumber),
      make: F.text(vehicleIdent?.DvlaMake || vd?.make),
      model: F.text(vehicleIdent?.DvlaModel || vd?.model),
      colour: F.text(colourDetails?.CurrentColour || vd?.colour),
      bodyType: F.text(vehicleIdent?.DvlaBodyType || vd?.bodyType),
      fuelType: F.text(vehicleIdent?.DvlaFuelType || vd?.fuelType),
      wheelPlan: F.text(vehicleIdent?.DvlaWheelPlan || vd?.wheelplan),
      yearOfManufacture: F.text(vehicleIdent?.YearOfManufacture || vd?.year),
      dateFirstRegistered: F.date(vehicleIdent?.DateFirstRegistered || vd?.firstRegistration),
      dateFirstRegisteredUK: F.date(vehicleIdent?.DateFirstRegisteredInUk || vd?.firstRegisteredInUK),
      dateOfManufacture: F.date(vehicleIdent?.DateOfManufacture || vd?.dateOfManufacture),
      vehicleUsedBeforeFirstReg: F.yesNo(vehicleIdent?.VehicleUsedBeforeFirstRegistration),
      previousVrmNI: F.text(vehicleIdent?.PreviousVrmNi),
      // Additional comprehensive fields
      dvlaMake: F.text(vehicleIdent?.DvlaMake),
      dvlaModel: F.text(vehicleIdent?.DvlaModel),
      engineSize: F.text(dvlaTechDetails?.EngineCapacityCc || vd?.engineSize),
      engineCC: F.text(dvlaTechDetails?.EngineCapacityCc),
      co2Emissions: F.co2(vedDetails?.DvlaCo2 || emissions?.ManufacturerCo2 || vd?.co2Emissions),
      euroStatus: F.text(emissions?.EuroStatus || vd?.euroStatus),
      doors: F.text(bodyDetails?.NumberOfDoors || vd?.doors),
      numberOfDoors: F.text(bodyDetails?.NumberOfDoors || vd?.doors),
      transmission: F.text(transmission?.TransmissionType || vd?.transmission),
      driveType: F.text(transmission?.DriveType || vd?.driveType),
      revenueWeight: F.text(vd?.revenueWeight),
      taxExpiry: F.date(vd?.taxExpiry || vehicleTaxDetails?.TaxDueDate || vedDetails?.TaxDueDate),
      taxStatus: F.text(vd?.taxStatus || vehicleTaxDetails?.TaxStatus || vedDetails?.TaxStatus || "Unknown"),
      taxBand: F.text(vedDetails?.DvlaBand || vedDetails?.Band || vd?.taxBand),
      motExpiry: F.date(motDetails?.MotDueDate || vd?.motExpiry),
      motResult: F.text(vd?.motResult),
      // Import/Export/Scrap status
      isImported: F.yesNo(vehicleStatus?.IsImported || vd?.isImported),
      isExported: F.yesNo(vehicleStatus?.IsExported || vd?.isExported),
      isScrapped: F.yesNo(vehicleStatus?.IsScrapped || vd?.isScrapped),
      sornStatus: F.yesNo(vehicleStatus?.IsSorn || vd?.sornStatus)
    },
    vehicleStatus: {
      certOfDestruction: F.yesNo(vehicleStatus?.CertificateOfDestructionIssued),
      isImported: F.yesNo(vehicleStatus?.IsImported),
      isImportedNI: F.yesNo(vehicleStatus?.IsImportedFromNi),
      isImportedNonEU: F.yesNo(vehicleStatus?.IsImportedFromNonEu),
      dateImported: F.date(vehicleStatus?.DateImported),
      isExported: F.yesNo(vehicleStatus?.IsExported),
      dateExported: F.date(vehicleStatus?.DateExported),
      isScrapped: F.yesNo(vehicleStatus?.IsScrapped),
      dateScrapped: F.date(vehicleStatus?.DateScrapped),
      cherishedMarker: F.yesNo(vehicleStatus?.DvlaCherishedTransferMarker),
      isUnscrapped: F.yesNo(vehicleStatus?.IsUnscrapped)
    },
    vehicleExciseDuty: {
      co2: F.co2(vedDetails?.DvlaCo2 || vd?.co2Emissions),
      band: F.text(vedDetails?.DvlaBand || vd?.taxBand),
      co2Band: F.text(vedDetails?.DvlaCo2Band),
      firstYear6Months: F.gbp(vedRates?.FirstYear?.SixMonths),
      firstYear12Months: F.gbp(vedRates?.FirstYear?.TwelveMonths),
      standard6Months: F.gbp(vedRates?.Standard?.SixMonths),
      standard12Months: F.gbp(vedRates?.Standard?.TwelveMonths),
      premium6Months: F.gbp(vedRates?.PremiumVehicle?.SixMonths),
      premium12Months: F.gbp(vedRates?.PremiumVehicle?.TwelveMonths)
    },
    vehicleHistory: {
      currentColour: F.text(colourDetails?.CurrentColour || vd?.colour),
      originalColour: F.text(colourDetails?.OriginalColour || vd?.originalColour),
      previousColour: F.text(colourDetails?.PreviousColour || vd?.previousColour),
      numberOfColourChanges: F.int(colourDetails?.NumberOfColourChanges || vd?.numberOfColourChanges),
      latestColourChangeDate: F.date(colourDetails?.LatestColourChangeDate || vd?.latestColourChangeDate),
      numberOfPreviousKeepers: F.int(keeperChangeList[0]?.NumberOfPreviousKeepers || vd?.previousOwners),
      keeperStartDate: F.date(keeperChangeList[0]?.KeeperStartDate),
      previousKeeperDisposalDate: F.date(keeperChangeList[0]?.PreviousKeeperDisposalDate),
      v5cIssueDate: F.date(v5cCertificateList[0]?.IssueDate)
    },
    technicalDetails: {
      numberOfSeats: F.int(dvlaTechDetails?.NumberOfSeats || bodyDetails?.NumberOfSeats || vd?.numberOfSeats),
      engineCapacity: F.engineSize(dvlaTechDetails?.EngineCapacityCc || iceDetails?.EngineCapacityCc || vd?.engineSize),
      grossWeight: F.weight(dvlaTechDetails?.GrossWeightKg || weights?.GrossVehicleWeightKg || vd?.grossWeight),
      maxNetPower: F.power(dvlaTechDetails?.MaxNetPowerKw || powerData?.Kw || vd?.maxNetPower, "kW"),
      massInService: F.weight(dvlaTechDetails?.MassInServiceKg || vd?.massInService),
      powerToWeightRatio: F.text(dvlaTechDetails?.PowerToWeightRatio || vd?.powerToWeightRatio),
      maxBrakedTrailerMass: F.weight(dvlaTechDetails?.MaxPermissibleBrakedTrailerMassKg),
      maxUnbrakedTrailerMass: F.weight(dvlaTechDetails?.MaxPermissibleUnbrakedTrailerMassKg),
      // Additional technical fields
      numberOfAxles: F.int(bodyDetails?.NumberOfAxles),
      grossCombinedWeight: F.weight(weights?.GrossCombinedWeightKg),
      grossTrainWeight: F.weight(weights?.GrossTrainWeightKg),
      payloadWeight: F.weight(weights?.PayloadWeightKg),
      kerbWeight: F.weight(weights?.KerbWeightKg || vd?.kerbWeight),
      unladenWeight: F.weight(weights?.UnladenWeightKg)
    },
    motSummary: {
      status: F.motStatus(motDetails?.MotDueDate || vd?.motExpiry),
      dueDate: F.date(motDetails?.MotDueDate || vd?.motExpiry),
      latestTestDate: F.date(motDetails?.LatestTestDate),
      daysToDue: F.daysUntil(motDetails?.MotDueDate || vd?.motExpiry),
      daysSinceLast: F.daysSince(motDetails?.LatestTestDate),
      passRate: `${passRate}%`,
      totalTests: validMotRecords.length,
      totalPasses: passCount,
      totalFails: failCount,
      avgMileagePerYear
    },
    motRecords: normalizedMotRecords,
    mileageHistory,
    miaftr: {
      recordsFound: F.yesNo(miaftrDetails?.WriteOffRecordList?.length > 0 || vd?.insuranceWriteOff === 'Yes'),
      writeOffCategory: F.text(miaftrDetails?.WriteOffRecordList?.[0]?.Category || miaftrDetails?.WriteOffRecordList?.[0]?.DamageCode || vd?.writeOffCategory),
      writeOffDate: F.date(miaftrDetails?.WriteOffRecordList?.[0]?.LossDate || vd?.writeOffDate),
      lossType: F.text(miaftrDetails?.WriteOffRecordList?.[0]?.LossType || miaftrDetails?.LossType)
    },
    writeOffRecords: writeOffRecordsProcessed,
    finance: {
      recordsFound: F.yesNo(financeDetails?.FinanceRecordList?.length > 0 || vd?.financeOutstanding === 'Yes'),
      agreementType: F.text(financeDetails?.FinanceRecordList?.[0]?.AgreementType || financeDetails?.AgreementType),
      financeCompany: F.text(financeDetails?.FinanceRecordList?.[0]?.FinanceCompany || vd?.financeProvider),
      agreementDate: F.date(financeDetails?.FinanceRecordList?.[0]?.AgreementDate || financeDetails?.AgreementDate),
      vehicleDescription: F.text(financeDetails?.FinanceRecordList?.[0]?.VehicleDescription || financeDetails?.VehicleDescription)
    },
    stolen: {
      isStolen: F.yesNo(stolenDetails?.IsStolen || vd?.stolenStatus === 'Stolen'),
      stolenDate: F.date(stolenDetails?.DateReportedStolen || vd?.dateReportedStolen),
      policeForce: F.text(stolenDetails?.PoliceForce)
    },
    performance: {
      topSpeed: F.text(perfStats?.MaxSpeedMph ? `${perfStats.MaxSpeedMph} mph` : vd?.maxSpeed),
      acceleration: F.text(perfStats?.ZeroToSixtyMph ? `${perfStats.ZeroToSixtyMph}s` : vd?.acceleration0to60),
      bhp: F.power(powerData?.Bhp, "bhp"),
      torque: F.text(torqueData?.Nm ? `${torqueData.Nm} nm` : vd?.torque),
      urbanMpg: F.text(fuelEcon?.UrbanColdMpg ? `${fuelEcon.UrbanColdMpg} mpg` : vd?.urbanMpg),
      extraUrbanMpg: F.text(fuelEcon?.ExtraUrbanMpg ? `${fuelEcon.ExtraUrbanMpg} mpg` : vd?.extraUrbanMpg),
      combinedMpg: F.text(fuelEcon?.CombinedMpg ? `${fuelEcon.CombinedMpg} mpg` : vd?.fuelEconomyCombined),
      // Additional performance metrics
      maxSpeedKph: F.text(perfStats?.MaxSpeedKph ? `${perfStats.MaxSpeedKph} kph` : undefined),
      zeroTo100Kph: F.text(perfStats?.ZeroToOneHundredKph ? `${perfStats.ZeroToOneHundredKph}s` : undefined),
      rpm: F.text(torqueData?.Rpm || powerData?.Rpm),
      ps: F.text(powerData?.Ps ? `${powerData.Ps} ps` : undefined),
      kw: F.text(powerData?.Kw ? `${powerData.Kw} kw` : undefined),
      nm: F.text(torqueData?.Nm ? `${torqueData.Nm} nm` : undefined),
      lbft: F.text(torqueData?.Lbft ? `${torqueData.Lbft} lbft` : undefined),
      urbanColdLkm: F.text(fuelEcon?.UrbanColdLPer100Km ? `${fuelEcon.UrbanColdLPer100Km} L/100km` : undefined),
      extraUrbanLkm: F.text(fuelEcon?.ExtraUrbanLPer100Km ? `${fuelEcon.ExtraUrbanLPer100Km} L/100km` : undefined),
      combinedLkm: F.text(fuelEcon?.CombinedLPer100Km ? `${fuelEcon.CombinedLPer100Km} L/100km` : undefined)
    },
    safety: {
      euroNcapRating: F.text(safety?.NcapStarRating),
      adultOccupant: F.percentage(safety?.NcapAdultPercent),
      childOccupant: F.percentage(safety?.NcapChildPercent),
      pedestrianProtection: F.percentage(safety?.NcapPedestrianPercent),
      safetyAssist: F.percentage(safety?.NcapSafetyAssistPercent)
    },
    // Additional comprehensive sections
    dimensions: dimensions ? {
      width: F.text(dimensions.WidthMm ? `${dimensions.WidthMm} mm` : vd?.width),
      height: F.text(dimensions.HeightMm ? `${dimensions.HeightMm} mm` : vd?.height),
      length: F.text(dimensions.LengthMm ? `${dimensions.LengthMm} mm` : vd?.length),
      wheelbase: F.text(dimensions.WheelbaseLengthMm ? `${dimensions.WheelbaseLengthMm} mm` : vd?.wheelbase),
      internalLoadLength: F.text(dimensions.InternalLoadLengthMm ? `${dimensions.InternalLoadLengthMm} mm` : undefined)
    } : undefined,
    modelDetails: modelIdent ? {
      make: F.text(modelIdent.Make),
      model: F.text(modelIdent.Model),
      range: F.text(modelIdent.Range),
      variant: F.text(modelIdent.ModelVariant),
      series: F.text(modelIdent.Series),
      mark: F.text(modelIdent.Mark),
      startDate: F.date(modelIdent.StartDate),
      endDate: F.date(modelIdent.EndDate),
      countryOfOrigin: F.text(modelIdent.CountryOfOrigin),
      typeApprovalCategory: F.text(modelClass.TypeApprovalCategory),
      marketSectorCode: F.text(modelClass.MarketSectorCode),
      vehicleClass: F.text(modelClass.VehicleClass),
      taxationClass: F.text(modelClass.TaxationClass)
    } : undefined,
    powertrain: powertrain ? {
      type: F.text(powertrain.PowertrainType),
      fuelType: F.text(powertrain.FuelType),
      engineFamily: F.text(iceDetails.EngineFamily),
      engineLocation: F.text(iceDetails.EngineLocation),
      engineDescription: F.text(iceDetails.EngineDescription),
      engineManufacturer: F.text(iceDetails.EngineManufacturer),
      fuelDelivery: F.text(iceDetails.FuelDelivery),
      aspiration: F.text(iceDetails.Aspiration),
      cylinderArrangement: F.text(iceDetails.CylinderArrangement),
      numberOfCylinders: F.text(iceDetails.NumberOfCylinders),
      bore: F.text(iceDetails.BoreMm ? `${iceDetails.BoreMm} mm` : undefined),
      stroke: F.text(iceDetails.StrokeMm ? `${iceDetails.StrokeMm} mm` : undefined),
      valveGear: F.text(iceDetails.ValveGear),
      valvesPerCylinder: F.text(iceDetails.ValvesPerCylinder),
      numberOfGears: F.text(transmission.NumberOfGears),
      drivingAxle: F.text(transmission.DrivingAxle)
    } : undefined,
    bodyDetails: bodyDetails ? {
      bodyShape: F.text(bodyDetails.BodyShape),
      bodyStyle: F.text(bodyDetails.BodyStyle),
      wheelbaseType: F.text(bodyDetails.WheelbaseType),
      fuelTankCapacity: F.text(bodyDetails.FuelTankCapacityLitres ? `${bodyDetails.FuelTankCapacityLitres} L` : undefined),
      cabType: F.text(bodyDetails.CabType),
      platformName: F.text(bodyDetails.PlatformName),
      platformShared: F.yesNo(bodyDetails.PlatformIsSharedAcrossModels)
    } : undefined,
    emissions: emissions ? {
      euroStatus: F.text(emissions.EuroStatus),
      manufacturerCo2: F.text(emissions.ManufacturerCo2),
      stationaryDb: F.text(soundLevels?.StationaryDb ? `${soundLevels.StationaryDb} db` : undefined),
      engineSpeedRpm: F.text(soundLevels?.EngineSpeedRpm ? `${soundLevels.EngineSpeedRpm} rpm` : undefined),
      driveByDb: F.text(soundLevels?.DriveByDb ? `${soundLevels.DriveByDb} db` : undefined)
    } : undefined,
    keeperChanges: keeperChanges.length > 0 ? keeperChanges : undefined,
    v5cCertificates: v5cCertificates, // Always include even if empty
    plateChanges: plateChanges.length > 0 ? plateChanges : undefined,
    colourChanges: colourChanges.length > 0 ? colourChanges : undefined,
    colourDetails: {
      currentColour: F.text(colourDetails?.CurrentColour || vd?.colour),
      originalColour: F.text(colourDetails?.OriginalColour),
      previousColour: F.text(colourDetails?.PreviousColour),
      numberOfColourChanges: F.int(colourDetails?.NumberOfColourChanges),
      latestColourChangeDate: F.date(colourDetails?.LatestColourChangeDate)
    },
    vedRates: {
      firstYear6Months: vedRates?.FirstYear?.SixMonths !== undefined && vedRates?.FirstYear?.SixMonths !== null ? 
        F.gbp(vedRates.FirstYear.SixMonths) : 'Not Available',
      firstYear12Months: vedRates?.FirstYear?.TwelveMonths !== undefined && vedRates?.FirstYear?.TwelveMonths !== null ? 
        F.gbp(vedRates.FirstYear.TwelveMonths) : 'Not Available',
      standard6Months: vedRates?.Standard?.SixMonths !== undefined && vedRates?.Standard?.SixMonths !== null ? 
        F.gbp(vedRates.Standard.SixMonths) : 'Not Available',
      standard12Months: vedRates?.Standard?.TwelveMonths !== undefined && vedRates?.Standard?.TwelveMonths !== null ? 
        F.gbp(vedRates.Standard.TwelveMonths) : 'Not Available',
      premium6Months: vedRates?.PremiumVehicle?.SixMonths !== undefined && vedRates?.PremiumVehicle?.SixMonths !== null ? 
        F.gbp(vedRates.PremiumVehicle.SixMonths) : 'Not Available',
      premium12Months: vedRates?.PremiumVehicle?.TwelveMonths !== undefined && vedRates?.PremiumVehicle?.TwelveMonths !== null ? 
        F.gbp(vedRates.PremiumVehicle.TwelveMonths) : 'Not Available'
    },
    dvlaTechnicalDetails: {
      numberOfSeats: F.int(dvlaTechDetails?.NumberOfSeats),
      engineCapacity: F.engineSize(dvlaTechDetails?.EngineCapacityCc),
      grossWeight: F.weight(dvlaTechDetails?.GrossWeightKg),
      maxNetPower: F.power(dvlaTechDetails?.MaxNetPowerKw, "kW"),
      massInService: F.weight(dvlaTechDetails?.MassInServiceKg),
      powerToWeightRatio: F.text(dvlaTechDetails?.PowerToWeightRatio),
      maxBrakedTrailerMass: F.weight(dvlaTechDetails?.MaxPermissibleBrakedTrailerMassKg),
      maxUnbrakedTrailerMass: F.weight(dvlaTechDetails?.MaxPermissibleUnbrakedTrailerMassKg)
    },
    software: software ? {
      supportsOTA: F.yesNo(software?.SupportsOverTheAirSoftwareUpdate)
    } : undefined,
    warrantyInformation: warrantyInfo ? {
      manufacturerWarrantyMiles: F.text(warrantyInfo?.ManufacturerWarrantyMiles || 'Not Available'),
      manufacturerWarrantyMonths: F.text(warrantyInfo?.ManufacturerWarrantyMonths || 'Not Available')
    } : undefined,
    subscriptionOptions: subscriptionOptionList && subscriptionOptionList.length > 0 ? 
      subscriptionOptionList.map((opt: any) => ({
        optionName: F.text(opt?.Name || 'Unknown'),
        optionDescription: F.text(opt?.Description || 'No description')
      })) : [],
    vehicleImages: vehicleImages.length > 0 ? vehicleImages : undefined,
    mpgDetails: {
      urbanColdMpg: F.text(fuelEcon?.UrbanColdMpg ? `${fuelEcon.UrbanColdMpg} mpg` : undefined),
      extraUrbanMpg: F.text(fuelEcon?.ExtraUrbanMpg ? `${fuelEcon.ExtraUrbanMpg} mpg` : undefined),
      combinedMpg: F.text(fuelEcon?.CombinedMpg ? `${fuelEcon.CombinedMpg} mpg` : undefined),
      urbanColdLPer100Km: F.text(fuelEcon?.UrbanColdLPer100Km ? `${fuelEcon.UrbanColdLPer100Km} L/100km` : undefined),
      extraUrbanLPer100Km: F.text(fuelEcon?.ExtraUrbanLPer100Km ? `${fuelEcon.ExtraUrbanLPer100Km} L/100km` : undefined),
      combinedLPer100Km: F.text(fuelEcon?.CombinedLPer100Km ? `${fuelEcon.CombinedLPer100Km} L/100km` : undefined)
    }
  };
}