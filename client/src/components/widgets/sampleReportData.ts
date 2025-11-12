// Comprehensive sample report data for luxury vehicle brands
// Each report contains all the fields expected by UnifiedVehicleReport component

export const createSampleReport = (brand: string) => {
  const reports: Record<string, any> = {
    "Rolls-Royce": {
      RequestInformation: {
        PackageName: "FullcheckAPI",
        DateOfRequest: new Date().toISOString(),
        SearchTerm: "RR24 PHM"
      },
      ResponseInformation: {
        StatusCode: "Success",
        StatusMessage: "Complete",
        QueryTimeMs: 287
      },
      BillingInformation: {
        PackageCost: 7.00,
        CurrencyCode: "GBP",
        TransactionCost: 7.00
      },
      Results: {
        VehicleDetails: {
          VehicleIdentification: {
            Vrm: "RR24 PHM",
            Vin: "SCA665C50LUX87654",
            VinLast5: "87654",
            EngineNumber: "RR67490001XPH",
            UkvdId: "RR-2024-PHM-001",
            Make: "ROLLS-ROYCE",
            Model: "PHANTOM EXTENDED",
            DvlaMake: "ROLLS-ROYCE",
            DvlaModel: "PHANTOM EXTENDED",
            Colour: "MIDNIGHT SAPPHIRE",
            DvlaColour: "MIDNIGHT SAPPHIRE",
            BodyType: "LUXURY SALOON",
            DvlaBodyType: "LUXURY SALOON",
            TransmissionType: "AUTOMATIC",
            DvlaTransmissionType: "AUTOMATIC",
            FuelType: "PETROL",
            DvlaFuelType: "PETROL",
            NumberOfDoors: 4,
            NumberOfSeats: 5,
            EngineSizeInCC: 6749,
            ManufactureDate: "2024-01-15",
            DateOfManufacture: "2024-01-15",
            FirstRegistrationDate: "2024-03-15",
            DateFirstRegistered: "2024-03-15",
            DateFirstRegisteredInUk: "2024-03-15",
            YearOfManufacture: 2024,
            WheelPlan: "2 AXLE RIGID BODY",
            DvlaWheelPlan: "2 AXLE RIGID BODY",
            VehicleCategory: "M1",
            UseClass: "PRIVATE/LIGHT GOODS",
            TypeApprovalNumber: "e11*2007/46*0851*00",
            VehicleUsedBeforeFirstRegistration: false,
            PreviousVrmNi: null
          },
          VehicleStatus: {
            TaxStatus: "TAXED",
            TaxDueDate: "2025-03-01",
            MotStatus: "VALID",
            MotExpiryDate: "2027-03-14",
            LastV5CIssueDate: "2024-03-15",
            Scrapped: false,
            ScrappedDate: null,
            Imported: false,
            Exported: false,
            ImportedDate: null,
            ExportedDate: null,
            WrittenOff: false,
            VicTested: false,
            VicTestDate: null,
            PlateChange: false
          },
          VehicleHistory: {
            V5CCount: 1,
            PlateChangeCount: 0,
            NumberOfPreviousKeepers: 0,
            KeeperChanges: [
              {
                DateOfTransaction: "2024-03-15",
                NumberOfPreviousKeepers: 0,
                TransferDate: "2024-03-15"
              }
            ],
            VicTestCount: 0,
            PlateChangeList: []
          },
          DvlaTechnicalDetails: {
            Co2Emissions: 347,
            EuroStatus: "EURO 6 DG",
            RealDrivingEmissions: "1",
            TaxBand: "M",
            TaxRate: 695,
            TopSpeed: 155,
            ZeroToSixty: 5.3,
            MaxPowerBHP: 571,
            MaxTorqueNM: 900,
            GrossVehicleWeight: 3250,
            KerbWeight: 2745,
            MaxTowingWeightBraked: 0,
            MaxTowingWeightUnbraked: 0,
            MinKerbWeight: 2745,
            MaxGrossWeight: 3250,
            Height: 1656,
            Length: 5982,
            Width: 2018,
            Wheelbase: 3772,
            FuelTankCapacityLitres: 100,
            GrossTrainWeight: 3250,
            LoadLength: null,
            DataVersionNumber: "1.0",
            EngineCapacity: 6749,
            PowerDelivery: "NORMAL ASPIRATION"
          }
        },
        ModelDetails: {
          MakeCode: "RR",
          ModelCode: "PHANTOM",
          ModelVariant: "EXTENDED",
          VehicleClassDescription: "LUXURY SALOON",
          BodyStyleDescription: "4 DOOR SALOON",
          EngineDescription: "V12 6.7L TWIN TURBO",
          TransmissionDescription: "8-SPEED AUTOMATIC",
          DrivetrainDescription: "REAR WHEEL DRIVE",
          ModelYear: 2024,
          ModelIntroductionDate: "2023-10-01",
          ModelDiscontinuedDate: null,
          IsCurrentModel: true
        },
        MotHistoryDetails: {
          RecordCount: 3,
          MotTestDetailsList: [
            {
              TestDate: "2024-03-14",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2027-03-14",
              OdometerReading: 1250,
              OdometerUnit: "mi",
              TestNumber: "831881004270",
              TestType: "NT",
              TestStation: "Rolls-Royce Mayfair Service",
              TestStationNumber: "V12345",
              DaysSinceLastTest: 0,
              DaysSinceLastPass: 395,
              DaysOutOfMot: 0,
              AdvisoryCount: 2,
              AdvisoryDetailsList: [
                {
                  Type: "ADVISORY",
                  Text: "Front Registration plate slightly faded but readable (0.1 (b))",
                  Category: "REGISTRATION PLATES"
                },
                {
                  Type: "ADVISORY", 
                  Text: "Nearside Front Tyre worn close to legal limit 2.8mm (5.2.3 (e))",
                  Category: "TYRES"
                }
              ],
              MinorDefectCount: 0,
              MinorDefectDetailsList: []
            }
          ],
          MotTestSummary: {
            TestCount: 1,
            FirstTestDate: "2024-03-14",
            LastTestDate: "2024-03-14",
            LastTestResult: "PASSED",
            LastTestMileage: 1250,
            HasFailures: false,
            HasAdvisories: true,
            HasDangerousDefects: false
          }
        },
        PncDetails: {
          IsStolen: false,
          DateReportedStolen: null,
          PoliceForceName: null,
          PoliceContactNumber: null,
          CrimeReferenceNumber: null,
          Status: "NOT STOLEN"
        },
        MiaftrDetails: {
          WriteOffRecordList: [],
          IsWrittenOff: false,
          HasBeenScrapped: false,
          ScrapMarkerDetails: null
        },
        FinanceDetails: {
          FinanceRecordList: [],
          RecordCount: 0
        },
        MileageCheckDetails: {
          MileageResultList: [
            {
              RecordDate: "2024-03-15",
              OdometerReading: 125,
              OdometerUnit: "mi",
              Source: "DEALER",
              DataSource: "Rolls-Royce Dealer Network"
            },
            {
              RecordDate: "2024-06-01",
              OdometerReading: 650,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Authorized Service Center"
            },
            {
              RecordDate: "2024-09-15",
              OdometerReading: 1100,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Rolls-Royce Service"
            },
            {
              RecordDate: "2025-01-15",
              OdometerReading: 1875,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Annual Service"
            }
          ],
          MileageAnomalyDetected: false,
          CalculatedAverageAnnualMileage: 2500,
          LastRecordedMileage: 1875,
          MileageReadingCount: 4
        },
        VehicleImageDetails: {
          VehicleImageList: [
            {
              ImageUrl: "https://example.com/rolls-royce-phantom-front.jpg",
              ImageCaption: "Front View",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/rolls-royce-phantom-side.jpg",
              ImageCaption: "Side Profile",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/rolls-royce-phantom-interior.jpg",
              ImageCaption: "Luxury Interior",
              ImageType: "INTERIOR"
            }
          ]
        },
        VehicleCodes: {
          Smmt: "RRP001",
          Dvla: "M1L",
          BodyCode: "SD",
          EngineCode: "V12T",
          TransmissionCode: "A8"
        },
        ValuationDetails: {
          ValuationDate: "2025-08-30",
          ValuationMileage: 1875,
          DealerForecourt: 425000,
          TradeRetail: 395000,
          PrivateClean: 385000,
          PartExchange: 375000,
          PrivateAverage: 380000,
          AuctionValue: 370000,
          TradeAverage: 365000,
          OnTheRoad: 435000,
          ValuationBook: "CAP",
          VehicleDescription: "Rolls-Royce Phantom Extended V12 Auto",
          DateOfFirstRegistration: "2024-03-15"
        },
        SpecAndOptionDetails: {
          StandardEquipmentList: [
            "Starlight Headliner",
            "Spirit of Ecstasy Illuminated",
            "Bespoke Audio System",
            "Rear Theatre Configuration",
            "Privacy Glass",
            "Picnic Tables",
            "Refrigerated Compartment",
            "Lambswool Floor Mats",
            "Adaptive LED Headlights",
            "Night Vision with Pedestrian Recognition"
          ],
          OptionalEquipmentList: [
            "Extended Wheelbase",
            "Bespoke Midnight Sapphire Paint",
            "Privacy Suite",
            "Champagne Cooler",
            "Silver-plated Champagne Flutes",
            "Starlight Doors",
            "Gallery Dashboard",
            "Personalized Treadplates"
          ],
          FactoryFittedOptions: "Extended Wheelbase, Privacy Suite, Starlight Doors, Gallery Dashboard",
          TotalOptionsValue: 125000
        },
        TyreDetails: {
          FrontTyreSize: "255/50 R21",
          RearTyreSize: "285/45 R21",
          FrontTyrePressure: "36 PSI",
          RearTyrePressure: "39 PSI",
          TyreSpeedRating: "Y",
          TyreLoadIndex: "108"
        }
      }
    },
    "Bentley": {
      RequestInformation: {
        PackageName: "FullcheckAPI",
        DateOfRequest: new Date().toISOString(),
        SearchTerm: "BT23 FLY"
      },
      ResponseInformation: {
        StatusCode: "Success",
        StatusMessage: "Complete",
        QueryTimeMs: 245
      },
      BillingInformation: {
        PackageCost: 7.00,
        CurrencyCode: "GBP",
        TransactionCost: 7.00
      },
      Results: {
        VehicleDetails: {
          VehicleIdentification: {
            Vrm: "BT23 FLY",
            Vin: "SCBBB9ZF4PC095432",
            VinLast5: "95432",
            EngineNumber: "BT6020003FLY",
            UkvdId: "BT-2023-FLY-001",
            Make: "BENTLEY",
            Model: "FLYING SPUR W12",
            DvlaMake: "BENTLEY",
            DvlaModel: "FLYING SPUR W12",
            Colour: "ONYX BLACK",
            DvlaColour: "ONYX BLACK",
            BodyType: "LUXURY SALOON",
            DvlaBodyType: "LUXURY SALOON",
            TransmissionType: "AUTOMATIC",
            DvlaTransmissionType: "AUTOMATIC",
            FuelType: "PETROL",
            DvlaFuelType: "PETROL",
            NumberOfDoors: 4,
            NumberOfSeats: 5,
            EngineSizeInCC: 5950,
            ManufactureDate: "2023-09-20",
            DateOfManufacture: "2023-09-20",
            FirstRegistrationDate: "2023-10-15",
            DateFirstRegistered: "2023-10-15",
            DateFirstRegisteredInUk: "2023-10-15",
            YearOfManufacture: 2023,
            WheelPlan: "2 AXLE RIGID BODY",
            DvlaWheelPlan: "2 AXLE RIGID BODY",
            VehicleCategory: "M1",
            UseClass: "PRIVATE/LIGHT GOODS",
            TypeApprovalNumber: "e13*2007/46*0892*00",
            VehicleUsedBeforeFirstRegistration: false,
            PreviousVrmNi: null
          },
          VehicleStatus: {
            TaxStatus: "TAXED",
            TaxDueDate: "2024-10-01",
            MotStatus: "VALID",
            MotExpiryDate: "2026-10-14",
            LastV5CIssueDate: "2023-10-15",
            Scrapped: false,
            ScrappedDate: null,
            Imported: false,
            Exported: false,
            ImportedDate: null,
            ExportedDate: null,
            WrittenOff: false,
            VicTested: false,
            VicTestDate: null,
            PlateChange: false
          },
          VehicleHistory: {
            V5CCount: 1,
            PlateChangeCount: 0,
            NumberOfPreviousKeepers: 1,
            KeeperChanges: [
              {
                DateOfTransaction: "2023-10-15",
                NumberOfPreviousKeepers: 0,
                TransferDate: "2023-10-15"
              },
              {
                DateOfTransaction: "2024-06-20",
                NumberOfPreviousKeepers: 1,
                TransferDate: "2024-06-20"
              }
            ],
            VicTestCount: 0,
            PlateChangeList: []
          },
          DvlaTechnicalDetails: {
            Co2Emissions: 317,
            EuroStatus: "EURO 6 DG",
            RealDrivingEmissions: "1",
            TaxBand: "M",
            TaxRate: 695,
            TopSpeed: 207,
            ZeroToSixty: 3.8,
            MaxPowerBHP: 626,
            MaxTorqueNM: 900,
            GrossVehicleWeight: 3250,
            KerbWeight: 2437,
            MaxTowingWeightBraked: 0,
            MaxTowingWeightUnbraked: 0,
            MinKerbWeight: 2437,
            MaxGrossWeight: 3250,
            Height: 1488,
            Length: 5316,
            Width: 1978,
            Wheelbase: 3195,
            FuelTankCapacityLitres: 90,
            GrossTrainWeight: 3250,
            LoadLength: null,
            DataVersionNumber: "1.0",
            EngineCapacity: 5950,
            PowerDelivery: "TWIN TURBO"
          }
        },
        ModelDetails: {
          MakeCode: "BE",
          ModelCode: "FLYINGSPUR",
          ModelVariant: "W12",
          VehicleClassDescription: "LUXURY SALOON",
          BodyStyleDescription: "4 DOOR SALOON",
          EngineDescription: "W12 6.0L TWIN TURBO",
          TransmissionDescription: "8-SPEED DUAL CLUTCH",
          DrivetrainDescription: "ALL WHEEL DRIVE",
          ModelYear: 2023,
          ModelIntroductionDate: "2023-03-01",
          ModelDiscontinuedDate: null,
          IsCurrentModel: true
        },
        MotHistoryDetails: {
          RecordCount: 2,
          MotTestDetailsList: [
            {
              TestDate: "2024-10-14",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2025-10-14",
              OdometerReading: 8750,
              OdometerUnit: "mi",
              TestNumber: "765432109876",
              TestType: "NT",
              TestStation: "Bentley Birmingham",
              TestStationNumber: "V54321",
              DaysSinceLastTest: 0,
              DaysSinceLastPass: 0,
              DaysOutOfMot: 0,
              AdvisoryCount: 3,
              AdvisoryDetailsList: [
                {
                  Type: "ADVISORY",
                  Text: "Offside Front brake disc worn, pitted or scored, but not seriously weakened (1.1.14 (a) (ii))",
                  Category: "BRAKES"
                },
                {
                  Type: "ADVISORY", 
                  Text: "Nearside Rear Tyre worn close to legal limit 3.0mm (5.2.3 (e))",
                  Category: "TYRES"
                },
                {
                  Type: "ADVISORY",
                  Text: "Front windscreen has damage to an area less than a 40mm circle outside zone A (3.2 (a) (i))",
                  Category: "VISIBILITY"
                }
              ],
              MinorDefectCount: 0,
              MinorDefectDetailsList: []
            },
            {
              TestDate: "2023-10-14",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2026-10-14",
              OdometerReading: 125,
              OdometerUnit: "mi",
              TestNumber: "234567890123",
              TestType: "NT",
              TestStation: "Bentley Birmingham",
              TestStationNumber: "V54321",
              DaysSinceLastTest: 365,
              DaysSinceLastPass: 365,
              DaysOutOfMot: 0,
              AdvisoryCount: 0,
              AdvisoryDetailsList: [],
              MinorDefectCount: 0,
              MinorDefectDetailsList: []
            }
          ],
          MotTestSummary: {
            TestCount: 2,
            FirstTestDate: "2023-10-14",
            LastTestDate: "2024-10-14",
            LastTestResult: "PASSED",
            LastTestMileage: 8750,
            HasFailures: false,
            HasAdvisories: true,
            HasDangerousDefects: false
          }
        },
        PncDetails: {
          IsStolen: false,
          DateReportedStolen: null,
          PoliceForceName: null,
          PoliceContactNumber: null,
          CrimeReferenceNumber: null,
          Status: "NOT STOLEN"
        },
        MiaftrDetails: {
          WriteOffRecordList: [],
          IsWrittenOff: false,
          HasBeenScrapped: false,
          ScrapMarkerDetails: null
        },
        FinanceDetails: {
          FinanceRecordList: [],
          RecordCount: 0
        },
        MileageCheckDetails: {
          MileageResultList: [
            {
              RecordDate: "2023-10-15",
              OdometerReading: 15,
              OdometerUnit: "mi",
              Source: "DEALER",
              DataSource: "Bentley Motors"
            },
            {
              RecordDate: "2024-01-15",
              OdometerReading: 2100,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Bentley Service"
            },
            {
              RecordDate: "2024-04-20",
              OdometerReading: 4500,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Bentley Service"
            },
            {
              RecordDate: "2024-07-15",
              OdometerReading: 6800,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Independent Specialist"
            },
            {
              RecordDate: "2024-10-14",
              OdometerReading: 8750,
              OdometerUnit: "mi",
              Source: "MOT",
              DataSource: "MOT Test"
            },
            {
              RecordDate: "2025-01-20",
              OdometerReading: 10500,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Bentley Service"
            }
          ],
          MileageAnomalyDetected: false,
          CalculatedAverageAnnualMileage: 8400,
          LastRecordedMileage: 10500,
          MileageReadingCount: 6
        },
        VehicleImageDetails: {
          VehicleImageList: [
            {
              ImageUrl: "https://example.com/bentley-flying-spur-front.jpg",
              ImageCaption: "Front View",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/bentley-flying-spur-side.jpg",
              ImageCaption: "Side Profile",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/bentley-flying-spur-interior.jpg",
              ImageCaption: "Handcrafted Interior",
              ImageType: "INTERIOR"
            }
          ]
        },
        VehicleCodes: {
          Smmt: "BEF001",
          Dvla: "M1L",
          BodyCode: "SD",
          EngineCode: "W12T",
          TransmissionCode: "A8D"
        },
        ValuationDetails: {
          ValuationDate: "2025-08-30",
          ValuationMileage: 10500,
          DealerForecourt: 185000,
          TradeRetail: 172000,
          PrivateClean: 168000,
          PartExchange: 164000,
          PrivateAverage: 166000,
          AuctionValue: 162000,
          TradeAverage: 160000,
          OnTheRoad: 195000,
          ValuationBook: "CAP",
          VehicleDescription: "Bentley Flying Spur W12 Auto AWD",
          DateOfFirstRegistration: "2023-10-15"
        },
        SpecAndOptionDetails: {
          StandardEquipmentList: [
            "Matrix LED Headlights",
            "Bentley Rotating Display",
            "Naim Audio System",
            "Adaptive Cruise Control",
            "Lane Assist",
            "Night Vision",
            "Head-up Display",
            "Panoramic Sunroof",
            "Heated & Ventilated Seats",
            "Massage Seats"
          ],
          OptionalEquipmentList: [
            "Mulliner Driving Specification",
            "Blackline Specification",
            "City Specification",
            "Touring Specification",
            "Mood Lighting",
            "Rear Entertainment",
            "22-inch Alloy Wheels",
            "Carbon Ceramic Brakes"
          ],
          FactoryFittedOptions: "Mulliner Driving Specification, Blackline Specification, 22-inch Alloy Wheels",
          TotalOptionsValue: 45000
        },
        TyreDetails: {
          FrontTyreSize: "275/40 R22",
          RearTyreSize: "315/35 R22",
          FrontTyrePressure: "38 PSI",
          RearTyrePressure: "41 PSI",
          TyreSpeedRating: "Y",
          TyreLoadIndex: "107"
        }
      }
    },
    "Ferrari": {
      RequestInformation: {
        PackageName: "FullcheckAPI",
        DateOfRequest: new Date().toISOString(),
        SearchTerm: "F458 SPD"
      },
      ResponseInformation: {
        StatusCode: "Success",
        StatusMessage: "Complete",
        QueryTimeMs: 198
      },
      BillingInformation: {
        PackageCost: 7.00,
        CurrencyCode: "GBP",
        TransactionCost: 7.00
      },
      Results: {
        VehicleDetails: {
          VehicleIdentification: {
            Vrm: "F458 SPD",
            Vin: "ZFF83CLA5L0234567",
            VinLast5: "34567",
            EngineNumber: "F136FB234567",
            UkvdId: "FE-2023-SPD-001",
            Make: "FERRARI",
            Model: "SF90 STRADALE",
            DvlaMake: "FERRARI",
            DvlaModel: "SF90 STRADALE",
            Colour: "ROSSO CORSA",
            DvlaColour: "ROSSO CORSA",
            BodyType: "COUPE",
            DvlaBodyType: "COUPE",
            TransmissionType: "AUTOMATIC",
            DvlaTransmissionType: "AUTOMATIC",
            FuelType: "PETROL HYBRID",
            DvlaFuelType: "PETROL HYBRID",
            NumberOfDoors: 2,
            NumberOfSeats: 2,
            EngineSizeInCC: 3990,
            ManufactureDate: "2023-06-15",
            DateOfManufacture: "2023-06-15",
            FirstRegistrationDate: "2023-07-20",
            DateFirstRegistered: "2023-07-20",
            DateFirstRegisteredInUk: "2023-07-20",
            YearOfManufacture: 2023,
            WheelPlan: "2 AXLE RIGID BODY",
            DvlaWheelPlan: "2 AXLE RIGID BODY",
            VehicleCategory: "M1",
            UseClass: "PRIVATE",
            TypeApprovalNumber: "e3*2007/46*0847*00",
            VehicleUsedBeforeFirstRegistration: false,
            PreviousVrmNi: null
          },
          VehicleStatus: {
            TaxStatus: "TAXED",
            TaxDueDate: "2024-07-01",
            MotStatus: "VALID",
            MotExpiryDate: "2026-07-19",
            LastV5CIssueDate: "2023-07-20",
            Scrapped: false,
            ScrappedDate: null,
            Imported: false,
            Exported: false,
            ImportedDate: null,
            ExportedDate: null,
            WrittenOff: false,
            VicTested: false,
            VicTestDate: null,
            PlateChange: false
          },
          VehicleHistory: {
            V5CCount: 1,
            PlateChangeCount: 0,
            NumberOfPreviousKeepers: 0,
            KeeperChanges: [
              {
                DateOfTransaction: "2023-07-20",
                NumberOfPreviousKeepers: 0,
                TransferDate: "2023-07-20"
              }
            ],
            VicTestCount: 0,
            PlateChangeList: []
          },
          DvlaTechnicalDetails: {
            Co2Emissions: 154,
            EuroStatus: "EURO 6 DG",
            RealDrivingEmissions: "1",
            TaxBand: "M",
            TaxRate: 695,
            TopSpeed: 211,
            ZeroToSixty: 2.5,
            MaxPowerBHP: 986,
            MaxTorqueNM: 800,
            GrossVehicleWeight: 1850,
            KerbWeight: 1570,
            MaxTowingWeightBraked: 0,
            MaxTowingWeightUnbraked: 0,
            MinKerbWeight: 1570,
            MaxGrossWeight: 1850,
            Height: 1186,
            Length: 4710,
            Width: 1972,
            Wheelbase: 2650,
            FuelTankCapacityLitres: 68,
            GrossTrainWeight: 1850,
            LoadLength: null,
            DataVersionNumber: "1.0",
            EngineCapacity: 3990,
            PowerDelivery: "TWIN TURBO HYBRID"
          }
        },
        ModelDetails: {
          MakeCode: "FE",
          ModelCode: "SF90",
          ModelVariant: "STRADALE",
          VehicleClassDescription: "SUPERCAR",
          BodyStyleDescription: "2 DOOR COUPE",
          EngineDescription: "V8 4.0L TWIN TURBO HYBRID",
          TransmissionDescription: "8-SPEED DUAL CLUTCH",
          DrivetrainDescription: "ALL WHEEL DRIVE",
          ModelYear: 2023,
          ModelIntroductionDate: "2022-09-01",
          ModelDiscontinuedDate: null,
          IsCurrentModel: true
        },
        MotHistoryDetails: {
          RecordCount: 2,
          MotTestDetailsList: [
            {
              TestDate: "2024-07-19",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2025-07-19",
              OdometerReading: 4250,
              OdometerUnit: "mi",
              TestNumber: "458901234567",
              TestType: "NT",
              TestStation: "Ferrari Maranello London",
              TestStationNumber: "V78901",
              DaysSinceLastTest: 0,
              DaysSinceLastPass: 0,
              DaysOutOfMot: 0,
              AdvisoryCount: 1,
              AdvisoryDetailsList: [
                {
                  Type: "ADVISORY",
                  Text: "Nearside Front Tyre worn close to legal limit 3.2mm (5.2.3 (e))",
                  Category: "TYRES"
                }
              ],
              MinorDefectCount: 0,
              MinorDefectDetailsList: []
            },
            {
              TestDate: "2023-07-19",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2026-07-19",
              OdometerReading: 125,
              OdometerUnit: "mi",
              TestNumber: "789012345678",
              TestType: "NT",
              TestStation: "Ferrari Maranello London",
              TestStationNumber: "V78901",
              DaysSinceLastTest: 365,
              DaysSinceLastPass: 365,
              DaysOutOfMot: 0,
              AdvisoryCount: 0,
              AdvisoryDetailsList: [],
              MinorDefectCount: 0,
              MinorDefectDetailsList: []
            }
          ],
          MotTestSummary: {
            TestCount: 2,
            FirstTestDate: "2023-07-19",
            LastTestDate: "2024-07-19",
            LastTestResult: "PASSED",
            LastTestMileage: 4250,
            HasFailures: false,
            HasAdvisories: true,
            HasDangerousDefects: false
          }
        },
        PncDetails: {
          IsStolen: false,
          DateReportedStolen: null,
          PoliceForceName: null,
          PoliceContactNumber: null,
          CrimeReferenceNumber: null,
          Status: "NOT STOLEN"
        },
        MiaftrDetails: {
          WriteOffRecordList: [],
          IsWrittenOff: false,
          HasBeenScrapped: false,
          ScrapMarkerDetails: null
        },
        FinanceDetails: {
          FinanceRecordList: [],
          RecordCount: 0
        },
        MileageCheckDetails: {
          MileageResultList: [
            {
              RecordDate: "2023-07-20",
              OdometerReading: 12,
              OdometerUnit: "mi",
              Source: "DEALER",
              DataSource: "Ferrari UK"
            },
            {
              RecordDate: "2023-10-15",
              OdometerReading: 850,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Ferrari Service"
            },
            {
              RecordDate: "2024-02-20",
              OdometerReading: 2100,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Ferrari Service"
            },
            {
              RecordDate: "2024-06-15",
              OdometerReading: 3800,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Ferrari Service"
            },
            {
              RecordDate: "2024-07-19",
              OdometerReading: 4250,
              OdometerUnit: "mi",
              Source: "MOT",
              DataSource: "MOT Test"
            },
            {
              RecordDate: "2024-12-20",
              OdometerReading: 5900,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Ferrari Service"
            }
          ],
          MileageAnomalyDetected: false,
          CalculatedAverageAnnualMileage: 4200,
          LastRecordedMileage: 5900,
          MileageReadingCount: 6
        },
        VehicleImageDetails: {
          VehicleImageList: [
            {
              ImageUrl: "https://example.com/ferrari-sf90-front.jpg",
              ImageCaption: "Front View",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/ferrari-sf90-side.jpg",
              ImageCaption: "Side Profile",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/ferrari-sf90-interior.jpg",
              ImageCaption: "Racing Interior",
              ImageType: "INTERIOR"
            }
          ]
        },
        VehicleCodes: {
          Smmt: "FES001",
          Dvla: "M1S",
          BodyCode: "CP",
          EngineCode: "V8TH",
          TransmissionCode: "D8"
        },
        ValuationDetails: {
          ValuationDate: "2025-08-30",
          ValuationMileage: 5900,
          DealerForecourt: 385000,
          TradeRetail: 365000,
          PrivateClean: 355000,
          PartExchange: 345000,
          PrivateAverage: 350000,
          AuctionValue: 340000,
          TradeAverage: 335000,
          OnTheRoad: 395000,
          ValuationBook: "CAP",
          VehicleDescription: "Ferrari SF90 Stradale V8 Hybrid Auto AWD",
          DateOfFirstRegistration: "2023-07-20"
        },
        SpecAndOptionDetails: {
          StandardEquipmentList: [
            "Carbon Fiber Racing Seats",
            "Ferrari Dynamic Enhancer",
            "Side Slip Control 6.1",
            "E-Diff3 Electronic Differential",
            "F1-Trac Traction Control",
            "SCM-E Magnetorheological Damping",
            "Carbon Ceramic Brakes",
            "Manettino Drive Mode Selector",
            "7-inch Passenger Display",
            "16-inch Digital Cluster"
          ],
          OptionalEquipmentList: [
            "Assetto Fiorano Package",
            "Racing Stripe Livery",
            "Titanium Exhaust System",
            "Carbon Fiber Wheels",
            "Scuderia Ferrari Shields",
            "Full Carbon Interior Package",
            "Telemetry System",
            "Passenger Display"
          ],
          FactoryFittedOptions: "Assetto Fiorano Package, Carbon Fiber Wheels, Scuderia Ferrari Shields",
          TotalOptionsValue: 95000
        },
        TyreDetails: {
          FrontTyreSize: "255/35 ZR20",
          RearTyreSize: "315/30 ZR20",
          FrontTyrePressure: "32 PSI",
          RearTyrePressure: "35 PSI",
          TyreSpeedRating: "Y",
          TyreLoadIndex: "94/102"
        }
      }
    },
    "Lamborghini": {
      RequestInformation: {
        PackageName: "FullcheckAPI",
        DateOfRequest: new Date().toISOString(),
        SearchTerm: "LA23 MBO"
      },
      ResponseInformation: {
        StatusCode: "Success",
        StatusMessage: "Complete",
        QueryTimeMs: 212
      },
      BillingInformation: {
        PackageCost: 7.00,
        CurrencyCode: "GBP",
        TransactionCost: 7.00
      },
      Results: {
        VehicleDetails: {
          VehicleIdentification: {
            Vrm: "LA23 MBO",
            Vin: "ZHWEF9ZF8PLA15432",
            VinLast5: "15432",
            EngineNumber: "LMB654001REV",
            UkvdId: "LB-2024-MBO-001",
            Make: "LAMBORGHINI",
            Model: "REVUELTO",
            DvlaMake: "LAMBORGHINI",
            DvlaModel: "REVUELTO HYBRID",
            Colour: "ARANCIO APODIS",
            DvlaColour: "ARANCIO APODIS",
            BodyType: "COUPE",
            DvlaBodyType: "COUPE",
            TransmissionType: "AUTOMATIC",
            DvlaTransmissionType: "AUTOMATIC",
            FuelType: "PETROL HYBRID",
            DvlaFuelType: "PETROL HYBRID",
            NumberOfDoors: 2,
            NumberOfSeats: 2,
            EngineSizeInCC: 6498,
            ManufactureDate: "2024-02-10",
            DateOfManufacture: "2024-02-10",
            FirstRegistrationDate: "2024-03-25",
            DateFirstRegistered: "2024-03-25",
            DateFirstRegisteredInUk: "2024-03-25",
            YearOfManufacture: 2024,
            WheelPlan: "2 AXLE RIGID BODY",
            DvlaWheelPlan: "2 AXLE RIGID BODY",
            VehicleCategory: "M1",
            UseClass: "PRIVATE",
            TypeApprovalNumber: "e4*2007/46*0869*00",
            VehicleUsedBeforeFirstRegistration: false,
            PreviousVrmNi: null
          },
          VehicleStatus: {
            TaxStatus: "TAXED",
            TaxDueDate: "2025-03-01",
            MotStatus: "VALID",
            MotExpiryDate: "2027-03-24",
            LastV5CIssueDate: "2024-03-25",
            Scrapped: false,
            ScrappedDate: null,
            Imported: false,
            Exported: false,
            ImportedDate: null,
            ExportedDate: null,
            WrittenOff: false,
            VicTested: false,
            VicTestDate: null,
            PlateChange: false
          },
          VehicleHistory: {
            V5CCount: 1,
            PlateChangeCount: 0,
            NumberOfPreviousKeepers: 0,
            KeeperChanges: [
              {
                DateOfTransaction: "2024-03-25",
                NumberOfPreviousKeepers: 0,
                TransferDate: "2024-03-25"
              }
            ],
            VicTestCount: 0,
            PlateChangeList: []
          },
          DvlaTechnicalDetails: {
            Co2Emissions: 276,
            EuroStatus: "EURO 6 DG",
            RealDrivingEmissions: "1",
            TaxBand: "M",
            TaxRate: 695,
            TopSpeed: 217,
            ZeroToSixty: 2.5,
            MaxPowerBHP: 1001,
            MaxTorqueNM: 725,
            GrossVehicleWeight: 1950,
            KerbWeight: 1772,
            MaxTowingWeightBraked: 0,
            MaxTowingWeightUnbraked: 0,
            MinKerbWeight: 1772,
            MaxGrossWeight: 1950,
            Height: 1160,
            Length: 4947,
            Width: 2033,
            Wheelbase: 2779,
            FuelTankCapacityLitres: 75,
            GrossTrainWeight: 1950,
            LoadLength: null,
            DataVersionNumber: "1.0",
            EngineCapacity: 6498,
            PowerDelivery: "HYBRID"
          }
        },
        ModelDetails: {
          MakeCode: "LA",
          ModelCode: "REVUELTO",
          ModelVariant: "LP1001",
          VehicleClassDescription: "HYPERCAR",
          BodyStyleDescription: "2 DOOR COUPE",
          EngineDescription: "V12 6.5L HYBRID",
          TransmissionDescription: "8-SPEED DUAL CLUTCH",
          DrivetrainDescription: "ALL WHEEL DRIVE",
          ModelYear: 2024,
          ModelIntroductionDate: "2023-11-01",
          ModelDiscontinuedDate: null,
          IsCurrentModel: true
        },
        MotHistoryDetails: {
          RecordCount: 1,
          MotTestDetailsList: [
            {
              TestDate: "2024-03-24",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2027-03-24",
              OdometerReading: 650,
              OdometerUnit: "mi",
              TestNumber: "567890123456",
              TestType: "NT",
              TestStation: "Lamborghini London",
              TestStationNumber: "V65432",
              DaysSinceLastTest: 0,
              DaysSinceLastPass: 0,
              DaysOutOfMot: 0,
              AdvisoryCount: 0,
              AdvisoryDetailsList: [],
              MinorDefectCount: 0,
              MinorDefectDetailsList: []
            }
          ],
          MotTestSummary: {
            TestCount: 1,
            FirstTestDate: "2024-03-24",
            LastTestDate: "2024-03-24",
            LastTestResult: "PASSED",
            LastTestMileage: 650,
            HasFailures: false,
            HasAdvisories: false,
            HasDangerousDefects: false
          }
        },
        PncDetails: {
          IsStolen: false,
          DateReportedStolen: null,
          PoliceForceName: null,
          PoliceContactNumber: null,
          CrimeReferenceNumber: null,
          Status: "NOT STOLEN"
        },
        MiaftrDetails: {
          WriteOffRecordList: [],
          IsWrittenOff: false,
          HasBeenScrapped: false,
          ScrapMarkerDetails: null
        },
        FinanceDetails: {
          FinanceRecordList: [],
          RecordCount: 0
        },
        MileageCheckDetails: {
          MileageResultList: [
            {
              RecordDate: "2024-03-25",
              OdometerReading: 8,
              OdometerUnit: "mi",
              Source: "DEALER",
              DataSource: "Lamborghini UK"
            },
            {
              RecordDate: "2024-06-15",
              OdometerReading: 450,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Lamborghini Service"
            },
            {
              RecordDate: "2024-09-20",
              OdometerReading: 1100,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Lamborghini Service"
            },
            {
              RecordDate: "2025-01-15",
              OdometerReading: 1850,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Lamborghini Service"
            }
          ],
          MileageAnomalyDetected: false,
          CalculatedAverageAnnualMileage: 2200,
          LastRecordedMileage: 1850,
          MileageReadingCount: 4
        },
        VehicleImageDetails: {
          VehicleImageList: [
            {
              ImageUrl: "https://example.com/lamborghini-revuelto-front.jpg",
              ImageCaption: "Front View",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/lamborghini-revuelto-side.jpg",
              ImageCaption: "Side Profile",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/lamborghini-revuelto-interior.jpg",
              ImageCaption: "Fighter Jet Interior",
              ImageType: "INTERIOR"
            }
          ]
        },
        VehicleCodes: {
          Smmt: "LAR001",
          Dvla: "M1S",
          BodyCode: "CP",
          EngineCode: "V12H",
          TransmissionCode: "D8"
        },
        ValuationDetails: {
          ValuationDate: "2025-08-30",
          ValuationMileage: 1850,
          DealerForecourt: 580000,
          TradeRetail: 550000,
          PrivateClean: 535000,
          PartExchange: 520000,
          PrivateAverage: 527500,
          AuctionValue: 510000,
          TradeAverage: 505000,
          OnTheRoad: 595000,
          ValuationBook: "CAP",
          VehicleDescription: "Lamborghini Revuelto V12 Hybrid Auto AWD",
          DateOfFirstRegistration: "2024-03-25"
        },
        SpecAndOptionDetails: {
          StandardEquipmentList: [
            "LDVI 2.0 Dynamics System",
            "Carbon Ceramic Brakes",
            "Lamborghini Connect",
            "Magneto-rheological Suspension",
            "Rear-wheel Steering",
            "Torque Vectoring",
            "Launch Control",
            "ANIMA Drive Modes",
            "12.3-inch Digital Cockpit",
            "8.4-inch Central Display"
          ],
          OptionalEquipmentList: [
            "Ad Personam Customization",
            "Carbon Fiber Exterior Package",
            "Titanium Exhaust System",
            "Carbon Fiber Engine Cover",
            "Hexagon Interior Stitching",
            "Transparent Engine Bonnet",
            "Lifting System",
            "Sensonum Sound System"
          ],
          FactoryFittedOptions: "Ad Personam Customization, Carbon Fiber Exterior Package, Transparent Engine Bonnet",
          TotalOptionsValue: 125000
        },
        TyreDetails: {
          FrontTyreSize: "265/35 ZR20",
          RearTyreSize: "345/30 ZR21",
          FrontTyrePressure: "32 PSI",
          RearTyrePressure: "35 PSI",
          TyreSpeedRating: "Y",
          TyreLoadIndex: "97/105"
        }
      }
    },
    "McLaren": {
      RequestInformation: {
        PackageName: "FullcheckAPI",
        DateOfRequest: new Date().toISOString(),
        SearchTerm: "MC23 LRN"
      },
      ResponseInformation: {
        StatusCode: "Success",
        StatusMessage: "Complete",
        QueryTimeMs: 176
      },
      BillingInformation: {
        PackageCost: 7.00,
        CurrencyCode: "GBP",
        TransactionCost: 7.00
      },
      Results: {
        VehicleDetails: {
          VehicleIdentification: {
            Vrm: "MC23 LRN",
            Vin: "SBM15ACA6PW005432",
            VinLast5: "05432",
            EngineNumber: "MCL4000765TP",
            UkvdId: "MC-2023-LRN-001",
            Make: "MCLAREN",
            Model: "750S",
            DvlaMake: "MCLAREN",
            DvlaModel: "750S COUPE",
            Colour: "PAPAYA SPARK",
            DvlaColour: "PAPAYA SPARK",
            BodyType: "COUPE",
            DvlaBodyType: "COUPE",
            TransmissionType: "AUTOMATIC",
            DvlaTransmissionType: "AUTOMATIC",
            FuelType: "PETROL",
            DvlaFuelType: "PETROL",
            NumberOfDoors: 2,
            NumberOfSeats: 2,
            EngineSizeInCC: 3994,
            ManufactureDate: "2023-11-10",
            DateOfManufacture: "2023-11-10",
            FirstRegistrationDate: "2023-12-15",
            DateFirstRegistered: "2023-12-15",
            DateFirstRegisteredInUk: "2023-12-15",
            YearOfManufacture: 2023,
            WheelPlan: "2 AXLE RIGID BODY",
            DvlaWheelPlan: "2 AXLE RIGID BODY",
            VehicleCategory: "M1",
            UseClass: "PRIVATE",
            TypeApprovalNumber: "e11*2007/46*0875*00",
            VehicleUsedBeforeFirstRegistration: false,
            PreviousVrmNi: null
          },
          VehicleStatus: {
            TaxStatus: "TAXED",
            TaxDueDate: "2024-12-01",
            MotStatus: "VALID",
            MotExpiryDate: "2026-12-14",
            LastV5CIssueDate: "2023-12-15",
            Scrapped: false,
            ScrappedDate: null,
            Imported: false,
            Exported: false,
            ImportedDate: null,
            ExportedDate: null,
            WrittenOff: false,
            VicTested: false,
            VicTestDate: null,
            PlateChange: false
          },
          VehicleHistory: {
            V5CCount: 1,
            PlateChangeCount: 0,
            NumberOfPreviousKeepers: 0,
            KeeperChanges: [
              {
                DateOfTransaction: "2023-12-15",
                NumberOfPreviousKeepers: 0,
                TransferDate: "2023-12-15"
              }
            ],
            VicTestCount: 0,
            PlateChangeList: []
          },
          DvlaTechnicalDetails: {
            Co2Emissions: 276,
            EuroStatus: "EURO 6 DG",
            RealDrivingEmissions: "1",
            TaxBand: "M",
            TaxRate: 695,
            TopSpeed: 206,
            ZeroToSixty: 2.8,
            MaxPowerBHP: 740,
            MaxTorqueNM: 800,
            GrossVehicleWeight: 1650,
            KerbWeight: 1389,
            MaxTowingWeightBraked: 0,
            MaxTowingWeightUnbraked: 0,
            MinKerbWeight: 1389,
            MaxGrossWeight: 1650,
            Height: 1196,
            Length: 4569,
            Width: 2161,
            Wheelbase: 2670,
            FuelTankCapacityLitres: 72,
            GrossTrainWeight: 1650,
            LoadLength: null,
            DataVersionNumber: "1.0",
            EngineCapacity: 3994,
            PowerDelivery: "TWIN TURBO"
          }
        },
        ModelDetails: {
          MakeCode: "MC",
          ModelCode: "750S",
          ModelVariant: "COUPE",
          VehicleClassDescription: "SUPERCAR",
          BodyStyleDescription: "2 DOOR COUPE",
          EngineDescription: "V8 4.0L TWIN TURBO",
          TransmissionDescription: "7-SPEED DUAL CLUTCH",
          DrivetrainDescription: "REAR WHEEL DRIVE",
          ModelYear: 2023,
          ModelIntroductionDate: "2023-04-01",
          ModelDiscontinuedDate: null,
          IsCurrentModel: true
        },
        MotHistoryDetails: {
          RecordCount: 2,
          MotTestDetailsList: [
            {
              TestDate: "2024-12-14",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2025-12-14",
              OdometerReading: 3200,
              OdometerUnit: "mi",
              TestNumber: "890123456789",
              TestType: "NT",
              TestStation: "McLaren Ascot",
              TestStationNumber: "V89012",
              DaysSinceLastTest: 0,
              DaysSinceLastPass: 0,
              DaysOutOfMot: 0,
              AdvisoryCount: 2,
              AdvisoryDetailsList: [
                {
                  Type: "ADVISORY",
                  Text: "Offside Rear Tyre worn close to legal limit 3.1mm (5.2.3 (e))",
                  Category: "TYRES"
                },
                {
                  Type: "ADVISORY",
                  Text: "Front brake disc worn, pitted or scored, but not seriously weakened (1.1.14 (a) (ii))",
                  Category: "BRAKES"
                }
              ],
              MinorDefectCount: 0,
              MinorDefectDetailsList: []
            },
            {
              TestDate: "2023-12-14",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2026-12-14",
              OdometerReading: 85,
              OdometerUnit: "mi",
              TestNumber: "123456789012",
              TestType: "NT",
              TestStation: "McLaren Ascot",
              TestStationNumber: "V89012",
              DaysSinceLastTest: 365,
              DaysSinceLastPass: 365,
              DaysOutOfMot: 0,
              AdvisoryCount: 0,
              AdvisoryDetailsList: [],
              MinorDefectCount: 0,
              MinorDefectDetailsList: []
            }
          ],
          MotTestSummary: {
            TestCount: 2,
            FirstTestDate: "2023-12-14",
            LastTestDate: "2024-12-14",
            LastTestResult: "PASSED",
            LastTestMileage: 3200,
            HasFailures: false,
            HasAdvisories: true,
            HasDangerousDefects: false
          }
        },
        PncDetails: {
          IsStolen: false,
          DateReportedStolen: null,
          PoliceForceName: null,
          PoliceContactNumber: null,
          CrimeReferenceNumber: null,
          Status: "NOT STOLEN"
        },
        MiaftrDetails: {
          WriteOffRecordList: [],
          IsWrittenOff: false,
          HasBeenScrapped: false,
          ScrapMarkerDetails: null
        },
        FinanceDetails: {
          FinanceRecordList: [],
          RecordCount: 0
        },
        MileageCheckDetails: {
          MileageResultList: [
            {
              RecordDate: "2023-12-15",
              OdometerReading: 10,
              OdometerUnit: "mi",
              Source: "DEALER",
              DataSource: "McLaren Automotive"
            },
            {
              RecordDate: "2024-03-20",
              OdometerReading: 750,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "McLaren Service"
            },
            {
              RecordDate: "2024-07-15",
              OdometerReading: 1900,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "McLaren Service"
            },
            {
              RecordDate: "2024-11-20",
              OdometerReading: 3100,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "McLaren Service"
            },
            {
              RecordDate: "2024-12-14",
              OdometerReading: 3200,
              OdometerUnit: "mi",
              Source: "MOT",
              DataSource: "MOT Test"
            },
            {
              RecordDate: "2025-02-15",
              OdometerReading: 3850,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "McLaren Service"
            }
          ],
          MileageAnomalyDetected: false,
          CalculatedAverageAnnualMileage: 3100,
          LastRecordedMileage: 3850,
          MileageReadingCount: 6
        },
        VehicleImageDetails: {
          VehicleImageList: [
            {
              ImageUrl: "https://example.com/mclaren-750s-front.jpg",
              ImageCaption: "Front View",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/mclaren-750s-side.jpg",
              ImageCaption: "Side Profile",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/mclaren-750s-interior.jpg",
              ImageCaption: "Driver-Focused Interior",
              ImageType: "INTERIOR"
            }
          ]
        },
        VehicleCodes: {
          Smmt: "MC7001",
          Dvla: "M1S",
          BodyCode: "CP",
          EngineCode: "V8TT",
          TransmissionCode: "D7"
        },
        ValuationDetails: {
          ValuationDate: "2025-08-30",
          ValuationMileage: 3850,
          DealerForecourt: 285000,
          TradeRetail: 268000,
          PrivateClean: 262000,
          PartExchange: 255000,
          PrivateAverage: 258500,
          AuctionValue: 250000,
          TradeAverage: 248000,
          OnTheRoad: 295000,
          ValuationBook: "CAP",
          VehicleDescription: "McLaren 750S V8 Twin Turbo Auto",
          DateOfFirstRegistration: "2023-12-15"
        },
        SpecAndOptionDetails: {
          StandardEquipmentList: [
            "McLaren Control II",
            "Proactive Chassis Control III",
            "Variable Drift Control",
            "Carbon Ceramic Brakes",
            "Adaptive Suspension",
            "Launch Control",
            "Track Telemetry",
            "8-inch Infotainment Display",
            "McLaren Track Telemetry",
            "Vehicle Lift System"
          ],
          OptionalEquipmentList: [
            "MSO Defined Paint",
            "Carbon Fiber Racing Seats",
            "Clubsport Pack",
            "Super-Lightweight Wheels",
            "Sports Exhaust",
            "Carbon Fiber Interior Pack",
            "Bowers & Wilkins Audio",
            "Security Pack"
          ],
          FactoryFittedOptions: "MSO Defined Papaya Spark Paint, Clubsport Pack, Carbon Fiber Interior Pack",
          TotalOptionsValue: 65000
        },
        TyreDetails: {
          FrontTyreSize: "245/35 ZR19",
          RearTyreSize: "305/30 ZR20",
          FrontTyrePressure: "32 PSI",
          RearTyrePressure: "35 PSI",
          TyreSpeedRating: "Y",
          TyreLoadIndex: "93/101"
        }
      }
    },
    "Aston Martin": {
      RequestInformation: {
        PackageName: "FullcheckAPI",
        DateOfRequest: new Date().toISOString(),
        SearchTerm: "AM24 DBS"
      },
      ResponseInformation: {
        StatusCode: "Success",
        StatusMessage: "Complete",
        QueryTimeMs: 234
      },
      BillingInformation: {
        PackageCost: 7.00,
        CurrencyCode: "GBP",
        TransactionCost: 7.00
      },
      Results: {
        VehicleDetails: {
          VehicleIdentification: {
            Vrm: "AM24 DBS",
            Vin: "SCFRMFAV3PGL20123",
            VinLast5: "20123",
            EngineNumber: "AM5200876DBS",
            UkvdId: "AM-2024-DBS-001",
            Make: "ASTON MARTIN",
            Model: "DBS SUPERLEGGERA",
            DvlaMake: "ASTON MARTIN",
            DvlaModel: "DBS SUPERLEGGERA",
            Colour: "XENON GREY",
            DvlaColour: "XENON GREY",
            BodyType: "COUPE",
            DvlaBodyType: "COUPE",
            TransmissionType: "AUTOMATIC",
            DvlaTransmissionType: "AUTOMATIC",
            FuelType: "PETROL",
            DvlaFuelType: "PETROL",
            NumberOfDoors: 2,
            NumberOfSeats: 4,
            EngineSizeInCC: 5204,
            ManufactureDate: "2024-01-20",
            DateOfManufacture: "2024-01-20",
            FirstRegistrationDate: "2024-02-28",
            DateFirstRegistered: "2024-02-28",
            DateFirstRegisteredInUk: "2024-02-28",
            YearOfManufacture: 2024,
            WheelPlan: "2 AXLE RIGID BODY",
            DvlaWheelPlan: "2 AXLE RIGID BODY",
            VehicleCategory: "M1",
            UseClass: "PRIVATE",
            TypeApprovalNumber: "e11*2007/46*0883*00",
            VehicleUsedBeforeFirstRegistration: false,
            PreviousVrmNi: null
          },
          VehicleStatus: {
            TaxStatus: "TAXED",
            TaxDueDate: "2025-02-01",
            MotStatus: "VALID",
            MotExpiryDate: "2027-02-27",
            LastV5CIssueDate: "2024-02-28",
            Scrapped: false,
            ScrappedDate: null,
            Imported: false,
            Exported: false,
            ImportedDate: null,
            ExportedDate: null,
            WrittenOff: false,
            VicTested: false,
            VicTestDate: null,
            PlateChange: false
          },
          VehicleHistory: {
            V5CCount: 1,
            PlateChangeCount: 0,
            NumberOfPreviousKeepers: 0,
            KeeperChanges: [
              {
                DateOfTransaction: "2024-02-28",
                NumberOfPreviousKeepers: 0,
                TransferDate: "2024-02-28"
              }
            ],
            VicTestCount: 0,
            PlateChangeList: []
          },
          DvlaTechnicalDetails: {
            Co2Emissions: 285,
            EuroStatus: "EURO 6 DG",
            RealDrivingEmissions: "1",
            TaxBand: "M",
            TaxRate: 695,
            TopSpeed: 211,
            ZeroToSixty: 3.4,
            MaxPowerBHP: 715,
            MaxTorqueNM: 900,
            GrossVehicleWeight: 2100,
            KerbWeight: 1693,
            MaxTowingWeightBraked: 0,
            MaxTowingWeightUnbraked: 0,
            MinKerbWeight: 1693,
            MaxGrossWeight: 2100,
            Height: 1280,
            Length: 4712,
            Width: 1968,
            Wheelbase: 2805,
            FuelTankCapacityLitres: 78,
            GrossTrainWeight: 2100,
            LoadLength: null,
            DataVersionNumber: "1.0",
            EngineCapacity: 5204,
            PowerDelivery: "TWIN TURBO"
          }
        },
        ModelDetails: {
          MakeCode: "AM",
          ModelCode: "DBS",
          ModelVariant: "SUPERLEGGERA",
          VehicleClassDescription: "GRAND TOURER",
          BodyStyleDescription: "2 DOOR COUPE",
          EngineDescription: "V12 5.2L TWIN TURBO",
          TransmissionDescription: "8-SPEED AUTOMATIC",
          DrivetrainDescription: "REAR WHEEL DRIVE",
          ModelYear: 2024,
          ModelIntroductionDate: "2023-06-01",
          ModelDiscontinuedDate: null,
          IsCurrentModel: true
        },
        MotHistoryDetails: {
          RecordCount: 1,
          MotTestDetailsList: [
            {
              TestDate: "2024-02-27",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2027-02-27",
              OdometerReading: 950,
              OdometerUnit: "mi",
              TestNumber: "345678901234",
              TestType: "NT",
              TestStation: "Aston Martin Works",
              TestStationNumber: "V34567",
              DaysSinceLastTest: 0,
              DaysSinceLastPass: 0,
              DaysOutOfMot: 0,
              AdvisoryCount: 1,
              AdvisoryDetailsList: [
                {
                  Type: "ADVISORY",
                  Text: "Nearside Front wheel bearing has slight play (5.1.3 (a) (i))",
                  Category: "WHEEL BEARINGS"
                }
              ],
              MinorDefectCount: 0,
              MinorDefectDetailsList: []
            }
          ],
          MotTestSummary: {
            TestCount: 1,
            FirstTestDate: "2024-02-27",
            LastTestDate: "2024-02-27",
            LastTestResult: "PASSED",
            LastTestMileage: 950,
            HasFailures: false,
            HasAdvisories: true,
            HasDangerousDefects: false
          }
        },
        PncDetails: {
          IsStolen: false,
          DateReportedStolen: null,
          PoliceForceName: null,
          PoliceContactNumber: null,
          CrimeReferenceNumber: null,
          Status: "NOT STOLEN"
        },
        MiaftrDetails: {
          WriteOffRecordList: [],
          IsWrittenOff: false,
          HasBeenScrapped: false,
          ScrapMarkerDetails: null
        },
        FinanceDetails: {
          FinanceRecordList: [],
          RecordCount: 0
        },
        MileageCheckDetails: {
          MileageResultList: [
            {
              RecordDate: "2024-02-28",
              OdometerReading: 15,
              OdometerUnit: "mi",
              Source: "DEALER",
              DataSource: "Aston Martin UK"
            },
            {
              RecordDate: "2024-05-15",
              OdometerReading: 850,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Aston Martin Service"
            },
            {
              RecordDate: "2024-08-20",
              OdometerReading: 1650,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Aston Martin Service"
            },
            {
              RecordDate: "2024-12-15",
              OdometerReading: 2400,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Aston Martin Service"
            },
            {
              RecordDate: "2025-03-20",
              OdometerReading: 3100,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Aston Martin Service"
            }
          ],
          MileageAnomalyDetected: false,
          CalculatedAverageAnnualMileage: 2500,
          LastRecordedMileage: 3100,
          MileageReadingCount: 5
        },
        VehicleImageDetails: {
          VehicleImageList: [
            {
              ImageUrl: "https://example.com/aston-martin-dbs-front.jpg",
              ImageCaption: "Front View",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/aston-martin-dbs-side.jpg",
              ImageCaption: "Side Profile",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/aston-martin-dbs-interior.jpg",
              ImageCaption: "Luxurious Interior",
              ImageType: "INTERIOR"
            }
          ]
        },
        VehicleCodes: {
          Smmt: "AMD001",
          Dvla: "M1G",
          BodyCode: "CP",
          EngineCode: "V12TT",
          TransmissionCode: "A8"
        },
        ValuationDetails: {
          ValuationDate: "2025-08-30",
          ValuationMileage: 3100,
          DealerForecourt: 245000,
          TradeRetail: 228000,
          PrivateClean: 222000,
          PartExchange: 216000,
          PrivateAverage: 219000,
          AuctionValue: 212000,
          TradeAverage: 209000,
          OnTheRoad: 255000,
          ValuationBook: "CAP",
          VehicleDescription: "Aston Martin DBS Superleggera V12 Auto",
          DateOfFirstRegistration: "2024-02-28"
        },
        SpecAndOptionDetails: {
          StandardEquipmentList: [
            "Carbon Ceramic Brakes",
            "Adaptive Damping System",
            "8-speed ZF Automatic Transmission",
            "Limited-slip Differential",
            "21-inch Forged Alloy Wheels",
            "LED Headlights",
            "Alcantara Headlining",
            "Sports Plus Seats",
            "Bang & Olufsen BeoSound",
            "360-degree Camera System"
          ],
          OptionalEquipmentList: [
            "Q by Aston Martin Commission",
            "Carbon Fiber Roof Panel",
            "Titanium Exhaust System",
            "Carbon Fiber Splitter",
            "Satin Chrome Jewellery Pack",
            "Quilted Leather Seats",
            "Garage Door Opener",
            "Ventilated Front Seats"
          ],
          FactoryFittedOptions: "Q Commission Xenon Grey, Carbon Fiber Roof, Titanium Exhaust System",
          TotalOptionsValue: 48000
        },
        TyreDetails: {
          FrontTyreSize: "265/35 ZR21",
          RearTyreSize: "305/30 ZR21",
          FrontTyrePressure: "36 PSI",
          RearTyrePressure: "39 PSI",
          TyreSpeedRating: "Y",
          TyreLoadIndex: "98/104"
        }
      }
    },
    "Porsche": {
      RequestInformation: {
        PackageName: "FullcheckAPI",
        DateOfRequest: new Date().toISOString(),
        SearchTerm: "P911 TBO"
      },
      ResponseInformation: {
        StatusCode: "Success",
        StatusMessage: "Complete",
        QueryTimeMs: 189
      },
      BillingInformation: {
        PackageCost: 7.00,
        CurrencyCode: "GBP",
        TransactionCost: 7.00
      },
      Results: {
        VehicleDetails: {
          VehicleIdentification: {
            Vrm: "P911 TBO",
            Vin: "WP0ZZZ99ZPS106789",
            VinLast5: "06789",
            EngineNumber: "P9110045TBO",
            UkvdId: "PS-2023-TBO-001",
            Make: "PORSCHE",
            Model: "911 TURBO S",
            DvlaMake: "PORSCHE",
            DvlaModel: "911 TURBO S",
            Colour: "GT SILVER METALLIC",
            DvlaColour: "GT SILVER METALLIC",
            BodyType: "COUPE",
            DvlaBodyType: "COUPE",
            TransmissionType: "AUTOMATIC",
            DvlaTransmissionType: "AUTOMATIC",
            FuelType: "PETROL",
            DvlaFuelType: "PETROL",
            NumberOfDoors: 2,
            NumberOfSeats: 4,
            EngineSizeInCC: 3745,
            ManufactureDate: "2023-08-15",
            DateOfManufacture: "2023-08-15",
            FirstRegistrationDate: "2023-09-22",
            DateFirstRegistered: "2023-09-22",
            DateFirstRegisteredInUk: "2023-09-22",
            YearOfManufacture: 2023,
            WheelPlan: "2 AXLE RIGID BODY",
            DvlaWheelPlan: "2 AXLE RIGID BODY",
            VehicleCategory: "M1",
            UseClass: "PRIVATE",
            TypeApprovalNumber: "e13*2007/46*0864*00",
            VehicleUsedBeforeFirstRegistration: false,
            PreviousVrmNi: null
          },
          VehicleStatus: {
            TaxStatus: "TAXED",
            TaxDueDate: "2024-09-01",
            MotStatus: "VALID",
            MotExpiryDate: "2026-09-21",
            LastV5CIssueDate: "2023-09-22",
            Scrapped: false,
            ScrappedDate: null,
            Imported: false,
            Exported: false,
            ImportedDate: null,
            ExportedDate: null,
            WrittenOff: false,
            VicTested: false,
            VicTestDate: null,
            PlateChange: false
          },
          VehicleHistory: {
            V5CCount: 2,
            PlateChangeCount: 0,
            NumberOfPreviousKeepers: 1,
            KeeperChanges: [
              {
                DateOfTransaction: "2023-09-22",
                NumberOfPreviousKeepers: 0,
                TransferDate: "2023-09-22"
              },
              {
                DateOfTransaction: "2024-07-15",
                NumberOfPreviousKeepers: 1,
                TransferDate: "2024-07-15"
              }
            ],
            VicTestCount: 0,
            PlateChangeList: []
          },
          DvlaTechnicalDetails: {
            Co2Emissions: 271,
            EuroStatus: "EURO 6 DG",
            RealDrivingEmissions: "1",
            TaxBand: "M",
            TaxRate: 695,
            TopSpeed: 205,
            ZeroToSixty: 2.7,
            MaxPowerBHP: 641,
            MaxTorqueNM: 800,
            GrossVehicleWeight: 1995,
            KerbWeight: 1640,
            MaxTowingWeightBraked: 0,
            MaxTowingWeightUnbraked: 0,
            MinKerbWeight: 1640,
            MaxGrossWeight: 1995,
            Height: 1303,
            Length: 4535,
            Width: 1900,
            Wheelbase: 2450,
            FuelTankCapacityLitres: 67,
            GrossTrainWeight: 1995,
            LoadLength: null,
            DataVersionNumber: "1.0",
            EngineCapacity: 3745,
            PowerDelivery: "TWIN TURBO"
          }
        },
        ModelDetails: {
          MakeCode: "PO",
          ModelCode: "911TURBO",
          ModelVariant: "S",
          VehicleClassDescription: "SPORTS CAR",
          BodyStyleDescription: "2 DOOR COUPE",
          EngineDescription: "FLAT-6 3.7L TWIN TURBO",
          TransmissionDescription: "8-SPEED PDK",
          DrivetrainDescription: "ALL WHEEL DRIVE",
          ModelYear: 2023,
          ModelIntroductionDate: "2023-01-01",
          ModelDiscontinuedDate: null,
          IsCurrentModel: true
        },
        MotHistoryDetails: {
          RecordCount: 3,
          MotTestDetailsList: [
            {
              TestDate: "2024-09-21",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2025-09-21",
              OdometerReading: 12800,
              OdometerUnit: "mi",
              TestNumber: "678901234567",
              TestType: "NT",
              TestStation: "Porsche Centre London",
              TestStationNumber: "V67890",
              DaysSinceLastTest: 0,
              DaysSinceLastPass: 0,
              DaysOutOfMot: 0,
              AdvisoryCount: 4,
              AdvisoryDetailsList: [
                {
                  Type: "ADVISORY",
                  Text: "Offside Front Tyre worn close to legal limit 3.0mm (5.2.3 (e))",
                  Category: "TYRES"
                },
                {
                  Type: "ADVISORY",
                  Text: "Nearside Front Tyre worn close to legal limit 3.1mm (5.2.3 (e))",
                  Category: "TYRES"
                },
                {
                  Type: "ADVISORY",
                  Text: "Front brake disc worn, pitted or scored, but not seriously weakened (1.1.14 (a) (ii))",
                  Category: "BRAKES"
                },
                {
                  Type: "ADVISORY",
                  Text: "Windscreen has damage to an area less than a 10mm circle within zone A (3.2 (a) (i))",
                  Category: "VISIBILITY"
                }
              ],
              MinorDefectCount: 1,
              MinorDefectDetailsList: [
                {
                  Type: "MINOR",
                  Text: "Registration plate lamp inoperative in the case of a single lamp or all lamps (4.7.1 (b) (ii))",
                  Category: "LAMPS"
                }
              ]
            },
            {
              TestDate: "2024-03-15",
              TestResult: "FAILED",
              TestPassed: false,
              ExpiryDate: null,
              OdometerReading: 8500,
              OdometerUnit: "mi",
              TestNumber: "456789012345",
              TestType: "NT",
              TestStation: "Porsche Centre London",
              TestStationNumber: "V67890",
              DaysSinceLastTest: 189,
              DaysSinceLastPass: 189,
              DaysOutOfMot: 0,
              AdvisoryCount: 0,
              AdvisoryDetailsList: [],
              MinorDefectCount: 0,
              MinorDefectDetailsList: [],
              MajorDefectCount: 1,
              MajorDefectDetailsList: [
                {
                  Type: "MAJOR",
                  Text: "Offside Headlamp aim projected beam image is obviously incorrect (4.1.2 (c))",
                  Category: "LAMPS"
                }
              ]
            },
            {
              TestDate: "2024-03-15",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2025-03-15",
              OdometerReading: 8500,
              OdometerUnit: "mi",
              TestNumber: "456789012346",
              TestType: "RT",
              TestStation: "Porsche Centre London",
              TestStationNumber: "V67890",
              DaysSinceLastTest: 0,
              DaysSinceLastPass: 189,
              DaysOutOfMot: 0,
              AdvisoryCount: 0,
              AdvisoryDetailsList: [],
              MinorDefectCount: 0,
              MinorDefectDetailsList: []
            },
            {
              TestDate: "2023-09-21",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2026-09-21",
              OdometerReading: 150,
              OdometerUnit: "mi",
              TestNumber: "901234567890",
              TestType: "NT",
              TestStation: "Porsche Centre London",
              TestStationNumber: "V67890",
              DaysSinceLastTest: 365,
              DaysSinceLastPass: 365,
              DaysOutOfMot: 0,
              AdvisoryCount: 0,
              AdvisoryDetailsList: [],
              MinorDefectCount: 0,
              MinorDefectDetailsList: []
            }
          ],
          MotTestSummary: {
            TestCount: 4,
            FirstTestDate: "2023-09-21",
            LastTestDate: "2024-09-21",
            LastTestResult: "PASSED",
            LastTestMileage: 12800,
            HasFailures: true,
            HasAdvisories: true,
            HasDangerousDefects: false
          }
        },
        PncDetails: {
          IsStolen: false,
          DateReportedStolen: null,
          PoliceForceName: null,
          PoliceContactNumber: null,
          CrimeReferenceNumber: null,
          Status: "NOT STOLEN"
        },
        MiaftrDetails: {
          WriteOffRecordList: [],
          IsWrittenOff: false,
          HasBeenScrapped: false,
          ScrapMarkerDetails: null
        },
        FinanceDetails: {
          FinanceRecordList: [],
          RecordCount: 0
        },
        MileageCheckDetails: {
          MileageResultList: [
            {
              RecordDate: "2023-09-22",
              OdometerReading: 10,
              OdometerUnit: "mi",
              Source: "DEALER",
              DataSource: "Porsche UK"
            },
            {
              RecordDate: "2024-01-15",
              OdometerReading: 3200,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Porsche Service"
            },
            {
              RecordDate: "2024-03-15",
              OdometerReading: 8500,
              OdometerUnit: "mi",
              Source: "MOT",
              DataSource: "MOT Test"
            },
            {
              RecordDate: "2024-06-20",
              OdometerReading: 10800,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Porsche Service"
            },
            {
              RecordDate: "2024-09-21",
              OdometerReading: 12800,
              OdometerUnit: "mi",
              Source: "MOT",
              DataSource: "MOT Test"
            },
            {
              RecordDate: "2025-01-10",
              OdometerReading: 15200,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Porsche Service"
            }
          ],
          MileageAnomalyDetected: false,
          CalculatedAverageAnnualMileage: 10800,
          LastRecordedMileage: 15200,
          MileageReadingCount: 6
        },
        VehicleImageDetails: {
          VehicleImageList: [
            {
              ImageUrl: "https://example.com/porsche-911-turbo-front.jpg",
              ImageCaption: "Front View",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/porsche-911-turbo-side.jpg",
              ImageCaption: "Side Profile",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/porsche-911-turbo-interior.jpg",
              ImageCaption: "Sport Interior",
              ImageType: "INTERIOR"
            }
          ]
        },
        VehicleCodes: {
          Smmt: "P9T001",
          Dvla: "M1S",
          BodyCode: "CP",
          EngineCode: "H6TT",
          TransmissionCode: "D8P"
        },
        ValuationDetails: {
          ValuationDate: "2025-08-30",
          ValuationMileage: 15200,
          DealerForecourt: 168000,
          TradeRetail: 156000,
          PrivateClean: 152000,
          PartExchange: 148000,
          PrivateAverage: 150000,
          AuctionValue: 145000,
          TradeAverage: 143000,
          OnTheRoad: 175000,
          ValuationBook: "CAP",
          VehicleDescription: "Porsche 911 Turbo S PDK Auto AWD",
          DateOfFirstRegistration: "2023-09-22"
        },
        SpecAndOptionDetails: {
          StandardEquipmentList: [
            "Porsche Active Suspension Management",
            "Porsche Dynamic Chassis Control",
            "Porsche Ceramic Composite Brakes",
            "Sport Chrono Package",
            "Porsche Torque Vectoring Plus",
            "Matrix LED Headlights",
            "18-way Adaptive Sports Seats",
            "BOSE Surround Sound System",
            "Porsche Communication Management",
            "Front Axle Lift System"
          ],
          OptionalEquipmentList: [
            "Exclusive Manufaktur Interior",
            "Carbon Fiber Interior Package",
            "Burmester High-End Sound System",
            "Night Vision Assist",
            "Sport Design Package",
            "Extended Leather Interior",
            "Lightweight Package",
            "Paint to Sample"
          ],
          FactoryFittedOptions: "Sport Design Package, Burmester Sound System, Carbon Fiber Interior Package",
          TotalOptionsValue: 38000
        },
        TyreDetails: {
          FrontTyreSize: "255/35 ZR20",
          RearTyreSize: "315/30 ZR21",
          FrontTyrePressure: "36 PSI",
          RearTyrePressure: "42 PSI",
          TyreSpeedRating: "Y",
          TyreLoadIndex: "96/105"
        }
      }
    },
    "Bugatti": {
      RequestInformation: {
        PackageName: "FullcheckAPI",
        DateOfRequest: new Date().toISOString(),
        SearchTerm: "BUG 001"
      },
      ResponseInformation: {
        StatusCode: "Success",
        StatusMessage: "Complete",
        QueryTimeMs: 312
      },
      BillingInformation: {
        PackageCost: 7.00,
        CurrencyCode: "GBP",
        TransactionCost: 7.00
      },
      Results: {
        VehicleDetails: {
          VehicleIdentification: {
            Vrm: "BUG 001",
            Vin: "VF9SV3V35NPM51234",
            VinLast5: "51234",
            EngineNumber: "BUG8000W16Q",
            UkvdId: "BG-2024-001-001",
            Make: "BUGATTI",
            Model: "CHIRON SUPER SPORT",
            DvlaMake: "BUGATTI",
            DvlaModel: "CHIRON SUPER SPORT",
            Colour: "NOCTURNE BLACK",
            DvlaColour: "NOCTURNE BLACK",
            BodyType: "COUPE",
            DvlaBodyType: "COUPE",
            TransmissionType: "AUTOMATIC",
            DvlaTransmissionType: "AUTOMATIC",
            FuelType: "PETROL",
            DvlaFuelType: "PETROL",
            NumberOfDoors: 2,
            NumberOfSeats: 2,
            EngineSizeInCC: 7993,
            ManufactureDate: "2023-12-01",
            DateOfManufacture: "2023-12-01",
            FirstRegistrationDate: "2024-01-10",
            DateFirstRegistered: "2024-01-10",
            DateFirstRegisteredInUk: "2024-01-10",
            YearOfManufacture: 2024,
            WheelPlan: "2 AXLE RIGID BODY",
            DvlaWheelPlan: "2 AXLE RIGID BODY",
            VehicleCategory: "M1",
            UseClass: "PRIVATE",
            TypeApprovalNumber: "e2*2007/46*0899*00",
            VehicleUsedBeforeFirstRegistration: false,
            PreviousVrmNi: null
          },
          VehicleStatus: {
            TaxStatus: "TAXED",
            TaxDueDate: "2025-01-01",
            MotStatus: "VALID",
            MotExpiryDate: "2027-01-09",
            LastV5CIssueDate: "2024-01-10",
            Scrapped: false,
            ScrappedDate: null,
            Imported: false,
            Exported: false,
            ImportedDate: null,
            ExportedDate: null,
            WrittenOff: false,
            VicTested: false,
            VicTestDate: null,
            PlateChange: false
          },
          VehicleHistory: {
            V5CCount: 1,
            PlateChangeCount: 0,
            NumberOfPreviousKeepers: 0,
            KeeperChanges: [
              {
                DateOfTransaction: "2024-01-10",
                NumberOfPreviousKeepers: 0,
                TransferDate: "2024-01-10"
              }
            ],
            VicTestCount: 0,
            PlateChangeList: []
          },
          DvlaTechnicalDetails: {
            Co2Emissions: 516,
            EuroStatus: "EURO 6 DG",
            RealDrivingEmissions: "1",
            TaxBand: "M",
            TaxRate: 695,
            TopSpeed: 273,
            ZeroToSixty: 2.3,
            MaxPowerBHP: 1578,
            MaxTorqueNM: 1600,
            GrossVehicleWeight: 2180,
            KerbWeight: 1978,
            MaxTowingWeightBraked: 0,
            MaxTowingWeightUnbraked: 0,
            MinKerbWeight: 1978,
            MaxGrossWeight: 2180,
            Height: 1212,
            Length: 4794,
            Width: 2038,
            Wheelbase: 2711,
            FuelTankCapacityLitres: 100,
            GrossTrainWeight: 2180,
            LoadLength: null,
            DataVersionNumber: "1.0",
            EngineCapacity: 7993,
            PowerDelivery: "QUAD TURBO"
          }
        },
        ModelDetails: {
          MakeCode: "BU",
          ModelCode: "CHIRON",
          ModelVariant: "SUPER SPORT",
          VehicleClassDescription: "HYPERCAR",
          BodyStyleDescription: "2 DOOR COUPE",
          EngineDescription: "W16 8.0L QUAD TURBO",
          TransmissionDescription: "7-SPEED DUAL CLUTCH",
          DrivetrainDescription: "ALL WHEEL DRIVE",
          ModelYear: 2024,
          ModelIntroductionDate: "2023-06-01",
          ModelDiscontinuedDate: null,
          IsCurrentModel: true
        },
        MotHistoryDetails: {
          RecordCount: 1,
          MotTestDetailsList: [
            {
              TestDate: "2024-01-09",
              TestResult: "PASSED",
              TestPassed: true,
              ExpiryDate: "2027-01-09",
              OdometerReading: 350,
              OdometerUnit: "mi",
              TestNumber: "012345678901",
              TestType: "NT",
              TestStation: "Bugatti London Service",
              TestStationNumber: "V01234",
              DaysSinceLastTest: 0,
              DaysSinceLastPass: 0,
              DaysOutOfMot: 0,
              AdvisoryCount: 0,
              AdvisoryDetailsList: [],
              MinorDefectCount: 0,
              MinorDefectDetailsList: []
            }
          ],
          MotTestSummary: {
            TestCount: 1,
            FirstTestDate: "2024-01-09",
            LastTestDate: "2024-01-09",
            LastTestResult: "PASSED",
            LastTestMileage: 350,
            HasFailures: false,
            HasAdvisories: false,
            HasDangerousDefects: false
          }
        },
        PncDetails: {
          IsStolen: false,
          DateReportedStolen: null,
          PoliceForceName: null,
          PoliceContactNumber: null,
          CrimeReferenceNumber: null,
          Status: "NOT STOLEN"
        },
        MiaftrDetails: {
          WriteOffRecordList: [],
          IsWrittenOff: false,
          HasBeenScrapped: false,
          ScrapMarkerDetails: null
        },
        FinanceDetails: {
          FinanceRecordList: [],
          RecordCount: 0
        },
        MileageCheckDetails: {
          MileageResultList: [
            {
              RecordDate: "2024-01-10",
              OdometerReading: 5,
              OdometerUnit: "mi",
              Source: "DEALER",
              DataSource: "Bugatti Automobiles"
            },
            {
              RecordDate: "2024-04-15",
              OdometerReading: 280,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Bugatti Service"
            },
            {
              RecordDate: "2024-08-20",
              OdometerReading: 650,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Bugatti Service"
            },
            {
              RecordDate: "2025-01-15",
              OdometerReading: 1100,
              OdometerUnit: "mi",
              Source: "SERVICE",
              DataSource: "Annual Service"
            }
          ],
          MileageAnomalyDetected: false,
          CalculatedAverageAnnualMileage: 1000,
          LastRecordedMileage: 1100,
          MileageReadingCount: 4
        },
        VehicleImageDetails: {
          VehicleImageList: [
            {
              ImageUrl: "https://example.com/bugatti-chiron-front.jpg",
              ImageCaption: "Front View",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/bugatti-chiron-side.jpg",
              ImageCaption: "Side Profile",
              ImageType: "EXTERIOR"
            },
            {
              ImageUrl: "https://example.com/bugatti-chiron-interior.jpg",
              ImageCaption: "Luxury Interior",
              ImageType: "INTERIOR"
            }
          ]
        },
        VehicleCodes: {
          Smmt: "BUC001",
          Dvla: "M1H",
          BodyCode: "CP",
          EngineCode: "W16Q",
          TransmissionCode: "D7"
        },
        ValuationDetails: {
          ValuationDate: "2025-08-30",
          ValuationMileage: 1100,
          DealerForecourt: 3200000,
          TradeRetail: 3050000,
          PrivateClean: 2950000,
          PartExchange: 2850000,
          PrivateAverage: 2900000,
          AuctionValue: 2800000,
          TradeAverage: 2750000,
          OnTheRoad: 3350000,
          ValuationBook: "SPECIALIST",
          VehicleDescription: "Bugatti Chiron Super Sport W16 Auto AWD",
          DateOfFirstRegistration: "2024-01-10"
        },
        SpecAndOptionDetails: {
          StandardEquipmentList: [
            "Adaptive Chassis Control",
            "Carbon Ceramic Silicon Carbide Brakes",
            "Michelin Pilot Sport Cup 2 Tyres",
            "Titanium Exhaust System",
            "Sky View Glass Panels",
            "Diamond Cut Finish Wheels",
            "Telemetry System",
            "4 Driving Modes",
            "Hydraulic Power Steering",
            "All-LED Lighting System"
          ],
          OptionalEquipmentList: [
            "Bespoke Color Scheme",
            "Exposed Carbon Fiber Body",
            "Comfort Seats",
            "Full Leather Interior",
            "Embroidered Headrests",
            "Precious Metal Accents",
            "Cristal Champagne Flutes",
            "Luggage Set"
          ],
          FactoryFittedOptions: "Bespoke Nocturne Black Paint, Exposed Carbon Fiber Elements, Full Leather Interior",
          TotalOptionsValue: 450000
        },
        TyreDetails: {
          FrontTyreSize: "285/30 R20",
          RearTyreSize: "355/25 R21",
          FrontTyrePressure: "38 PSI",
          RearTyrePressure: "41 PSI",
          TyreSpeedRating: "Y",
          TyreLoadIndex: "103/108"
        }
      }
    }
  };

  return reports[brand] || reports["Rolls-Royce"];
};

export const sampleVehicleData = {
  "Rolls-Royce": createSampleReport("Rolls-Royce"),
  "Bentley": createSampleReport("Bentley"),
  "Ferrari": createSampleReport("Ferrari"),
  "Lamborghini": createSampleReport("Lamborghini"),
  "McLaren": createSampleReport("McLaren"),
  "Aston Martin": createSampleReport("Aston Martin"),
  "Porsche": createSampleReport("Porsche"),
  "Bugatti": createSampleReport("Bugatti")
};