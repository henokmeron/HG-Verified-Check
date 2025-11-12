// Comprehensive mock data generator for all 277 fields in the vehicle report schema
export function generateComprehensiveMockData(registration: string) {
  const vrm = registration.toUpperCase();
  
  return {
    Results: {
      // Vehicle Details Section
      VehicleDetails: [{
        VehicleIdentification: {
          DvlaMake: "BMW",
          DvlaModel: "3 SERIES",
          Vrm: vrm,
          VinLast5: "AB123",
          Vin: "WBAWV31000AB12345",
          YearOfManufacture: "2021",
          DvlaBodyType: "4 DOOR SALOON",
          DvlaFuelType: "PETROL",
          EngineNumber: "N20B20A12345",
          DvlaWheelPlan: "2 AXLE RIGID BODY",
          DateFirstRegistered: "2021-03-15",
          DateFirstRegisteredUk: "2021-03-15",
          DateOfManufacture: "2021-02-01",
          VehicleUsedBeforeFirstRegistration: false,
          VehicleCategory: "M1",
          VehicleClass: "PRIVATE/LIGHT GOODS",
          Transmission: "AUTOMATIC",
          DriveType: "REAR WHEEL DRIVE",
          NumberOfGears: "8",
          NumberOfDoors: "4",
          NumberOfSeats: "5",
          VehicleConfiguration: "SALOON",
          AxleConfiguration: "2 AXLE",
          WheelbaseInMm: "2851",
          TypeApprovalCategory: "M1",
          TypeApproval: "E1*2007/46*0928*12",
          RevenueWeight: "1595"
        },
        
        VehicleStatus: {
          IsImported: false,
          IsExported: false,
          IsScrapped: false,
          DvlaCherishedTransferMarker: false,
          VicTestRequired: false,
          VicTestDate: null,
          VicTestResult: null,
          VDICheckStolenMarker: false,
          VDICheckStolenDate: null,
          VDICheckFinanceMarker: false,
          VDICheckFinanceAgreementDate: null,
          VDICheckFinanceCompany: null,
          VDICheckConditionMarker: false,
          VDICheckConditionInspectionDate: null
        },
        
        VehicleExciseDutyDetails: {
          DvlaCo2: "139",
          DvlaBand: "G",
          DvlaCo2Band: "Band G (131-150 g/km)",
          VedRatesFirstYear6Months: "270.00",
          VedRatesFirstYear12Months: "540.00",
          VedRatesStandard6Months: "95.00",
          VedRatesStandard12Months: "190.00",
          VedAlternativeFuel6Months: "85.00",
          VedAlternativeFuel12Months: "170.00",
          VedBand: "G",
          VedBandDescription: "Band G - £190 per year",
          TaxDue: "2025-03-31",
          TaxStatus: "TAXED",
          VehicleExciseDutyEmissionsDetails: {
            Co2EmissionGpKm: "139",
            NoxEmissionMgKm: "35.2",
            ParticleEmissionMgKm: "0.3",
            HcEmissionMgKm: "28.5",
            CoEmissionMgKm: "245.8",
            SoundLevelStationary: "72",
            SoundLevelDriveBy: "68",
            CombinedFuelConsumptionLp100Km: "6.1",
            UrbanFuelConsumptionCold: "8.4",
            ExtraUrbanFuelConsumption: "4.9",
            UrbanFuelConsumptionLp100Km: "8.4",
            ExtraUrbanFuelConsumptionLp100Km: "4.9",
            CombinedFuelConsumptionMpg: "46.3"
          }
        }
      }],
      
      // Vehicle History Section
      VehicleHistory: [{
        ColourDetails: {
          CurrentColour: "ALPINE WHITE",
          OriginalColour: "ALPINE WHITE",
          NumberOfColourChanges: "0",
          ColourChangeHistory: [],
          LastColourChangeDate: null
        },
        
        KeeperChangeList: {
          NumberOfPreviousKeepers: "2",
          CurrentKeeperStartDate: "2023-06-15",
          KeeperChanges: [
            {
              KeeperStartDate: "2021-03-15",
              PreviousKeeperDisposalDate: "2022-09-01",
              KeeperNumber: "1",
              DurationInMonths: "18"
            },
            {
              KeeperStartDate: "2022-09-01",
              PreviousKeeperDisposalDate: "2023-06-15",
              KeeperNumber: "2",
              DurationInMonths: "9"
            },
            {
              KeeperStartDate: "2023-06-15",
              PreviousKeeperDisposalDate: null,
              KeeperNumber: "3",
              DurationInMonths: "18"
            }
          ]
        },
        
        VicHistory: {
          VicTestPassed: true,
          VicTestDate: null,
          VicTestResult: null,
          VicTestCertificateNumber: null
        },
        
        PlateChangeList: {
          NumberOfPlateChanges: "0",
          PlateChanges: [],
          CurrentPlateIssueDate: "2021-03-15",
          PreviousPlates: []
        }
      }],
      
      // MOT History Section
      MotHistoryDetails: [{
        Make: "BMW",
        Model: "3 SERIES",
        Colour: "WHITE",
        LatestTestDate: "2024-03-10",
        Vrm: vrm,
        FuelType: "PETROL",
        FirstUsedDate: "2021-03-15",
        MotStatus: "VALID",
        MotDueDate: "2025-03-14",
        DaysSinceLastMot: "298",
        
        RecordedMileageData: {
          CountOfMotMileageRecords: "3",
          MinMileage: "12453",
          MaxMileage: "38972",
          ClockingCheckResult: "NO DISCREPANCY",
          AverageMileagePerYear: "12990",
          MileageAnomalyDetected: false,
          LastRecordedMileage: "38972",
          LastMileageDate: "2024-03-10"
        },
        
        MotRecords: [
          {
            TestNumber: "123456789012",
            TestDate: "2024-03-10",
            MotResult: "PASS",
            IsRetest: false,
            ExpiryDate: "2025-03-14",
            TestPassed: true,
            OdometerReading: "38972",
            OdometerUnit: "MILES",
            MotTestLocation: "MOT TEST CENTRE BIRMINGHAM",
            TestDuration: "45",
            AdvisoryNotice: "Tyre worn close to legal limit 2mm (front left)",
            DangerousDefects: "0",
            MajorDefects: "0",
            MinorDefects: "0"
          },
          {
            TestNumber: "987654321098",
            TestDate: "2023-03-11",
            MotResult: "PASS",
            IsRetest: false,
            ExpiryDate: "2024-03-14",
            TestPassed: true,
            OdometerReading: "25684",
            OdometerUnit: "MILES",
            MotTestLocation: "MOT TEST CENTRE LONDON",
            TestDuration: "40",
            AdvisoryNotice: null,
            DangerousDefects: "0",
            MajorDefects: "0",
            MinorDefects: "0"
          },
          {
            TestNumber: "456789123456",
            TestDate: "2022-03-12",
            MotResult: "FAIL",
            IsRetest: false,
            ExpiryDate: null,
            TestPassed: false,
            OdometerReading: "12453",
            OdometerUnit: "MILES",
            MotTestLocation: "MOT TEST CENTRE MANCHESTER",
            TestDuration: "50",
            AdvisoryNotice: null,
            DangerousDefects: "0",
            MajorDefects: "1",
            MinorDefects: "2",
            FailureReasons: [
              "Brake pad worn below minimum thickness (front)"
            ]
          },
          {
            TestNumber: "456789123457",
            TestDate: "2022-03-13",
            MotResult: "PASS",
            IsRetest: true,
            ExpiryDate: "2023-03-14",
            TestPassed: true,
            OdometerReading: "12465",
            OdometerUnit: "MILES",
            MotTestLocation: "MOT TEST CENTRE MANCHESTER",
            TestDuration: "30",
            AdvisoryNotice: null,
            DangerousDefects: "0",
            MajorDefects: "0",
            MinorDefects: "0"
          }
        ]
      }],
      
      // Technical Details Section
      TechnicalDetails: [{
        Engine: {
          EngineCode: "N20B20A",
          EngineCapacityInCc: "1998",
          EngineCapacityInLitres: "2.0",
          NumberOfCylinders: "4",
          CylinderArrangement: "INLINE",
          ValvesPerCylinder: "4",
          AspirationDescription: "TURBOCHARGED",
          FuelDelivery: "DIRECT INJECTION",
          FuelSystemDescription: "PETROL DIRECT INJECTION",
          MaxPowerBhp: "184",
          MaxPowerKw: "135",
          MaxPowerRpm: "5000",
          MaxTorqueNm: "270",
          MaxTorqueLbFt: "199",
          MaxTorqueRpm: "1350",
          Bore: "84.0",
          Stroke: "90.1",
          CompressionRatio: "10.0:1",
          EngineLocation: "FRONT",
          EngineMake: "BMW",
          EngineManufacturer: "BMW AG"
        },
        
        Performance: {
          TopSpeedMph: "146",
          TopSpeedKmh: "235",
          ZeroTo60Mph: "7.2",
          ZeroTo100Kmh: "7.5"
        },
        
        Dimensions: {
          LengthInMm: "4709",
          WidthInMm: "1827",
          HeightInMm: "1435",
          WheelbaseInMm: "2851",
          MinKerbWeightInKg: "1475",
          MaxGrossWeightInKg: "2050",
          MaxPayloadInKg: "575",
          MaxTowingWeightBrakedInKg: "1800",
          MaxTowingWeightUnbrakedInKg: "750",
          MaxRoofLoadInKg: "75",
          FuelTankCapacityInLitres: "59",
          BootSpaceInLitres: "480",
          BootSpaceSeatsUpInLitres: "480",
          BootSpaceSeatsDownInLitres: "1500",
          MinTurningCircleInMetres: "11.3",
          MaxLoadLengthInMm: "1900"
        },
        
        Safety: {
          NcapAdultOccupantProtection: "95",
          NcapChildOccupantProtection: "87",
          NcapPedestrianProtection: "78",
          NcapSafetyAssistScore: "72",
          NcapOverallRating: "5",
          EuroNcapTestDate: "2019-10-01",
          IsoFixPoints: "YES",
          AirbagsNumber: "6",
          AirbagsDescription: "FRONT, SIDE & CURTAIN",
          Abs: "YES",
          Esp: "YES",
          TractionControl: "YES",
          HillHoldControl: "YES",
          TpmsTypeDescription: "DIRECT",
          ActiveSafetyFeatures: "AEB, LANE ASSIST, BLIND SPOT"
        }
      }],
      
      // Additional Critical Checks
      AdditionalCriticalChecks: [{
        Finance: false,
        FinanceRecordDate: null,
        FinanceAgreementNumber: null,
        FinanceCompany: null,
        FinanceType: null,
        FinanceStartDate: null,
        FinanceTermMonths: null,
        
        WriteOff: false,
        WriteOffCategory: null,
        WriteOffDate: null,
        WriteOffMiaftrLossType: null,
        WriteOffMiafidDate: null,
        
        AnomalyMileage: false,
        MileageAnomalyType: null,
        MileageAnomalyDate: null,
        MileageDiscrepancyRange: null,
        
        RecordedAsStolen: false,
        StolenDate: null,
        StolenPoliceReference: null,
        StolenStatus: null,
        RecoveredDate: null,
        
        VrmOnPnc: false,
        VinOnPnc: false,
        PncRecordType: null,
        PncMarkerDate: null,
        
        NoLogbookLoan: true,
        LogbookLoanCompany: null,
        LogbookLoanDate: null,
        
        MileageVerified: true,
        MileageSource: "MOT HISTORY",
        LastVerifiedMileage: "38972",
        LastVerifiedDate: "2024-03-10",
        
        ImportedVehicle: false,
        ImportDate: null,
        ImportCountry: null,
        
        ExportedVehicle: false,
        ExportDate: null,
        ExportCountry: null,
        
        ScrappedVehicle: false,
        ScrappedDate: null,
        ScrappedReference: null,
        
        PlateTransfer: false,
        PlateTransferDate: null,
        PlateTransferFrom: null,
        PlateTransferTo: null,
        
        HighRiskVehicle: false,
        RiskRating: "LOW",
        RiskFactors: [],
        
        VdiCheckPerformed: true,
        VdiCheckDate: new Date().toISOString(),
        VdiCheckReference: "VDI-2024-" + Math.random().toString(36).substr(2, 9).toUpperCase()
      }],
      
      // Finance Agreements Section
      FinanceAgreements: {
        HasActiveFinance: false,
        NumberOfAgreements: "0",
        TotalOutstandingFinance: "0.00",
        Agreements: []
      },
      
      // Insurance Write-off Section (MIAFTR)
      InsuranceWriteOff: {
        IsWrittenOff: false,
        WriteOffCategory: null,
        WriteOffDate: null,
        WriteOffType: null,
        DamageDescription: null,
        RepairCost: null,
        PreAccidentValue: null,
        SalvageValue: null
      },
      
      // Stolen Vehicle Check
      StolenVehicleInformation: {
        IsCurrentlyStolen: false,
        StolenDate: null,
        PoliceReference: null,
        TheftType: null,
        RecoveryStatus: null,
        RecoveryDate: null,
        RecoveryLocation: null,
        RecoveryCondition: null
      },
      
      // Valuation Data
      ValuationData: {
        CurrentTradeValue: "21500",
        CurrentRetailValue: "24900",
        CurrentPrivateValue: "23200",
        ForecourtValue: "25900",
        ValuationDate: new Date().toISOString().split('T')[0],
        DepreciationPerYear: "2800",
        ProjectedValueOneYear: "21100",
        ProjectedValueThreeYears: "16500",
        OriginalListPrice: "38950",
        OriginalOtrPrice: "39850",
        CurrentMileageAdjustment: "-500",
        ConditionAdjustment: "0",
        OptionsValue: "2500"
      },
      
      // Equipment and Options
      StandardEquipment: {
        Safety: [
          "Anti-lock Braking System (ABS)",
          "Electronic Stability Program (ESP)",
          "6 Airbags",
          "ISOFIX Child Seat Anchors",
          "Tyre Pressure Monitoring System",
          "Emergency Brake Assist",
          "Hill Start Assist"
        ],
        Comfort: [
          "Dual-zone Climate Control",
          "Cruise Control with Brake Function",
          "Electric Windows (Front & Rear)",
          "Electric Mirrors (Heated)",
          "Height Adjustable Driver Seat",
          "Lumbar Support (Driver)",
          "Multi-function Steering Wheel"
        ],
        Technology: [
          "BMW Professional Navigation",
          "DAB Digital Radio",
          "Bluetooth Connectivity",
          "USB & AUX Input",
          "BMW ConnectedDrive",
          "Parking Sensors (Front & Rear)",
          "Rain Sensor with Automatic Headlights"
        ],
        Exterior: [
          "17-inch Alloy Wheels",
          "LED Headlights",
          "LED Daytime Running Lights",
          "Heated Windscreen Washers",
          "Chrome Exhaust Tailpipe",
          "Body-coloured Bumpers",
          "Metallic Paint"
        ]
      },
      
      // Vehicle Images (URLs would be actual image links in production)
      VehicleImages: {
        HasImages: true,
        ImageCount: "6",
        Images: [
          {
            ImageType: "FRONT",
            ImageUrl: "/api/placeholder/800/600",
            ThumbnailUrl: "/api/placeholder/200/150"
          },
          {
            ImageType: "REAR",
            ImageUrl: "/api/placeholder/800/600",
            ThumbnailUrl: "/api/placeholder/200/150"
          },
          {
            ImageType: "SIDE",
            ImageUrl: "/api/placeholder/800/600",
            ThumbnailUrl: "/api/placeholder/200/150"
          },
          {
            ImageType: "INTERIOR",
            ImageUrl: "/api/placeholder/800/600",
            ThumbnailUrl: "/api/placeholder/200/150"
          }
        ]
      },
      
      // Additional Information
      AdditionalInformation: {
        ManufacturerRecalls: {
          HasRecalls: false,
          RecallCount: "0",
          Recalls: []
        },
        
        ServiceHistory: {
          HasFullServiceHistory: true,
          ServiceCount: "4",
          LastServiceDate: "2024-02-15",
          LastServiceMileage: "38500",
          NextServiceDue: "2025-02-15",
          NextServiceMileage: "48500",
          ServiceRecords: [
            {
              ServiceDate: "2024-02-15",
              ServiceMileage: "38500",
              ServiceType: "ANNUAL SERVICE",
              ServiceDealer: "BMW MAIN DEALER",
              ServiceCost: "385.00"
            },
            {
              ServiceDate: "2023-02-20",
              ServiceMileage: "25000",
              ServiceType: "ANNUAL SERVICE",
              ServiceDealer: "BMW MAIN DEALER",
              ServiceCost: "365.00"
            }
          ]
        },
        
        WarrantyInformation: {
          HasWarranty: false,
          WarrantyEndDate: "2024-03-14",
          WarrantyType: "MANUFACTURER",
          WarrantyProvider: "BMW UK",
          ExtendedWarrantyAvailable: true
        },
        
        EcoInformation: {
          Co2EmissionsGpKm: "139",
          EuroEmissionStandard: "EURO 6",
          EmissionClass: "EURO 6D-TEMP",
          UlezCompliant: true,
          CazCompliant: true,
          RoadTaxBand: "G",
          BiKTaxBand: "30%"
        }
      }
    },
    
    // Metadata
    Success: true,
    Message: "Mock data generated successfully",
    DataSource: "Mock Vehicle Data Service",
    ResponseTime: "150ms",
    RequestId: "REQ-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
    Timestamp: new Date().toISOString(),
    ApiVersion: "2.0",
    DataQuality: {
      Completeness: "95%",
      LastUpdated: new Date().toISOString(),
      DataSources: ["DVLA", "MOT", "MIAFTR", "PNC", "VDI"]
    }
  };
}