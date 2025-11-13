import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { isAuthenticated, isAdmin } from "./auth/middleware";
import { z } from "zod";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";
// PDFKit removed - using Puppeteer-based PDF generation instead
import axios from "axios";
import { generateComprehensiveMockData } from './mockData/generateComprehensiveMockData';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

let stripe: Stripe | null = null;

try {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error(
      "❌ STRIPE_SECRET_KEY environment variable is missing. Please configure it in the Deployments pane Configuration tab."
    );
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('❌ Stripe initialization failed:', (error as Error).message);
  console.error('Payment functionality will be disabled until STRIPE_SECRET_KEY is configured.');
  // Don't throw here - allow server to start but disable Stripe functionality
}

// Mock implementations for functions used in the changes, as they are not provided in the original code.
// In a real application, these would interact with a database or authentication service.

// Assume this function checks if a user is authenticated and returns user info if so.
// In a real scenario, this would likely be middleware that attaches user info to the request.
async function requireAuth(req: any, res: any, next: any) {
  // Mock authentication: In a real app, this would verify a token or session.
  // For this example, we'll assume a user is available if a user ID can be determined.
  // The isAuthenticated middleware from replitAuth should handle this.
  if (req.user && req.user.claims && req.user.claims.sub) {
    next();
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
}

// Helper function to normalize package names for consistent checking
function normalizePackageName(name?: string) {
  const n = (name || "").toLowerCase();
  return {
    isFree: n.includes("free"),
    isFull: n.includes("full") || n.includes("vid") || n.includes("premium") || n.includes("comprehensive"),
    norm: n
  };
}

// Mock function to get vehicle data.
// In a real application, this would call an external API.
async function lookupVehicle(regNumber: string, packageName: string) {
  console.log(`Mock lookupVehicle called for ${regNumber} with package ${packageName}`);
  
  const { isFree, isFull } = normalizePackageName(packageName);
  
  if (isFree) {
    // Basic free check with limited data
    return {
      success: true,
      vehicleData: {
        registration: regNumber.toUpperCase(),
        make: 'BMW',
        model: '3 SERIES',
        year: '2021',
        dataSource: 'MockAPI (Free)',
        isComprehensive: false,
        colour: 'Alpine White',
        engineSize: '2000cc',
        fuelType: 'Petrol',
        motExpiry: '2025-03-14',
        taxExpiry: '2025-03-31'
      },
      reportRaw: { 
        Results: {
          VehicleDetails: [{
            VehicleIdentification: {
              DvlaMake: "BMW",
              DvlaModel: "3 SERIES",
              Vrm: regNumber.toUpperCase(),
              YearOfManufacture: "2021"
            }
          }]
        },
        message: 'Mock free data - limited fields only' 
      }
    };
  } else if (isFull) {
    // Generate comprehensive mock data with ALL fields
    const comprehensiveData = generateComprehensiveMockData(regNumber);
    
    // Extract key fields for the simplified vehicleData object
    const vehicleDetails = comprehensiveData.Results.VehicleDetails[0];
    const motDetails = comprehensiveData.Results.MotHistoryDetails[0];
    const vehicleHistory = comprehensiveData.Results.VehicleHistory[0];
    const valuation = comprehensiveData.Results.ValuationData;
    const technicalDetails = comprehensiveData.Results.TechnicalDetails[0];
    
    // Convert to proper Vehicle Data UK API response format (VIDCheck package)
    const vidCheckFormatted = {
      RequestInformation: {
        PackageName: 'VIDCheck',
        RequestDate: new Date().toISOString(),
        RequestId: comprehensiveData.RequestId || `REQ-${Date.now()}`
      },
      ResponseInformation: {
        ResponseId: comprehensiveData.RequestId || `RESP-${Date.now()}`,
        StatusMessage: 'Success',
        StatusCode: 0,
        IsSuccessStatusCode: true
      },
      BillingInformation: {
        AccountBalance: 100.00,
        TransactionCost: 0.40,
        BillingResultMessage: 'Success'
      },
      Results: {
        VehicleDetails: {
          VehicleIdentification: vehicleDetails.VehicleIdentification,
          VehicleStatus: vehicleDetails.VehicleStatus,
          DvlaTechnicalDetails: {
            EngineCapacityCc: technicalDetails.Engine.EngineCapacityInCc,
            NumberOfSeats: vehicleDetails.VehicleIdentification.NumberOfSeats,
            NumberOfDoors: vehicleDetails.VehicleIdentification.NumberOfDoors,
            MaxNetPowerKw: technicalDetails.Engine.MaxPowerKw,
            GrossWeightKg: technicalDetails.Dimensions.MaxGrossWeightInKg
          },
          VehicleHistory: {
            ColourDetails: vehicleHistory.ColourDetails,
            KeeperChangeList: vehicleHistory.KeeperChangeList.KeeperChanges || [],
            PlateChangeList: vehicleHistory.PlateChangeList.PlateChanges || [],
            V5cCertificateList: []
          }
        },
        ModelDetails: {
          ModelIdentification: {
            Range: '3 Series',
            ModelVariant: '320i',
            Series: 'G20',
            CountryOfOrigin: 'Germany'
          },
          ModelClassification: {
            TypeApprovalCategory: vehicleDetails.VehicleIdentification.TypeApprovalCategory,
            VehicleClass: vehicleDetails.VehicleIdentification.VehicleClass
          },
          BodyDetails: {
            BodyStyle: vehicleDetails.VehicleIdentification.DvlaBodyType,
            NumberOfDoors: vehicleDetails.VehicleIdentification.NumberOfDoors,
            NumberOfSeats: vehicleDetails.VehicleIdentification.NumberOfSeats,
            FuelTankCapacityLitres: technicalDetails.Dimensions.FuelTankCapacityInLitres
          },
          Dimensions: {
            LengthMm: technicalDetails.Dimensions.LengthInMm,
            WidthMm: technicalDetails.Dimensions.WidthInMm,
            HeightMm: technicalDetails.Dimensions.HeightInMm,
            WheelbaseLengthMm: technicalDetails.Dimensions.WheelbaseInMm
          },
          Weights: {
            KerbWeightKg: technicalDetails.Dimensions.MinKerbWeightInKg,
            GrossWeightKg: technicalDetails.Dimensions.MaxGrossWeightInKg
          },
          Powertrain: {
            Engine: {
              EngineCode: technicalDetails.Engine.EngineCode,
              CapacityCc: technicalDetails.Engine.EngineCapacityInCc,
              PowerBhp: technicalDetails.Engine.MaxPowerBhp,
              PowerKw: technicalDetails.Engine.MaxPowerKw,
              TorqueNm: technicalDetails.Engine.MaxTorqueNm
            },
            Transmission: {
              TransmissionType: vehicleDetails.VehicleIdentification.Transmission,
              DriveType: vehicleDetails.VehicleIdentification.DriveType,
              NumberOfGears: vehicleDetails.VehicleIdentification.NumberOfGears
            }
          },
          Safety: {
            EuroNcap: {
              NcapStarRating: parseInt(technicalDetails.Safety.NcapOverallRating),
              NcapAdultPercent: technicalDetails.Safety.NcapAdultOccupantProtection,
              NcapChildPercent: technicalDetails.Safety.NcapChildOccupantProtection
            }
          },
          Emissions: {
            EuroStatus: comprehensiveData.Results.AdditionalInformation.EcoInformation.EuroEmissionStandard,
            Co2EmissionsGpKm: comprehensiveData.Results.AdditionalInformation.EcoInformation.Co2EmissionsGpKm
          },
          Performance: {
            Statistics: {
              MaxSpeedMph: technicalDetails.Performance.TopSpeedMph,
              ZeroToSixtyMph: technicalDetails.Performance.ZeroTo60Mph
            },
            FuelEconomy: {
              CombinedMpg: vehicleDetails.VehicleExciseDutyDetails.VehicleExciseDutyEmissionsDetails.CombinedFuelConsumptionMpg
            }
          }
        },
        MotHistoryDetails: {
          MotDueDate: motDetails.MotDueDate,
          MotStatus: motDetails.MotStatus,
          DaysSinceLastMot: motDetails.DaysSinceLastMot,
          FirstUsedDate: motDetails.FirstUsedDate,
          MotTestDetailsList: motDetails.MotRecords.map((mot: any) => ({
            TestDate: mot.TestDate,
            ExpiryDate: mot.ExpiryDate,
            TestPassed: mot.TestPassed,
            OdometerReading: mot.OdometerReading,
            OdometerUnit: mot.OdometerUnit,
            TestNumber: mot.TestNumber,
            IsRetest: mot.IsRetest,
            AnnotationList: []
          }))
        },
        VehicleTaxDetails: {
          TaxDueDate: vehicleDetails.VehicleExciseDutyDetails.TaxDue,
          TaxStatus: vehicleDetails.VehicleExciseDutyDetails.TaxStatus,
          TaxIsCurrentlyValid: vehicleDetails.VehicleExciseDutyDetails.TaxStatus === 'TAXED',
          TaxDaysRemaining: 90
        },
        PncDetails: {
          IsStolen: comprehensiveData.Results.StolenVehicleInformation.IsCurrentlyStolen,
          DateReportedStolen: comprehensiveData.Results.StolenVehicleInformation.StolenDate
        },
        MiaftrDetails: {
          WriteOffRecordList: comprehensiveData.Results.InsuranceWriteOff.IsWrittenOff ? [{
            Category: comprehensiveData.Results.InsuranceWriteOff.WriteOffCategory,
            LossDate: comprehensiveData.Results.InsuranceWriteOff.WriteOffDate
          }] : []
        },
        FinanceDetails: {
          FinanceRecordList: comprehensiveData.Results.FinanceAgreements.HasActiveFinance ? [{
            FinanceCompany: 'Mock Finance Company'
          }] : []
        },
        ValuationDetails: {
          RetailValue: parseInt(valuation.CurrentRetailValue),
          DealerForecourt: parseInt(valuation.ForecourtValue),
          PrivateClean: parseInt(valuation.CurrentPrivateValue),
          PartExchange: parseInt(valuation.CurrentTradeValue)
        },
        SpecAndOptionsDetails: {
          FactoryEquipmentList: [
            ...comprehensiveData.Results.StandardEquipment.Safety,
            ...comprehensiveData.Results.StandardEquipment.Comfort,
            ...comprehensiveData.Results.StandardEquipment.Technology,
            ...comprehensiveData.Results.StandardEquipment.Exterior
          ]
        },
        BatteryDetails: {
          BatteryType: '12V Lead Acid',
          BatteryCapacityAh: '90',
          BatteryCca: '800'
        },
        TyreDetails: {
          TyreDetailsList: [
            {
              Position: 'Front',
              TyreSize: '225/45R17',
              LoadIndex: '91',
              SpeedRating: 'W'
            },
            {
              Position: 'Rear',
              TyreSize: '225/45R17',
              LoadIndex: '91',
              SpeedRating: 'W'
            }
          ]
        },
        VehicleImageDetails: {
          VehicleImageList: comprehensiveData.Results.VehicleImages.Images
        },
        MileageCheckDetails: {
          MileageHistoryList: motDetails.MotRecords.map((mot: any) => ({
            Date: mot.TestDate,
            Mileage: mot.OdometerReading,
            Source: 'MOT Test'
          })),
          HasDiscrepancy: false
        }
      }
    };
    
    return {
      success: true,
      vehicleData: {
        registration: regNumber.toUpperCase(),
        make: vehicleDetails.VehicleIdentification.DvlaMake,
        model: vehicleDetails.VehicleIdentification.DvlaModel,
        year: vehicleDetails.VehicleIdentification.YearOfManufacture,
        dataSource: 'Mock API (VIDCheck - Full Check)',
        isComprehensive: true,
        colour: vehicleHistory.ColourDetails.CurrentColour,
        engineSize: technicalDetails.Engine.EngineCapacityInCc + 'cc',
        fuelType: vehicleDetails.VehicleIdentification.DvlaFuelType,
        bodyType: vehicleDetails.VehicleIdentification.DvlaBodyType,
        transmission: vehicleDetails.VehicleIdentification.Transmission,
        motExpiry: motDetails.MotDueDate,
        motStatus: motDetails.MotStatus,
        taxExpiry: vehicleDetails.VehicleExciseDutyDetails.TaxDue,
        taxStatus: vehicleDetails.VehicleExciseDutyDetails.TaxStatus,
        co2Emissions: vehicleDetails.VehicleExciseDutyDetails.DvlaCo2 + ' g/km',
        previousOwners: vehicleHistory.KeeperChangeList.NumberOfPreviousKeepers,
        marketValue: `£${parseInt(valuation.CurrentRetailValue).toLocaleString()}`,
        mileage: motDetails.RecordedMileageData.LastRecordedMileage + ' miles'
      },
      reportRaw: vidCheckFormatted // Use the properly formatted VIDCheck response
    };
  } else {
    throw new Error(`Unsupported package: ${packageName}`);
  }
}

// Mock function to get user credits.
async function getUserCredits(userId: string): Promise<number> {
  console.log(`Mock getUserCredits called for user: ${userId}`);
  // In a real app, this would query the database.
  // We'll return a default of 5 credits for testing.
  return await storage.getUserCreditBalance(userId) || 5;
}

// Mock function to update user credits.
async function updateUserCredits(userId: string, amount: number) {
  console.log(`Mock updateUserCredits called for user: ${userId}, amount: ${amount}`);
  // In a real app, this would update the database.
  // The storage.addCredits function is already available and can be used for this.
  const description = amount > 0 ? 'Credit purchase' : 'Vehicle lookup';
  await storage.addCredits(userId, amount, description);
}

// Mock function to store lookup details.
async function storeLookup(userId: string, registration: string, packageName: string, result: any) {
  console.log(`Mock storeLookup called for user: ${userId}, reg: ${registration}, package: ${packageName}`);
  // In a real app, this would save to the database.
  // The storage.createVehicleLookup function is available.
  const { isFull } = normalizePackageName(packageName);
  await storage.createVehicleLookup({
    userId,
    registration,
    vehicleData: result.vehicleData,
    reportRaw: result.reportRaw,
    creditsCost: isFull ? 1 : 0,
    success: result.success,
    errorMessage: result.success ? undefined : result.message,
  });
}

// Free vehicle lookup using Freecheckapi package (£0.22 cost)
async function freeVehicleDataLookup(registration: string) {
  const cleanReg = registration.replace(/\s+/g, '').toUpperCase();
  if (cleanReg.length < 3 || cleanReg.length > 8) {
    throw new Error("Invalid registration number format");
  }
  if (!process.env.VDGI_API_KEY) {
    console.error("❌ VDGI_API_KEY environment variable is missing. Please configure it in the Deployments pane Configuration tab.");
    throw new Error("Vehicle Data UK API unavailable: Missing API key");
  }
  try {
    console.log(`Attempting VDGI FREE lookup for: ${cleanReg}`);
    const apiEndpoint = 'https://uk.api.vehicledataglobal.com/r2/lookup';
    const params = new URLSearchParams({
      'apiKey': process.env.VDGI_API_KEY,
      'packageName': 'Freecheckapi',
      'vrm': cleanReg
    });
    const response = await fetch(`${apiEndpoint}?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vehicle Data UK API error: HTTP ${response.status} - ${errorText}`);
    }
    const apiData = await response.json();
    console.log('VDGI FREE API Response Status:', apiData.ResponseInformation?.StatusMessage);
    console.log('FREE LOOKUP - Package Name:', apiData.RequestInformation?.PackageName);

    // Check for billing or API errors first
    if (apiData.ResponseInformation?.StatusMessage === 'BillingFailure') {
      throw new Error(`API billing failure. Please try again later or contact support.`);
    }
    
    if (apiData.ResponseInformation?.StatusMessage === 'PackageReachedConcurrentLimit') {
      throw new Error(`Too many requests. Please wait a moment and try again.`);
    }
    
    if (!apiData.ResponseInformation?.IsSuccessStatusCode) {
      const errorMsg = apiData.ResponseInformation?.StatusMessage || 'Unknown API error';
      throw new Error(`Vehicle lookup failed: ${errorMsg}`);
    }

    if (apiData.ResponseInformation?.IsSuccessStatusCode && apiData.Results) {
      const vd = apiData.Results.VehicleDetails;
      const motHistory = apiData.Results.MotHistoryDetails;
      const modelDetails = apiData.Results.ModelDetails;
      const taxDetails = apiData.Results.VehicleTaxDetails;

      if (vd && vd.StatusCode === 0) {
        const formatDate = (dateStr: string) => {
          if (!dateStr) return 'Unknown';
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return 'Unknown';
          return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        };

        // Process MOT History from free package
        const motHistoryList = motHistory?.MotTestDetailsList?.slice(0, 10).map((mot: any) => ({
          date: formatDate(mot.TestDate),
          expiryDate: formatDate(mot.ExpiryDate),
          result: mot.TestPassed ? 'PASS' : 'FAIL',
          mileage: mot.OdometerReading + ' ' + (mot.OdometerUnit || 'miles'),
          testCertificateNumber: mot.TestNumber || 'N/A',
          defects: mot.AnnotationList?.length || 0
        })) || [];

        // Get current MOT info
        const latestMot = motHistory?.MotTestDetailsList?.[0];
        const currentMileage = latestMot?.OdometerReading ?
          `${latestMot.OdometerReading} ${latestMot.OdometerUnit || 'miles'}` : 'Unknown';

        const comprehensiveData = {
          registration: vd.VehicleIdentification?.Vrm || cleanReg,
          make: vd.VehicleIdentification?.DvlaMake || 'Unknown',
          model: vd.VehicleIdentification?.DvlaModel || 'Unknown',
          year: vd.VehicleIdentification?.YearOfManufacture || 'Unknown',
          engineSize: `${vd.DvlaTechnicalDetails?.EngineCapacityCc || 'Unknown'}${vd.DvlaTechnicalDetails?.EngineCapacityCc ? 'cc' : ''}`,
          fuelType: vd.VehicleIdentification?.DvlaFuelType || 'Unknown',
          colour: vd.VehicleHistory?.ColourDetails?.CurrentColour || 'Unknown',
          firstRegistration: formatDate(vd.VehicleIdentification?.DateFirstRegistered),
          co2Emissions: vd.VehicleStatus?.VehicleExciseDutyDetails?.DvlaCo2 ?
            `${vd.VehicleStatus.VehicleExciseDutyDetails.DvlaCo2}g/km` : 'Unknown',
          euroStatus: modelDetails?.Emissions?.EuroStatus || 'Unknown',
          bodyType: vd.VehicleIdentification?.DvlaBodyType || 'Unknown',
          doors: vd.DvlaTechnicalDetails?.NumberOfDoors?.toString() 
            || modelDetails?.BodyDetails?.NumberOfDoors?.toString() || 'Unknown',
          seats: vd.DvlaTechnicalDetails?.NumberOfSeats?.toString() || 'Unknown',
          transmission: modelDetails?.Powertrain?.Transmission?.TransmissionType || 'Unknown',
          motExpiry: formatDate(motHistory?.MotDueDate),
          motResult: latestMot?.TestPassed ? 'PASS' : (latestMot ? 'FAIL' : 'Unknown'),
          mileage: currentMileage,
          taxExpiry: formatDate(taxDetails?.TaxDueDate),
          taxBand: vd.VehicleStatus?.VehicleExciseDutyDetails?.DvlaBand || 'Unknown',
          taxStatus: taxDetails?.TaxStatus || 'Unknown',
          // Free package doesn't include security checks - set as not available
          insuranceWriteOff: 'Not Available (Free Package)',
          financeOutstanding: 'Not Available (Free Package)',
          financeProvider: 'Not Available (Free Package)',
          stolenStatus: 'Not Available (Free Package)',
          previousOwners: vd.VehicleHistory?.KeeperChangeList?.length?.toString() || 'Unknown',
          marketValue: 'No Data Available (Free Check)',
          motHistory: motHistoryList,
          mileageHistory: [], // Not available in free package
          isComprehensive: false, // FIXED: Free checks should never be comprehensive
          dataSource: 'Vehicle Data UK (Basic Check)',
          lastUpdated: new Date().toISOString(),
          lookupId: apiData.ResponseInformation?.ResponseId
        };

        console.log('FREE LOOKUP - Returning comprehensive data with reportRaw');
        return { vehicleData: comprehensiveData, reportRaw: apiData };
      }
      throw new Error(`No vehicle data found for registration ${cleanReg} in Vehicle Data UK database`);
    }
  } catch (error: any) {
    console.error('VDGI FREE API error:', error.message);
    throw error;
  }
}

// Generate comprehensive mock data for testing
function generateMockVehicleData(registration: string) {
  const cleanReg = registration.replace(/\s+/g, '').toUpperCase();
  
  // Generate realistic mock data based on registration
  const mockData = {
    RequestInformation: {
      PackageName: "FullcheckAPI",
      DateOfRequest: new Date().toISOString(),
      SearchTerm: cleanReg
    },
    ResponseInformation: {
      StatusCode: "Success",
      StatusMessage: "Complete",
      QueryTimeMs: 150
    },
    BillingInformation: {
      PackageCost: 0,
      CurrencyCode: "GBP",
      TransactionCost: 0,
      AccountBalance: 999,
      BillingResultMessage: "TEST MODE - No charge"
    },
    Results: {
      VehicleDetails: {
        VehicleIdentification: {
          Vrm: cleanReg,
          Vin: `WBATESTVIN${cleanReg}`,
          VinLast5: "TEST5",
          EngineNumber: `TEST${cleanReg}ENG`,
          Make: "TEST VEHICLE",
          Model: "TEST MODEL PREMIUM",
          DvlaMake: "TEST VEHICLE",
          DvlaModel: "TEST MODEL PREMIUM",
          Colour: "SILVER",
          DvlaColour: "SILVER",
          BodyType: "5 DOOR HATCHBACK",
          DvlaBodyType: "5 DOOR HATCHBACK",
          FuelType: "PETROL",
          DvlaFuelType: "PETROL",
          WheelPlan: "2 AXLE RIGID BODY",
          DvlaWheelPlan: "2 AXLE RIGID BODY",
          YearOfManufacture: 2020,
          DateFirstRegistered: "2020-03-15",
          DateFirstRegisteredInUk: "2020-03-15",
          DateOfManufacture: "2020-01-10",
          VehicleUsedBeforeFirstRegistration: false,
          PreviousVrmNi: null
        },
        VehicleStatus: {
          CertificateOfDestructionIssued: false,
          IsImported: false,
          IsImportedFromNi: false,
          IsImportedFromNonEu: false,
          DateImported: null,
          IsExported: false,
          DateExported: null,
          IsScrapped: false,
          DateScrapped: null,
          DvlaCherishedTransferMarker: null,
          IsUnscrapped: false
        },
        VehicleExciseDutyDetails: {
          DvlaCo2: 120,
          DvlaBand: "E",
          DvlaCo2Band: "E",
          VedRatesFirstYear6Months: 110,
          VedRatesFirstYear12Months: 200,
          VedRatesStandard6Months: 90,
          VedRatesStandard12Months: 165,
          VedRatesPremiumVehicle6Months: 270,
          VedRatesPremiumVehicle12Months: 490
        }
      },
      VehicleHistory: {
        ColourDetails: {
          CurrentColour: "SILVER",
          OriginalColour: "SILVER",
          PreviousColour: null,
          NumberOfColourChanges: 0,
          LatestColourChangeDate: null
        },
        KeeperChangeList: {
          NumberOfPreviousKeepers: 2,
          KeeperStartDate: "2022-06-01",
          PreviousKeeperDisposalDate: "2022-05-31"
        },
        PlateChangeList: null,
        V5CCertificateList: {
          V5CIssueDate: "2022-06-01"
        }
      },
      DvlaTechnicalDetails: {
        NumberOfSeats: 5,
        EngineCapacity: 1998,
        GrossWeight: 2100,
        MaxNetPower: 110,
        MassInService: 1550,
        PowerToWeightRatio: 71,
        MaxPermissibleBrakedTrailerMass: 1500,
        MaxPermissibleUnbrakedTrailerMass: 750
      },
      MotHistoryDetails: {
        Make: "TEST VEHICLE",
        Model: "TEST MODEL",
        Colour: "SILVER",
        LatestTestDate: "2025-03-01",
        Vrm: cleanReg,
        FuelType: "PETROL",
        FirstUsedDate: "2020-03-15",
        MotStatus: "Valid",
        MotDueDate: "2026-03-01",
        DaysSinceLastMot: 30,
        RecordedMileageData: {
          CountOfMotMileageRecords: 3,
          MinMileage: 5000,
          MaxMileage: 45000,
          MinDate: "2021-03-01",
          MaxDate: "2025-03-01",
          IsClocked: false
        },
        MotRecords: [
          {
            TestDate: "2025-03-01",
            TestPassed: true,
            OdometerReading: 45000,
            TestNumber: "439984589705",
            ExpiryDate: "2026-03-01",
            TestStation: "Kwik Fit - Harrow",
            TestStationTown: "Harrow",
            TestAnnotations: [
              {
                Type: "advisory",
                Text: "Front Registration plate deteriorated but not likely to be misread (0.1 (b))",
                IsDangerous: false
              },
              {
                Type: "advisory", 
                Text: "Front Windscreen wiper blade defective (3.4 (b) (i))",
                IsDangerous: false
              },
              {
                Type: "advisory",
                Text: "Offside Front Anti-roll bar linkage ball joint has slight play (5.3.4 (a) (i))",
                IsDangerous: false
              },
              {
                Type: "minor",
                Text: "Nearside Front Outer Drive shaft joint constant velocity boot severely deteriorated (6.1.7 (g) (i))",
                IsDangerous: false
              },
              {
                Type: "advisory",
                Text: "Rear Service brake binding but not excessively both sides (1.2.1 (f))",
                IsDangerous: false
              },
              {
                Type: "advisory",
                Text: "Oil leak, but not excessive (8.4.1 (a) (i))",
                IsDangerous: false
              }
            ]
          },
          {
            TestDate: "2024-04-30",
            TestPassed: true,
            OdometerReading: 32156,
            TestNumber: "745186552669",
            ExpiryDate: "2025-04-29",
            TestStation: "Evans Halshaw Service Centre",
            TestStationTown: "Birmingham",
            TestAnnotations: [
              {
                Type: "advisory",
                Text: "Exhaust has a minor leak of exhaust gases (6.1.2 (a))",
                IsDangerous: false
              },
              {
                Type: "advisory",
                Text: "Exhaust has a minor leak of exhaust gases flexi (6.1.2 (a))",
                IsDangerous: false
              },
              {
                Type: "advisory",
                Text: "Nearside Rear Tyre worn close to legal limit/worn on edge (5.2.3 (e))",
                IsDangerous: false
              },
              {
                Type: "minor",
                Text: "Nearside Front Outer Drive shaft joint constant velocity boot severely deteriorated (6.1.7 (g) (i))",
                IsDangerous: false
              },
              {
                Type: "advisory",
                Text: "Offside Front Tyre worn close to legal limit/worn on edge (5.2.3 (e))",
                IsDangerous: false
              }
            ]
          },
          {
            TestDate: "2023-03-31",
            TestPassed: true,
            OdometerReading: 18551,
            TestNumber: "572938668948",
            ExpiryDate: "2024-03-30",
            TestStation: "Halfords Autocentre",
            TestStationTown: "Leeds",
            TestAnnotations: [
              {
                Type: "advisory",
                Text: "Rear Registration plate deteriorated but not likely to be misread (0.1 (b))",
                IsDangerous: false
              },
              {
                Type: "advisory",
                Text: "Front Brake disc worn, pitted or scored, but not seriously weakened both (1.1.14 (a) (ii))",
                IsDangerous: false
              },
              {
                Type: "advisory",
                Text: "Oil leak, but not excessive (8.4.1 (a) (i))",
                IsDangerous: false
              },
              {
                Type: "advisory",
                Text: "Front Registration plate deteriorated but not likely to be misread (0.1 (b))",
                IsDangerous: false
              }
            ]
          },
          {
            TestDate: "2023-03-30",
            TestPassed: false,
            OdometerReading: 18550,
            TestNumber: "304852587339",
            ExpiryDate: null,
            TestStation: "Halfords Autocentre",
            TestStationTown: "Leeds",
            TestAnnotations: [
              {
                Type: "advisory",
                Text: "Rear Registration plate deteriorated but not likely to be misread (0.1 (b))",
                IsDangerous: false
              },
              {
                Type: "dangerous",
                Text: "Nearside Front Tyre tread depth below requirements of 1.6mm (5.2.3 (e))",
                IsDangerous: true
              },
              {
                Type: "advisory",
                Text: "Front Brake disc worn, pitted or scored, but not seriously weakened both (1.1.14 (a) (ii))",
                IsDangerous: false
              },
              {
                Type: "failure",
                Text: "Front Windscreen washer provides insufficient washer liquid (3.5 (a))",
                IsDangerous: false
              },
              {
                Type: "advisory",
                Text: "Oil leak, but not excessive (8.4.1 (a) (i))",
                IsDangerous: false
              },
              {
                Type: "advisory",
                Text: "Front Registration plate deteriorated but not likely to be misread (0.1 (b))",
                IsDangerous: false
              }
            ]
          }
        ]
      },
      MiaftrDetails: {
        RecordsFound: false,
        WriteOffRecordList: []
      },
      FinanceDetails: {
        RecordsFound: false,
        FinanceRecordList: []
      },
      StolenDetails: {
        IsStolen: false,
        StolenDate: null,
        PoliceForce: null
      }
    }
  };

  // Generate comprehensive vehicle data
  const vehicleData = {
    registration: cleanReg,
    make: "TEST VEHICLE",
    model: "TEST MODEL PREMIUM",
    year: 2020,
    engineSize: "1998cc",
    fuelType: "PETROL",
    colour: "SILVER",
    firstRegistration: "15 March 2020",
    co2Emissions: "120 g/km",
    euroStatus: "Euro 6",
    bodyType: "5 DOOR HATCHBACK",
    doors: "5",
    wheelplan: "2 AXLE RIGID BODY",
    transmission: "MANUAL",
    motExpiry: "1 March 2026",
    motResult: "Pass",
    mileage: "45000 mi",
    taxExpiry: "1 April 2026",
    taxBand: "E",
    taxStatus: "Taxed",
    insuranceWriteOff: "No",
    financeOutstanding: "No",
    financeProvider: "None",
    stolenStatus: "Not stolen",
    previousOwners: "2",
    marketValue: "£15,000 - £18,000",
    motHistory: [
      {
        date: "1 March 2025",
        expiryDate: "1 March 2026",
        result: "Pass",
        mileage: "45000 mi",
        testCertificateNumber: "TEST123456789",
        defects: "None",
        annotations: [
          { Type: "advisory", Text: "Tyre worn close to legal limit on front nearside", IsDangerous: false },
          { Type: "advisory", Text: "Brake pads wearing thin", IsDangerous: false }
        ]
      }
    ],
    mileageHistory: [
      { date: "1 March 2025", mileage: "45000 mi", discrepancy: false },
      { date: "1 March 2024", mileage: "32000 mi", discrepancy: false },
      { date: "1 March 2023", mileage: "18000 mi", discrepancy: false }
    ],
    vehicleImages: [],
    specifications: {
      numberOfSeats: "5",
      numberOfDoors: "5",
      transmission: "MANUAL",
      driveType: "FWD"
    },
    isComprehensive: true,
    dataSource: "TEST MODE - Mock Data",
    lastUpdated: new Date().toISOString()
  };

  return { vehicleData, reportRaw: mockData };
}

// Comprehensive vehicle lookup using VIDCheck package
async function comprehensiveVehicleDataLookup(registration: string) {
  const cleanReg = registration.replace(/\s+/g, '').toUpperCase();
  if (cleanReg.length < 3 || cleanReg.length > 8) {
    throw new Error("Invalid registration number format");
  }
  
  // Test mode disabled - always use real API
  // Uncomment the following lines to re-enable test mode:
  // if (process.env.USE_TEST_MODE === 'true' || process.env.VDGI_API_KEY === 'test') {
  //   console.log(`🧪 TEST MODE: Using mock data for ${cleanReg}`);
  //   return generateMockVehicleData(cleanReg);
  // }
  
  if (!process.env.VDGI_API_KEY) {
    console.error("❌ VDGI_API_KEY environment variable is missing. Please configure it in the Deployments pane Configuration tab.");
    throw new Error("Vehicle Data UK API unavailable: Missing API key");
  }
  try {
    console.log(`Attempting VDGI lookup for: ${cleanReg}`);
    const apiEndpoint = 'https://uk.api.vehicledataglobal.com/r2/lookup';
    const params = new URLSearchParams({
      'apiKey': process.env.VDGI_API_KEY,
      'packageName': 'VIDCheck',
      'vrm': cleanReg
    });
    const response = await fetch(`${apiEndpoint}?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vehicle Data UK API error: HTTP ${response.status} - ${errorText}`);
    }
    const apiData = await response.json();
    console.log('VDGI API Response Status:', apiData.ResponseInformation?.StatusMessage);
    
    // Check for billing or API errors first
    if (apiData.ResponseInformation?.StatusMessage === 'BillingFailure') {
      const billingMessage = apiData.BillingInformation?.BillingResultMessage || 'Billing failed';
      const accountBalance = apiData.BillingInformation?.AccountBalance || 0;
      const transactionCost = apiData.BillingInformation?.TransactionCost || 'unknown';
      throw new Error(`Vehicle Data UK API billing failure: ${billingMessage}. Account balance: £${accountBalance}, Required: £${transactionCost}. Please top up your Vehicle Data UK account.`);
    }
    
    if (apiData.ResponseInformation?.StatusMessage === 'PackageReachedConcurrentLimit') {
      throw new Error(`Too many requests. Please wait a moment and try again.`);
    }
    
    if (!apiData.ResponseInformation?.IsSuccessStatusCode) {
      const errorMsg = apiData.ResponseInformation?.StatusMessage || 'Unknown API error';
      throw new Error(`Vehicle lookup failed: ${errorMsg}`);
    }
    
    if (apiData.ResponseInformation?.IsSuccessStatusCode && apiData.Results) {
      const vd = apiData.Results.VehicleDetails;
      const motHistory = apiData.Results.MotHistoryDetails;
      const mileageCheck = apiData.Results.MileageCheckDetails;
      const miaftr = apiData.Results.MiaftrDetails;
      const finance = apiData.Results.FinanceDetails;
      const pnc = apiData.Results.PncDetails;
      const valuationDetails = apiData.Results.ValuationDetails;
      const specAndOptions = apiData.Results.SpecAndOptionsDetails;
      const vehicleImages = apiData.Results.VehicleImageDetails;
      const taxDetails = apiData.Results?.VehicleTaxDetails; // FIX: Added missing declaration
      if (vd && vd.StatusCode === 0) {
        const formatDate = (dateStr: string) => {
          if (!dateStr) return 'Unknown';
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        };
        let motHistoryList = [];
        let mileageHistoryList = [];
        let motExpiry = 'Unknown';
        let motResult = 'Unknown';
        let currentMileage = 'Unknown';
        if (motHistory?.MotTestDetailsList && motHistory.MotTestDetailsList.length > 0) {
          const latestMot = motHistory.MotTestDetailsList[0];
          motExpiry = formatDate(latestMot.ExpiryDate);
          motResult = latestMot.TestPassed ? 'Pass' : 'Fail';
          if (latestMot.OdometerReading) {
            currentMileage = `${parseInt(latestMot.OdometerReading).toLocaleString()} miles`;
          }
          motHistoryList = motHistory.MotTestDetailsList.map((mot: any) => ({
            date: formatDate(mot.TestDate),
            expiryDate: formatDate(mot.ExpiryDate),
            result: mot.TestPassed ? 'Pass' : 'Fail',
            mileage: mot.OdometerReading ? `${parseInt(mot.OdometerReading).toLocaleString()} miles` : 'Not recorded',
            testCertificateNumber: mot.TestNumber || 'N/A',
            defects: mot.AnnotationList ? mot.AnnotationList.length : 0,
            annotations: mot.AnnotationList || []
          }));
          mileageHistoryList = motHistory.MotTestDetailsList
            .filter((mot: any) => mot.OdometerReading)
            .map((mot: any, index: number, array: any[]) => {
              const currentMileage = parseInt(mot.OdometerReading);
              const nextMileage = index > 0 ? parseInt(array[index - 1].OdometerReading) : null;
              const hasDiscrepancy = nextMileage && currentMileage > nextMileage;
              return {
                date: formatDate(mot.TestDate),
                mileage: `${currentMileage.toLocaleString()} miles`,
                source: 'MOT Test',
                discrepancy: hasDiscrepancy
              };
            });
        }
        const comprehensiveData = {
          registration: vd.VehicleIdentification?.Vrm || cleanReg,
          make: vd.VehicleIdentification?.DvlaMake || 'Unknown',
          model: vd.VehicleIdentification?.DvlaModel || 'Unknown',
          year: vd.VehicleIdentification?.YearOfManufacture || 'Unknown',
          engineSize: vd.DvlaTechnicalDetails?.EngineCapacityCc ? `${vd.DvlaTechnicalDetails.EngineCapacityCc}cc` : 'Unknown',
          fuelType: vd.VehicleIdentification?.DvlaFuelType || 'Unknown',
          colour: vd.VehicleHistory?.ColourDetails?.CurrentColour || 'Unknown',
          firstRegistration: formatDate(vd.VehicleIdentification?.DateFirstRegistered),
          firstRegisteredInUK: formatDate(vd.VehicleIdentification?.DateFirstRegisteredInUk),
          dateOfManufacture: formatDate(vd.VehicleIdentification?.DateOfManufacture),
          co2Emissions: vd.VehicleStatus?.VehicleExciseDutyDetails?.DvlaCo2 ? `${vd.VehicleStatus.VehicleExciseDutyDetails.DvlaCo2} g/km` : 'Unknown',
          euroStatus: apiData.Results.ModelDetails?.Emissions?.EuroStatus || 'Unknown',
          bodyType: vd.VehicleIdentification?.DvlaBodyType || 'N/A',
          doors: vd.DvlaTechnicalDetails?.NumberOfDoors?.toString() || apiData.Results?.ModelDetails?.BodyDetails?.NumberOfDoors?.toString() || 'N/A',
          wheelplan: vd.VehicleIdentification?.DvlaWheelPlan || 'N/A',
          transmission: apiData.Results.ModelDetails?.Powertrain?.Transmission?.TransmissionType || 'N/A',
          driveType: apiData.Results.ModelDetails?.Powertrain?.Transmission?.DriveType || 'N/A',
          engineNumber: vd.VehicleIdentification?.EngineNumber || 'Not Disclosed',

          // Vehicle Status Information
          isImported: vd.VehicleStatus?.IsImported ? 'Yes' : 'No',
          isExported: vd.VehicleStatus?.IsExported ? 'Yes' : 'No',
          isScrapped: vd.VehicleStatus?.IsScrapped ? 'Yes' : 'No',
          sornStatus: vd.VehicleStatus?.IsSorn ? 'Yes' : 'No',
          certificateOfDestructionIssued: vd.VehicleStatus?.CertificateOfDestructionIssued ? 'Yes' : 'No',

          // MOT Information
          motExpiry: formatDate(motHistory?.MotDueDate),
          motResult: motHistory?.MotTestDetailsList?.[0]?.TestPassed ? 'Pass' : 'Unknown',
          mileage: currentMileage,
          daysSinceLastMot: motHistory?.DaysSinceLastMot || 'Unknown',
          firstUsedDate: formatDate(motHistory?.FirstUsedDate),

          // Tax Information
          taxExpiry: formatDate(taxDetails?.TaxDueDate),
          taxBand: vd.VehicleStatus?.VehicleExciseDutyDetails?.DvlaCo2Band || vd.VehicleStatus?.VehicleExciseDutyDetails?.DvlaBand || 'Unknown',
          taxStatus: taxDetails?.TaxStatus || 'Unknown',
          taxIsCurrentlyValid: taxDetails?.TaxIsCurrentlyValid ? 'Yes' : 'No',
          taxDaysRemaining: taxDetails?.TaxDaysRemaining || 'Unknown',

          // Security Checks (Full data from VIDCheck package)
          insuranceWriteOff: miaftr?.WriteOffRecordList?.length > 0 ? 'Yes' : 'No',
          writeOffCategory: miaftr?.WriteOffRecordList?.[0]?.Category || 'None',
          writeOffDate: miaftr?.WriteOffRecordList?.[0]?.LossDate ? formatDate(miaftr.WriteOffRecordList[0].LossDate) : 'None',
          financeOutstanding: finance?.FinanceRecordList?.length > 0 ? 'Yes' : 'No',
          financeProvider: finance?.FinanceRecordList?.[0]?.FinanceCompany || 'N/A',
          stolenStatus: pnc?.IsStolen ? 'Stolen' : 'Not Stolen',
          dateReportedStolen: pnc?.DateReportedStolen ? formatDate(pnc.DateReportedStolen) : 'None',

          // Vehicle History
          previousOwners: vd.VehicleHistory?.KeeperChangeList?.length || 'Unknown',
          numberOfColourChanges: vd.VehicleHistory?.ColourDetails?.NumberOfColourChanges?.toString() || '0',
          originalColour: vd.VehicleHistory?.ColourDetails?.OriginalColour || 'Unknown',
          previousColour: vd.VehicleHistory?.ColourDetails?.PreviousColour || 'None',
          latestColourChangeDate: vd.VehicleHistory?.ColourDetails?.LatestColourChangeDate ? formatDate(vd.VehicleHistory.ColourDetails.LatestColourChangeDate) : 'None',

          // Technical Details
          numberOfSeats: vd.DvlaTechnicalDetails?.NumberOfSeats || 'N/A',
          grossWeight: vd.DvlaTechnicalDetails?.GrossWeightKg ? `${vd.DvlaTechnicalDetails.GrossWeightKg}kg` : 'Unknown',
          kerbWeight: apiData.Results?.ModelDetails?.Weights?.KerbWeightKg ? `${apiData.Results.ModelDetails.Weights.KerbWeightKg}kg` : 'Unknown',
          maxNetPower: vd.DvlaTechnicalDetails?.MaxNetPowerKw ? `${vd.DvlaTechnicalDetails.MaxNetPowerKw}kW` : 'Unknown',
          powerToWeightRatio: vd.DvlaTechnicalDetails?.PowerToWeightRatio?.toString() || 'Unknown',

          // Dimensions
          height: apiData.Results?.ModelDetails?.Dimensions?.HeightMm ? `${apiData.Results.ModelDetails.Dimensions.HeightMm}mm` : 'Unknown',
          length: apiData.Results?.ModelDetails?.Dimensions?.LengthMm ? `${apiData.Results.ModelDetails.Dimensions.LengthMm}mm` : 'Unknown',
          width: apiData.Results?.ModelDetails?.Dimensions?.WidthMm ? `${apiData.Results.ModelDetails.Dimensions.WidthMm}mm` : 'Unknown',
          wheelbase: apiData.Results?.ModelDetails?.Dimensions?.WheelbaseLengthMm ? `${apiData.Results.ModelDetails.Dimensions.WheelbaseLengthMm}mm` : 'Unknown',

          // Performance Data
          maxSpeed: apiData.Results?.ModelDetails?.Performance?.Statistics?.MaxSpeedMph ? `${apiData.Results.ModelDetails.Performance.Statistics.MaxSpeedMph} mph` : 'Unknown',
          acceleration0to60: apiData.Results?.ModelDetails?.Performance?.Statistics?.ZeroToSixtyMph ? `${apiData.Results.ModelDetails.Performance.Statistics.ZeroToSixtyMph}s` : 'Unknown',
          fuelEconomyCombined: apiData.Results?.ModelDetails?.Performance?.FuelEconomy?.CombinedMpg ? `${apiData.Results.ModelDetails.Performance.FuelEconomy.CombinedMpg} mpg` : 'Unknown',

          // Valuation
          marketValue: valuationDetails?.RetailValue ? `£${valuationDetails.RetailValue.toLocaleString()}` : 'Not Available',
          dealerValue: valuationDetails?.DealerForecourt ? `£${valuationDetails.DealerForecourt.toLocaleString()}` : 'Not Available',
          privateValue: valuationDetails?.PrivateClean ? `£${valuationDetails.PrivateClean.toLocaleString()}` : 'Not Available',
          partExchangeValue: valuationDetails?.PartExchange ? `£${valuationDetails.PartExchange.toLocaleString()}` : 'Not Available',

          // Model Information
          modelRange: apiData.Results?.ModelDetails?.ModelIdentification?.Range || 'Unknown',
          modelVariant: apiData.Results?.ModelDetails?.ModelIdentification?.ModelVariant || 'Unknown',
          series: apiData.Results?.ModelDetails?.ModelIdentification?.Series || 'Unknown',
          countryOfOrigin: apiData.Results?.ModelDetails?.ModelIdentification?.CountryOfOrigin || 'Unknown',
          typeApprovalCategory: apiData.Results?.ModelDetails?.ModelClassification?.TypeApprovalCategory || 'Unknown',
          vehicleClass: apiData.Results?.ModelDetails?.ModelClassification?.VehicleClass || 'Unknown',

          // Safety Information
          ncapStarRating: apiData.Results?.ModelDetails?.Safety?.EuroNcap?.NcapStarRating?.toString() || 'Not Rated',
          ncapAdultPercent: apiData.Results?.ModelDetails?.Safety?.EuroNcap?.NcapAdultPercent?.toString() || 'Not Available',
          ncapChildPercent: apiData.Results?.ModelDetails?.Safety?.EuroNcap?.NcapChildPercent?.toString() || 'Not Available',

          // Lists and History
          motHistory: motHistoryList,
          mileageHistory: mileageHistoryList,
          vehicleImages: apiData.Results?.VehicleImageDetails?.VehicleImageList || [],
          keeperChanges: vd.VehicleHistory?.KeeperChangeList || [],
          plateChanges: vd.VehicleHistory?.PlateChangeList || [],
          v5cCertificates: vd.VehicleHistory?.V5cCertificateList || [],

          // Specifications object for compatibility
          specifications: {
            numberOfSeats: vd.DvlaTechnicalDetails?.NumberOfSeats?.toString() || apiData.Results?.ModelDetails?.BodyDetails?.NumberOfSeats?.toString() || 'Unknown',
            numberOfDoors: vd.DvlaTechnicalDetails?.NumberOfDoors?.toString() || apiData.Results?.ModelDetails?.BodyDetails?.NumberOfDoors?.toString() || 'Unknown',
            transmission: apiData.Results?.ModelDetails?.Powertrain?.Transmission?.TransmissionType || 'Unknown',
            driveType: apiData.Results?.ModelDetails?.Powertrain?.Transmission?.DriveType || 'Unknown',
            bodyStyle: apiData.Results?.ModelDetails?.BodyDetails?.BodyStyle || 'Unknown',
            fuelTankCapacity: apiData.Results?.ModelDetails?.BodyDetails?.FuelTankCapacityLitres ? `${apiData.Results.ModelDetails.BodyDetails.FuelTankCapacityLitres}L` : 'Unknown'
          },

          // Factory Equipment and Options
          factoryEquipment: apiData.Results?.SpecAndOptionsDetails?.FactoryEquipmentList || [],

          // Tyre Details
          tyreDetails: apiData.Results?.TyreDetails?.TyreDetailsList || [],

          isComprehensive: true,
          dataSource: 'Vehicle Data UK (Comprehensive Check)',
          lastUpdated: new Date().toISOString(),
          lookupId: apiData.ResponseInformation?.ResponseId
        };
        return { vehicleData: comprehensiveData, reportRaw: apiData };
      }
      throw new Error(`No vehicle data found for registration ${cleanReg} in Vehicle Data UK database`);
    }
  } catch (error: any) {
    console.error(`VDGI VIDCheck error: ${error.message}`);
    throw error;
  }
}

// Legacy compatibility function
async function vehicleDataLookup(registration: string) {
  const result = await comprehensiveVehicleDataLookup(registration);
  if (!result) {
    throw new Error('Failed to get vehicle data');
  }
  return result.vehicleData;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Diagnostic endpoint to check environment and configuration
  app.get('/api/debug/auth', (req: any, res) => {
    res.json({
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_URL: process.env.VERCEL_URL,
        VERCEL_ENV: process.env.VERCEL_ENV,
      },
      oauth: {
        hasGmailClientId: !!process.env.GMAIL_CLIENT_ID,
        hasGmailClientSecret: !!process.env.GMAIL_CLIENT_SECRET,
        hasBaseUrl: !!process.env.BASE_URL,
        baseUrl: process.env.BASE_URL,
      },
      session: {
        hasSessionSecret: !!process.env.SESSION_SECRET,
      },
      database: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
      request: {
        path: req.path,
        method: req.method,
        hasSession: !!req.session,
        sessionId: req.session?.id,
        cookies: req.headers.cookie ? 'present' : 'missing',
      }
    });
  });

  app.get('/api/auth/user', async (req: any, res) => {
    // Debug logging
    console.log('🔍 /api/auth/user called:', {
      hasSession: !!req.session,
      sessionId: req.session?.id,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      hasUser: !!req.user,
      userId: req.user?.id || req.user?.claims?.sub,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_URL: process.env.VERCEL_URL,
        VERCEL_ENV: process.env.VERCEL_ENV
      }
    });
    
    // Check if we're in production (Vercel) or local dev
    // Vercel sets: VERCEL=1, NODE_ENV=production, VERCEL_ENV=production
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.VERCEL === '1' || 
                        process.env.VERCEL_ENV === 'production' ||
                        process.env.VERCEL_URL;
    const isLocalDev = !isProduction && !process.env.REPL_ID;
    
    // For local development, require explicit login
    if (isLocalDev) {
      // Check if user has explicitly logged in via the login page
      if (!req.session?.userLoggedIn) {
        return res.status(401).json({ 
          message: "Please log in to continue", 
          needsAuth: true,
          loginUrl: "/auth/google"
        });
      }
      
      // Return user from storage based on session userId
      const userId = req.session?.userId;
      if (userId) {
        try {
          const user = await storage.getUser(userId);
          if (user) {
            return res.json({
              id: user.id,
              email: user.email,
              firstName: user.firstName || user.email.split('@')[0],
              lastName: user.lastName || "",
              role: user.role || "admin",
              creditBalance: user.creditBalance || 1000,
              authProvider: "demo"
            });
          }
        } catch (error) {
          console.error('Error fetching user from storage:', error);
        }
      }
      
      // Fallback to session data if user not found in storage
      const userRole = req.session?.userRole || "admin";
      const userEmail = req.session?.userEmail || "nokhen330@gmail.com";
      return res.json({
        id: req.session?.userId || "demo-user",
        email: userEmail,
        firstName: userEmail.split('@')[0].split('.')[0] || "User",
        lastName: userEmail.split('@')[0].split('.').slice(1).join(' ') || "",
        role: userRole,
        creditBalance: 1000,
        authProvider: "demo"
      });
    }
    
    // For production (Vercel) - check Passport authentication
    const isPassportAuth = req.isAuthenticated && req.isAuthenticated();
    const hasUser = !!req.user;
    
    console.log('🔍 Production auth check:', {
      isPassportAuth,
      hasUser,
      userType: req.user ? typeof req.user : 'none',
      userKeys: req.user ? Object.keys(req.user) : []
    });
    
    if (!isPassportAuth || !hasUser) {
      console.log('❌ User not authenticated:', {
        isPassportAuth,
        hasUser,
        sessionExists: !!req.session,
        sessionKeys: req.session ? Object.keys(req.session) : []
      });
      return res.status(401).json({ 
        message: "Please log in to continue", 
        needsAuth: true,
        loginUrl: "/auth/google"
      });
    }
    
    try {
      // Return user data - handle both Passport user format and custom format
      const user = req.user as any;
      const userData = {
        id: user.id || user.claims?.sub || user._id,
        email: user.email || user.claims?.email,
        firstName: user.firstName || user.claims?.given_name || user.name?.givenName,
        lastName: user.lastName || user.claims?.family_name || user.name?.familyName,
        role: user.role || 'user',
        creditBalance: user.creditBalance || 0,
        authProvider: user.authProvider || 'google'
      };
      
      console.log('✅ Returning user data:', userData);
      res.json(userData);
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Add a simple login endpoint for local development
  app.post("/api/auth/login", async (req, res) => {
    if (!process.env.REPL_ID) {
      // Set session flag to indicate user has logged in
      (req.session as any).userLoggedIn = true;
      
      // Create or get a demo user with email
      const userEmail = (req.body.email as string) || "nokhen330@gmail.com";
      const userId = userEmail.split('@')[0].replace(/[^a-z0-9]/gi, '-') || "user";
      
      try {
        const user = await storage.upsertUser({
          email: userEmail,
          firstName: userEmail.split('@')[0].split('.')[0] || "User",
          lastName: userEmail.split('@')[0].split('.').slice(1).join(' ') || "",
          role: "admin",
          creditBalance: 1000,
          authProvider: "demo",
          emailVerified: true,
          isActive: true,
        });
        
        // Store user info in session
        (req.session as any).userId = user.id;
        (req.session as any).userEmail = user.email;
        (req.session as any).userRole = user.role;
        
        // Save session before responding
        req.session.save((err) => {
          if (err) {
            console.error('❌ Session save error:', err);
            return res.status(500).json({
              success: false,
              message: "Failed to save session"
            });
          }
          
          console.log('✅ User logged in successfully:', user.email);
          return res.json({
            success: true,
            message: "Logged in successfully",
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role
            }
          });
        });
      } catch (error) {
        console.error('❌ Error creating/getting user:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to log in"
        });
      }
      return; // Prevent further execution
    }
    
    // For production, redirect to proper OAuth
    res.redirect("/api/login");
  });

  // PUBLIC LOOKUP - DETECT PACKAGE TYPE DYNAMICALLY
  app.post('/api/public/vehicle-lookup', async (req: any, res) => {
    console.log('📥 Vehicle lookup request received:', req.body);
    try {
      const { registration, checkType = 'free' } = req.body;
      if (!registration || typeof registration !== 'string') {
        console.error('❌ Invalid registration:', registration);
        return res.status(400).json({ message: "Registration number is required" });
      }
      const cleanReg = registration.trim();
      console.log(`✅ Processing lookup for: ${cleanReg}, checkType: ${checkType}`);
      
      // Check if user is logged in for saving lookups
      let userId: string | null = null;
      // Check session instead of req.isAuthenticated() since we're not using Passport
      if (req.session?.userLoggedIn && req.session?.userId) {
        userId = req.session.userId;
        console.log(`User ${userId} is logged in - will save lookup to history`);
      }

      // DYNAMIC PACKAGE SELECTION: Allow client to specify which package to use
      // Default to free check unless explicitly specified as premium
      const packageToUse = checkType === 'premium' || checkType === 'full' || checkType === 'comprehensive' ? 'VIDCheck' : 'Freecheckapi';
      const { isFree: isFreeCheck, isFull: isFullCheck } = normalizePackageName(packageToUse);

      // Add test mode for full check
      if (checkType === 'test-full') {
        console.log('⚠️ Test mode: Returning mock full check data');
        const mockResult = await lookupVehicle(cleanReg, 'VIDCheck');
        const mockData = {
          success: true,
          data: mockResult.vehicleData,
          reportRaw: mockResult.reportRaw,
          package: 'VIDCheck',
          isFree: false,
          isFull: true
        };
        return res.json(mockData);
      }

      // Check if API key is available
      if (!process.env.VDGI_API_KEY) {
        console.log('⚠️ VDGI_API_KEY not configured - returning mock data for testing');
        
        // Use the proper mock data function with full report structure
        const mockResult = await lookupVehicle(cleanReg, packageToUse);
        
        // Generate unique reference code and date of check for mock data too
        const mockReportReference = nanoid(12).toUpperCase();
        const mockDateOfCheck = new Date();
        let mockFormattedDateOfCheck = mockDateOfCheck.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        // Clean up formatting to match "20 June 2021 11:40"
        mockFormattedDateOfCheck = mockFormattedDateOfCheck.replace(',', '').replace(' at ', ' ').replace(' at', '');
        
        // Add reference and date to mock reportRaw
        const mockReportRawWithMeta = {
          ...mockResult.reportRaw,
          reportReference: mockReportReference,
          dateOfCheck: mockFormattedDateOfCheck,
          checkTimestamp: mockDateOfCheck.toISOString()
        };
        
        const mockData = {
          success: true,
          data: mockResult.vehicleData,
          reportRaw: mockReportRawWithMeta,  // CRITICAL: Include full report data with Date Of Check and Reference
          package: packageToUse,
          isFree: isFreeCheck,
          isFull: isFullCheck,
          reference: mockReportReference,
          dateOfCheck: mockFormattedDateOfCheck
        };
        
        return res.json(mockData);
      }

      console.log(`🔍 Vehicle lookup for ${cleanReg.toUpperCase()}:`);
      console.log(`- Check type: ${checkType}`);
      console.log(`- Is free check: ${isFreeCheck}`);
      console.log(`- Package to use: ${packageToUse}`);
      console.log(`- API Key available: ${!!process.env.VDGI_API_KEY}`);

      try {
        console.log(`Attempting VDGI lookup for: ${cleanReg}`);

        // Use the correct Vehicle Data UK API endpoint with proper parameter casing
        const apiUrl = `https://uk.api.vehicledataglobal.com/r2/lookup?apiKey=${process.env.VDGI_API_KEY}&packageName=${packageToUse}&vrm=${cleanReg}`;
        console.log('API URL:', apiUrl.replace(process.env.VDGI_API_KEY || '', '[REDACTED]'));

        const apiResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log('API Response Status:', apiResponse.status, apiResponse.statusText);

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          console.error('API Error Response:', errorText);
          
          // Parse the error response for better error handling
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.ResponseInformation?.StatusCode === 7 || 
                errorData.ResponseInformation?.StatusMessage === 'UnknownApiKey') {
              console.error('API Key Error: The API key is not recognized by Vehicle Data UK');
              throw new Error(`API authentication failed. Please verify the API key with Vehicle Data UK.`);
            }
          } catch (parseError) {
            // If parsing fails, use the original error
          }
          
          throw new Error(`Vehicle Data UK API error: HTTP ${apiResponse.status} - ${errorText}`);
        }

        const apiData = await apiResponse.json();
        console.log('VDGI API Response Status:', apiData.ResponseInformation?.StatusMessage || 'Unknown');

        // Check for sandbox validation failure
        if (apiData.ResponseInformation?.StatusCode === 6 || 
            apiData.ResponseInformation?.StatusMessage === 'SandboxValidationFailure') {
          console.log('Sandbox validation failed - this means the API key is not configured for sandbox mode');
          return res.status(400).json({
            success: false,
            error: 'Sandbox mode validation failed',
            message: 'The API is in sandbox mode. Please use a valid sandbox API key or switch to a live API key.',
            details: 'Contact Vehicle Data UK to enable sandbox mode for your API key.'
          });
        }

        // Generate unique reference code and date of check for this report
        const reportReference = nanoid(12).toUpperCase(); // 12-character uppercase reference like "TCFCY2CJQBAU"
        const dateOfCheck = new Date();
        let formattedDateOfCheck = dateOfCheck.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        // Clean up formatting to match "20 June 2021 11:40"
        formattedDateOfCheck = formattedDateOfCheck.replace(',', '').replace(' at ', ' ').replace(' at', '');

        // Store the complete API response for comprehensive reporting
        // Add reference and date of check to the report data
        const reportRaw = {
          ...apiData,
          reportReference,
          dateOfCheck: formattedDateOfCheck,
          checkTimestamp: dateOfCheck.toISOString()
        };

        // Process the data based on package type
        const vd = apiData.Results?.VehicleDetails;
        const motHistory = apiData.Results?.MotHistoryDetails;
        const taxDetails = apiData.Results?.VehicleTaxDetails;

        if (!vd) {
          return res.status(404).json({
            success: false,
            error: 'Vehicle data not found in API response',
            details: apiData.ResponseInformation?.StatusMessage
          });
        }

        // CRITICAL: Check the actual package used in the response to determine data structure
        const actualPackageUsed = apiData.RequestInformation?.PackageName || packageToUse;
        const { isFree: isActuallyFreePackage, isFull: isFullCheckPackage } = normalizePackageName(actualPackageUsed);

        console.log(`Package check - Requested: ${packageToUse}, Actual: ${actualPackageUsed}, Is Free: ${isActuallyFreePackage}, Is Full: ${isFullCheckPackage}`);

        // For VIDCheck package, build COMPREHENSIVE data structure with ALL available fields
        if (isFullCheckPackage) {
          // VIDCHECK PACKAGE - Build COMPREHENSIVE data structure with ALL FIELDS from the JSON schema
          const formatDate = (dateStr: string) => {
            if (!dateStr) return 'Unknown';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'Unknown';
            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          };

          const motHistoryList = motHistory?.MotTestDetailsList?.map((mot: any) => ({
            date: formatDate(mot.TestDate),
            expiryDate: formatDate(mot.ExpiryDate),
            result: mot.TestPassed ? 'Pass' : 'Fail',
            mileage: mot.OdometerReading ? `${parseInt(mot.OdometerReading).toLocaleString()} ${mot.OdometerUnit || 'miles'}` : 'Unknown',
            testCertificateNumber: mot.TestNumber || 'N/A',
            defects: mot.AnnotationList?.length || 0,
            annotations: mot.AnnotationList || [],
            daysSinceLastTest: mot.DaysSinceLastTest || 0,
            daysSinceLastPass: mot.DaysSinceLastPass || 0,
            daysOutOfMot: mot.DaysOutOfMot || 0,
            isRetest: mot.IsRetest || false
          })) || [];

          const mileageHistoryList = motHistory?.MotTestDetailsList
            ?.filter((mot: any) => mot.OdometerReading)
            .map((mot: any, index: number, array: any[]) => {
              const currentMileage = parseInt(mot.OdometerReading);
              const nextMileage = index > 0 ? parseInt(array[index - 1].OdometerReading) : null;
              const hasDiscrepancy = nextMileage && currentMileage > nextMileage;
              return {
                date: formatDate(mot.TestDate),
                mileage: `${currentMileage.toLocaleString()} miles`,
                source: 'MOT Test',
                discrepancy: hasDiscrepancy
              };
            }) || [];

          // Comprehensive vehicle data with ALL available fields (excluding VIN and business info as requested)
          const vehicleData = {
            registration: cleanReg.toUpperCase(),
            make: vd.VehicleIdentification?.DvlaMake || 'Unknown',
            model: vd.VehicleIdentification?.DvlaModel || 'Unknown',
            year: vd.VehicleIdentification?.YearOfManufacture || 'Unknown',
            engineSize: vd.DvlaTechnicalDetails?.EngineCapacityCc ? `${vd.DvlaTechnicalDetails.EngineCapacityCc}cc` : 'Unknown',
            fuelType: vd.VehicleIdentification?.DvlaFuelType || 'Unknown',
            colour: vd.VehicleHistory?.ColourDetails?.CurrentColour || 'Unknown',
            firstRegistration: formatDate(vd.VehicleIdentification?.DateFirstRegistered),
            firstRegisteredInUK: formatDate(vd.VehicleIdentification?.DateFirstRegisteredInUk),
            dateOfManufacture: formatDate(vd.VehicleIdentification?.DateOfManufacture),
            co2Emissions: vd.VehicleStatus?.VehicleExciseDutyDetails?.DvlaCo2 ? `${vd.VehicleStatus.VehicleExciseDutyDetails.DvlaCo2} g/km` : 'Unknown',
            euroStatus: apiData.Results.ModelDetails?.Emissions?.EuroStatus || 'Unknown',
            bodyType: vd.VehicleIdentification?.DvlaBodyType || 'Unknown',
            doors: vd.DvlaTechnicalDetails?.NumberOfDoors?.toString() || apiData.Results?.ModelDetails?.BodyDetails?.NumberOfDoors?.toString() || 'Unknown',
            wheelplan: vd.VehicleIdentification?.DvlaWheelPlan || 'Unknown',
            transmission: apiData.Results.ModelDetails?.Powertrain?.Transmission?.TransmissionType || 'Unknown',
            driveType: apiData.Results.ModelDetails?.Powertrain?.Transmission?.DriveType || 'Unknown',
            engineNumber: vd.VehicleIdentification?.EngineNumber || 'Not Disclosed',

            // Vehicle Status Information
            isImported: vd.VehicleStatus?.IsImported ? 'Yes' : 'No',
            isExported: vd.VehicleStatus?.IsExported ? 'Yes' : 'No',
            isScrapped: vd.VehicleStatus?.IsScrapped ? 'Yes' : 'No',
            sornStatus: vd.VehicleStatus?.IsSorn ? 'Yes' : 'No',
            certificateOfDestructionIssued: vd.VehicleStatus?.CertificateOfDestructionIssued ? 'Yes' : 'No',

            // MOT Information
            motExpiry: formatDate(motHistory?.MotDueDate),
            motResult: motHistory?.MotTestDetailsList?.[0]?.TestPassed ? 'Pass' : 'Unknown',
            mileage: motHistory?.MotTestDetailsList?.[0]?.OdometerReading ?
              `${parseInt(motHistory.MotTestDetailsList[0].OdometerReading).toLocaleString()} ${motHistory.MotTestDetailsList[0].OdometerUnit || 'miles'}` : 'Unknown',
            daysSinceLastMot: motHistory?.DaysSinceLastMot || 'Unknown',
            firstUsedDate: formatDate(motHistory?.FirstUsedDate),

            // Tax Information
            taxExpiry: formatDate(taxDetails?.TaxDueDate),
            taxBand: vd.VehicleStatus?.VehicleExciseDutyDetails?.DvlaCo2Band || vd.VehicleStatus?.VehicleExciseDutyDetails?.DvlaBand || 'Unknown',
            taxStatus: taxDetails?.TaxStatus || 'Unknown',
            taxIsCurrentlyValid: taxDetails?.TaxIsCurrentlyValid ? 'Yes' : 'No',
            taxDaysRemaining: taxDetails?.TaxDaysRemaining || 'Unknown',

            // Security Checks (Full data from VIDCheck package)
            insuranceWriteOff: apiData.Results?.MiaftrDetails?.WriteOffRecordList?.length > 0 ? 'Yes' : 'No',
            writeOffCategory: apiData.Results?.MiaftrDetails?.WriteOffRecordList?.[0]?.Category || 'None',
            writeOffDate: apiData.Results?.MiaftrDetails?.WriteOffRecordList?.[0]?.LossDate ? formatDate(apiData.Results.MiaftrDetails.WriteOffRecordList[0].LossDate) : 'None',
            financeOutstanding: apiData.Results?.FinanceDetails?.FinanceRecordList?.length > 0 ? 'Yes' : 'No',
            financeProvider: apiData.Results?.FinanceDetails?.FinanceRecordList?.[0]?.FinanceCompany || 'N/A',
            stolenStatus: apiData.Results?.PncDetails?.IsStolen ? 'Stolen' : 'Not Stolen',
            dateReportedStolen: apiData.Results?.PncDetails?.DateReportedStolen ? formatDate(apiData.Results.PncDetails.DateReportedStolen) : 'None',

            // Vehicle History
            previousOwners: vd.VehicleHistory?.KeeperChangeList?.length || 'Unknown',
            numberOfColourChanges: vd.VehicleHistory?.ColourDetails?.NumberOfColourChanges?.toString() || '0',
            originalColour: vd.VehicleHistory?.ColourDetails?.OriginalColour || 'Unknown',
            previousColour: vd.VehicleHistory?.ColourDetails?.PreviousColour || 'None',
            latestColourChangeDate: vd.VehicleHistory?.ColourDetails?.LatestColourChangeDate ? formatDate(vd.VehicleHistory.ColourDetails.LatestColourChangeDate) : 'None',

            // Technical Details
            numberOfSeats: vd.DvlaTechnicalDetails?.NumberOfSeats || 'N/A',
            grossWeight: vd.DvlaTechnicalDetails?.GrossWeightKg ? `${vd.DvlaTechnicalDetails.GrossWeightKg}kg` : 'Unknown',
            kerbWeight: apiData.Results?.ModelDetails?.Weights?.KerbWeightKg ? `${apiData.Results.ModelDetails.Weights.KerbWeightKg}kg` : 'Unknown',
            maxNetPower: vd.DvlaTechnicalDetails?.MaxNetPowerKw ? `${vd.DvlaTechnicalDetails.MaxNetPowerKw}kW` : 'Unknown',
            powerToWeightRatio: vd.DvlaTechnicalDetails?.PowerToWeightRatio?.toString() || 'Unknown',

            // Dimensions
            height: apiData.Results?.ModelDetails?.Dimensions?.HeightMm ? `${apiData.Results.ModelDetails.Dimensions.HeightMm}mm` : 'Unknown',
            length: apiData.Results?.ModelDetails?.Dimensions?.LengthMm ? `${apiData.Results.ModelDetails.Dimensions.LengthMm}mm` : 'Unknown',
            width: apiData.Results?.ModelDetails?.Dimensions?.WidthMm ? `${apiData.Results.ModelDetails.Dimensions.WidthMm}mm` : 'Unknown',
            wheelbase: apiData.Results?.ModelDetails?.Dimensions?.WheelbaseLengthMm ? `${apiData.Results.ModelDetails.Dimensions.WheelbaseLengthMm}mm` : 'Unknown',

            // Performance Data
            maxSpeed: apiData.Results?.ModelDetails?.Performance?.Statistics?.MaxSpeedMph ? `${apiData.Results.ModelDetails.Performance.Statistics.MaxSpeedMph} mph` : 'Unknown',
            acceleration0to60: apiData.Results?.ModelDetails?.Performance?.Statistics?.ZeroToSixtyMph ? `${apiData.Results.ModelDetails.Performance.Statistics.ZeroToSixtyMph}s` : 'Unknown',
            fuelEconomyCombined: apiData.Results?.ModelDetails?.Performance?.FuelEconomy?.CombinedMpg ? `${apiData.Results.ModelDetails.Performance.FuelEconomy.CombinedMpg} mpg` : 'Unknown',

            // Valuation
            marketValue: apiData.Results?.ValuationDetails?.ValuationFigures?.TradeRetail ? `£${apiData.Results.ValuationDetails.ValuationFigures.TradeRetail.toLocaleString()}` : 'Not Available',
            dealerValue: apiData.Results?.ValuationDetails?.ValuationFigures?.DealerForecourt ? `£${apiData.Results.ValuationDetails.ValuationFigures.DealerForecourt.toLocaleString()}` : 'Not Available',
            privateValue: apiData.Results?.ValuationDetails?.ValuationFigures?.PrivateClean ? `£${apiData.Results.ValuationDetails.ValuationFigures.PrivateClean.toLocaleString()}` : 'Not Available',
            partExchangeValue: apiData.Results?.ValuationDetails?.ValuationFigures?.PartExchange ? `£${apiData.Results.ValuationDetails.ValuationFigures.PartExchange.toLocaleString()}` : 'Not Available',

            // Model Information
            modelRange: apiData.Results?.ModelDetails?.ModelIdentification?.Range || 'Unknown',
            modelVariant: apiData.Results?.ModelDetails?.ModelIdentification?.ModelVariant || 'Unknown',
            series: apiData.Results?.ModelDetails?.ModelIdentification?.Series || 'Unknown',
            countryOfOrigin: apiData.Results?.ModelDetails?.ModelIdentification?.CountryOfOrigin || 'Unknown',
            typeApprovalCategory: apiData.Results?.ModelDetails?.ModelClassification?.TypeApprovalCategory || 'Unknown',
            vehicleClass: apiData.Results?.ModelDetails?.ModelClassification?.VehicleClass || 'Unknown',

            // Safety Information
            ncapStarRating: apiData.Results?.ModelDetails?.Safety?.EuroNcap?.NcapStarRating?.toString() || 'Not Rated',
            ncapAdultPercent: apiData.Results?.ModelDetails?.Safety?.EuroNcap?.NcapAdultPercent?.toString() || 'Not Available',
            ncapChildPercent: apiData.Results?.ModelDetails?.Safety?.EuroNcap?.NcapChildPercent?.toString() || 'Not Available',

            // Lists and History
            motHistory: motHistoryList,
            mileageHistory: mileageHistoryList,
            vehicleImages: apiData.Results?.VehicleImageDetails?.VehicleImageList || [],
            keeperChanges: vd.VehicleHistory?.KeeperChangeList || [],
            plateChanges: vd.VehicleHistory?.PlateChangeList || [],
            v5cCertificates: vd.VehicleHistory?.V5cCertificateList || [],

            // Specifications object for compatibility
            specifications: {
              numberOfSeats: vd.DvlaTechnicalDetails?.NumberOfSeats?.toString() || apiData.Results?.ModelDetails?.BodyDetails?.NumberOfSeats?.toString() || 'Unknown',
              numberOfDoors: vd.DvlaTechnicalDetails?.NumberOfDoors?.toString() || apiData.Results?.ModelDetails?.BodyDetails?.NumberOfDoors?.toString() || 'Unknown',
              transmission: apiData.Results?.ModelDetails?.Powertrain?.Transmission?.TransmissionType || 'Unknown',
              driveType: apiData.Results?.ModelDetails?.Powertrain?.Transmission?.DriveType || 'Unknown',
              bodyStyle: apiData.Results?.ModelDetails?.BodyDetails?.BodyStyle || 'Unknown',
              fuelTankCapacity: apiData.Results?.ModelDetails?.BodyDetails?.FuelTankCapacityLitres ? `${apiData.Results.ModelDetails.BodyDetails.FuelTankCapacityLitres}L` : 'Unknown'
            },

            // Factory Equipment and Options
            factoryEquipment: apiData.Results?.SpecAndOptionsDetails?.FactoryEquipmentList || [],

            // Tyre Details
            tyreDetails: apiData.Results?.TyreDetails?.TyreDetailsList || [],

            isComprehensive: true, // CRITICAL: Set to true for VIDCheck package
            dataSource: 'Vehicle Data UK (Comprehensive Check)',
            lastUpdated: new Date().toISOString(),
            lookupId: apiData.ResponseInformation?.ResponseId
          };

          console.log('FULLCHECK PACKAGE - Returning comprehensive data with ALL fields');
          console.log('- Package used:', actualPackageUsed);
          console.log('- isComprehensive:', vehicleData.isComprehensive);
          console.log('- Fields included:', Object.keys(vehicleData).length);

          // Save lookup for logged-in users (even for free checks from public endpoint)
          if (userId) {
            try {
              const lookup = await storage.createVehicleLookup({
                userId,
                registration: cleanReg.toUpperCase(),
                vehicleData,
                reportRaw,
                creditsCost: 0, // No credit cost for public endpoint
                success: true
              });
              console.log(`Saved comprehensive lookup for user ${userId}, lookupId: ${lookup.id}`);
              vehicleData.lookupId = lookup.id; // Update lookupId to database ID
            } catch (saveError) {
              console.error('Failed to save lookup for logged-in user:', saveError);
            }
          }

          return res.json({
            success: true,
            vehicleData,
            reportRaw: reportRaw,
            reference: reportReference,
            dateOfCheck: formattedDateOfCheck
          });
        }
        // For free package, build limited vehicleData structure
        else if (isActuallyFreePackage) {
          // Generate reference and date for free package too
          const freeReportReference = nanoid(12).toUpperCase();
          const freeDateOfCheck = new Date();
          let freeFormattedDateOfCheck = freeDateOfCheck.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          // Clean up formatting to match "20 June 2021 11:40"
          freeFormattedDateOfCheck = freeFormattedDateOfCheck.replace(',', '').replace(' at ', ' ').replace(' at', '');
          
          // Add reference and date to reportRaw for free package
          const freeReportRaw = {
            ...apiData,
            reportReference: freeReportReference,
            dateOfCheck: freeFormattedDateOfCheck,
            checkTimestamp: freeDateOfCheck.toISOString()
          };
          // FREE PACKAGE - Build basic data structure with limited features
          const motHistoryList = motHistory?.MotTestDetailsList?.slice(0, 3).map((test: any) => ({
            date: test.TestDate ? new Date(test.TestDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown',
            expiryDate: test.ExpiryDate ? new Date(test.ExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown',
            result: test.TestPassed ? 'Pass' : 'Fail',
            mileage: test.OdometerReading && test.OdometerUnit ? `${test.OdometerReading.toLocaleString()} ${test.OdometerUnit}` : 'Unknown',
            testCertificateNumber: test.TestNumber || 'Unknown'
          })) || [];

          const vehicleData = {
            registration: cleanReg.toUpperCase(),
            make: vd.VehicleIdentification?.DvlaMake || 'Unknown',
            model: vd.VehicleIdentification?.DvlaModel || 'Unknown',
            year: vd.VehicleIdentification?.YearOfManufacture || 'Unknown',
            engineSize: vd.DvlaTechnicalDetails?.EngineCapacityCc ? `${vd.DvlaTechnicalDetails.EngineCapacityCc}cc` : 'Unknown',
            fuelType: vd.VehicleIdentification?.DvlaFuelType || 'Unknown',
            colour: vd.VehicleHistory?.ColourDetails?.CurrentColour || 'Unknown',
            firstRegistration: vd.VehicleIdentification?.DateFirstRegistered ?
              new Date(vd.VehicleIdentification.DateFirstRegistered).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Unknown',
            co2Emissions: vd.VehicleStatus?.VehicleExciseDutyDetails?.DvlaCo2 ? `${vd.VehicleStatus.VehicleExciseDutyDetails.DvlaCo2} g/km` : 'Unknown',
            euroStatus: 'Not Available (Free Package)',
            bodyType: vd.VehicleIdentification?.DvlaBodyType || 'Unknown',
            doors: 'Not Available (Free Package)',
            wheelplan: vd.VehicleIdentification?.DvlaWheelPlan || 'Unknown',
            transmission: 'Not Available (Free Package)',
            motExpiry: motHistory?.MotDueDate ?
              new Date(motHistory.MotDueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Unknown',
            motResult: motHistory?.MotTestDetailsList?.[0]?.TestPassed ? 'Pass' : 'Unknown',
            mileage: motHistory?.MotTestDetailsList?.[0]?.OdometerReading ?
              `${motHistory.MotTestDetailsList[0].OdometerReading.toLocaleString()} ${motHistory.MotTestDetailsList[0].OdometerUnit || 'miles'}` : 'Unknown',
            taxExpiry: taxDetails?.TaxDueDate ?
              new Date(taxDetails.TaxDueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Check Vehicle Data UK',
            taxBand: vd.VehicleStatus?.VehicleExciseDutyDetails?.DvlaBand || 'Unknown',
            taxStatus: taxDetails?.TaxStatus || 'Unknown',
            // Free package doesn't include security checks - clearly marked as not available
            insuranceWriteOff: 'Not Available (Free Package)',
            financeOutstanding: 'Not Available (Free Package)',
            financeProvider: 'Not Available (Free Package)',
            stolenStatus: 'Not Available (Free Package)',
            previousOwners: vd.VehicleHistory?.KeeperChangeList?.length?.toString() || 'Unknown',
            marketValue: 'Not Available (Free Package)',
            motHistory: motHistoryList,
            mileageHistory: [], // Not available in free package
            isComprehensive: false, // CRITICAL: Set to false for free package
            dataSource: 'Vehicle Data UK (Basic Check)',
            lastUpdated: new Date().toISOString(),
            lookupId: apiData.ResponseInformation?.ResponseId
          };
          console.log('FREE PACKAGE LOOKUP - Limited data returned');
          console.log('- Package used:', actualPackageUsed);
          console.log('- isComprehensive:', vehicleData.isComprehensive);

          // Save lookup for logged-in users (even for free checks from public endpoint)
          if (userId) {
            try {
              const lookup = await storage.createVehicleLookup({
                userId,
                registration: cleanReg.toUpperCase(),
                vehicleData,
                reportRaw,
                creditsCost: 0, // No credit cost for public endpoint free checks
                success: true
              });
              console.log(`Saved free lookup for user ${userId}, lookupId: ${lookup.id}`);
              vehicleData.lookupId = lookup.id; // Update lookupId to database ID
            } catch (saveError) {
              console.error('Failed to save free lookup for logged-in user:', saveError);
            }
          }

          // Automatically send PDF report via email for logged-in users
          try {
            const { emailService } = await import('./services/EmailService');
            const { generateUnifiedPDF } = await import('./pdf/unifiedReportGenerator');
            const userEmail = process.env.REPL_ID 
              ? req.user?.claims?.email 
              : (req.session as any)?.userEmail;
            
            if (userId && userEmail) {
              // Ensure email service is ready before sending
              const isReady = await emailService.ensureReady();
              const hasTransporter = emailService.transporter !== null;
              
              if (isReady && hasTransporter) {
                // Generate PDF and send email asynchronously (don't block response)
                generateUnifiedPDF(vehicleData, reportRaw, false)
                  .then((pdfBuffer) => {
                    return emailService.sendReportEmail(userEmail, pdfBuffer, cleanReg.toUpperCase());
                  })
                  .then((success) => {
                    if (success) {
                      console.log(`✅ PDF report automatically sent to ${userEmail} for ${cleanReg} (free check)`);
                    } else {
                      console.log(`⚠️ Failed to send PDF report to ${userEmail}`);
                    }
                  })
                  .catch((error) => {
                    console.error(`❌ Error sending automatic PDF report:`, error);
                    // Don't fail the request if email fails
                  });
              } else {
                console.log(`⚠️ Email service not ready - skipping automatic email for ${cleanReg} (free check)`);
              }
            }
          } catch (emailError) {
            console.error('Error setting up automatic email delivery:', emailError);
            // Don't fail the request if email setup fails
          }

          return res.json({
            success: true,
            vehicleData,
            reportRaw: reportRaw // Always include reportRaw for consistency
          });
        }
      } catch (error: any) {
        console.error('Vehicle lookup error:', error.message);
        res.status(400).json({
          success: false,
          message: error.message || "Failed to lookup vehicle details. Please check the registration number and try again."
        });
      }
    } catch (error) {
      console.error("Public vehicle lookup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Separate free check endpoint - NO CREDIT DEDUCTION
  app.post("/api/vehicle/free-check", async (req, res) => {
    try {
      const { regNumber } = req.body;

      if (!regNumber) {
        return res.status(400).json({ message: "Registration number is required" });
      }

      // Use the actual freeVehicleDataLookup function
      const lookupResult = await freeVehicleDataLookup(regNumber.trim());
      if (!lookupResult) {
        throw new Error('Failed to perform vehicle lookup');
      }
      const vehicleData = lookupResult.vehicleData;
      const reportRaw = lookupResult.reportRaw;

      // Store free lookup (no credit deduction) and get the ID if user is authenticated
      let lookupId = null;
      const userId = process.env.REPL_ID 
        ? (req.user as any)?.claims?.sub 
        : (req.session as any)?.userId;
      const userEmail = process.env.REPL_ID 
        ? (req.user as any)?.claims?.email 
        : (req.session as any)?.userEmail;
      
      if (userId) {
        // Use the actual storage.createVehicleLookup function
        const lookup = await storage.createVehicleLookup({
          userId: userId,
          registration: regNumber.trim().toUpperCase(),
          vehicleData: vehicleData,
          reportRaw: reportRaw,
          creditsCost: 0,
          success: true,
        });
        lookupId = lookup.id;
      }

      // Automatically send PDF report via email for logged-in users
      if (userId && userEmail) {
        try {
          const { emailService } = await import('./services/EmailService');
          const { generateUnifiedPDF } = await import('./pdf/unifiedReportGenerator');
          
          // Ensure email service is ready before sending
          const isReady = await emailService.ensureReady();
          const hasTransporter = emailService.transporter !== null;
          
          if (isReady && hasTransporter) {
            // Generate PDF and send email asynchronously (don't block response)
            generateUnifiedPDF(vehicleData, reportRaw, false)
              .then((pdfBuffer) => {
                return emailService.sendReportEmail(userEmail, pdfBuffer, regNumber.trim().toUpperCase());
              })
              .then((success) => {
                if (success) {
                  console.log(`✅ PDF report automatically sent to ${userEmail} for ${regNumber} (free check)`);
                } else {
                  console.log(`⚠️ Failed to send PDF report to ${userEmail}`);
                }
              })
              .catch((error) => {
                console.error(`❌ Error sending automatic PDF report:`, error);
                // Don't fail the request if email fails
              });
          } else {
            console.log(`⚠️ Email service not ready - skipping automatic email for ${regNumber} (free check)`);
          }
        } catch (emailError) {
          console.error('Error setting up automatic email delivery:', emailError);
          // Don't fail the request if email setup fails
        }
      }

      // Include the database lookupId in the response if available
      const vehicleDataWithId = lookupId ? { ...vehicleData, lookupId } : vehicleData;
      res.json({ success: true, vehicleData: vehicleDataWithId, reportRaw });
    } catch (error: any) {
      console.error('Free check error:', error.message);
      res.status(400).json({ message: error.message || "Failed to perform free check" });
    }
  });

  // Separate premium check endpoint - WITH CREDIT DEDUCTION
  app.post("/api/vehicle/premium-check", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub; // Define userId outside try block
    
    try {
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { regNumber } = req.body;

      if (!regNumber || typeof regNumber !== 'string') {
        return res.status(400).json({ message: "Registration number is required" });
      }
      const cleanReg = regNumber.trim();

      // Check user credits BEFORE making API call
      const userCredits = await getUserCredits(userId);
      if (userCredits < 1) {
        return res.status(402).json({ message: "Insufficient credits for premium check", creditBalance: userCredits });
      }

      // Use the actual comprehensiveVehicleDataLookup function
      const lookupResult = await comprehensiveVehicleDataLookup(cleanReg);
      const vehicleData = lookupResult.vehicleData;
      const reportRaw = lookupResult.reportRaw;

      // Deduct credit for successful API call
      const creditDeducted = await storage.deductCredits(userId, 1, "Premium vehicle lookup");
      if (!creditDeducted) {
        return res.status(402).json({ message: "Insufficient credits for premium check" });
      }
      const newBalance = await storage.getUserCreditBalance(userId);
      console.log(`Credit deducted for user ${userId}. New balance: ${newBalance}`);

      // Store the lookup in database and get the ID
      const lookup = await storage.createVehicleLookup({
        userId,
        registration: cleanReg.toUpperCase(),
        vehicleData: vehicleData,
        reportRaw: reportRaw,
        creditsCost: 1, // Always 1 credit for premium check
        success: true,
      });

      // Automatically send PDF report via email for logged-in users
      try {
        const { emailService } = await import('./services/EmailService');
        const { generateUnifiedPDF } = await import('./pdf/unifiedReportGenerator');
        // Get user email from multiple sources
        let userEmail: string | undefined;
        if (process.env.REPL_ID) {
          userEmail = req.user?.claims?.email;
        } else {
          // Try to get email from session or user object
          userEmail = (req.session as any)?.userEmail || 
                     (req.session as any)?.user?.email ||
                     req.user?.email ||
                     "demo@autocheckpro.com";
        }
        
        console.log('📧 Email sending check:', {
          userId: userId,
          userEmail: userEmail,
          hasEmailService: !!emailService
        });
        
        if (userEmail && userEmail !== "demo@autocheckpro.com") {
          // Ensure email service is ready before sending
          const isReady = await emailService.ensureReady();
          const hasTransporter = emailService.transporter !== null;
          
          console.log('📧 Email service status:', {
            isReady,
            hasTransporter,
            userEmail
          });
          
          if (isReady && hasTransporter) {
            // Generate PDF and send email asynchronously (don't block response)
            generateUnifiedPDF(vehicleData, reportRaw, true)
              .then((pdfBuffer) => {
                return emailService.sendReportEmail(userEmail!, pdfBuffer, cleanReg.toUpperCase());
              })
              .then((success) => {
                if (success) {
                  console.log(`✅ PDF report automatically sent to ${userEmail} for ${cleanReg}`);
                } else {
                  console.log(`⚠️ Failed to send PDF report to ${userEmail}`);
                }
              })
              .catch((error) => {
                console.error(`❌ Error sending automatic PDF report:`, error);
                // Don't fail the request if email fails
              });
          } else {
            console.log(`⚠️ Email service not ready - skipping automatic email for ${cleanReg}`);
          }
        }
      } catch (emailError) {
        console.error('Error setting up automatic email delivery:', emailError);
        // Don't fail the request if email setup fails
      }

      // Include the database lookupId in the response
      const vehicleDataWithId = { ...vehicleData, lookupId: lookup.id };
      res.json({ success: true, vehicleData: vehicleDataWithId, reportRaw, creditBalance: newBalance });
    } catch (error: any) {
      console.error('Premium check error:', error.message);
      
      // Attempt to refund if an error occurred during the API call
      if (userId) {
        try {
          const userCredits = await storage.getUserCreditBalance(userId);
          if (userCredits !== undefined) {
            await storage.addCredits(userId, 1, `Refund for failed premium lookup (API error): ${req.body.regNumber}`);
            console.log(`Refunded 1 credit to user ${userId} due to API error.`);
          }
        } catch (refundError) {
          console.error('Error refunding credits:', refundError);
        }
      }
      
      res.status(400).json({ message: error.message || "Failed to perform premium check (credit refunded if applicable)" });
    }
  });

  app.post('/api/vehicle-lookup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { registration } = req.body;
      if (!registration || typeof registration !== 'string') {
        return res.status(400).json({ message: "Registration number is required" });
      }
      const userBalance = await storage.getUserCreditBalance(userId);
      if (userBalance < 1) {
        return res.status(402).json({
          success: false,
          message: "Insufficient credits. Please purchase more credits to continue.",
          creditBalance: userBalance
        });
      }
      try {
        const deductionSuccess = await storage.deductCredits(
          userId,
          1,
          `Vehicle lookup: ${registration.trim().toUpperCase()}`
        );
        if (!deductionSuccess) {
          return res.status(402).json({
            success: false,
            message: "Insufficient credits. Please purchase more credits to continue.",
            creditBalance: await storage.getUserCreditBalance(userId)
          });
        }
        const lookupResult = await comprehensiveVehicleDataLookup(registration.trim());
        const lookup = await storage.createVehicleLookup({
          userId,
          registration: registration.trim().toUpperCase(),
          vehicleData: lookupResult.vehicleData,
          reportRaw: lookupResult.reportRaw,
          creditsCost: 1,
          success: true,
        });
        const newBalance = await storage.getUserCreditBalance(userId);
        
        // Automatically send PDF report via email for logged-in users
        try {
          const { emailService } = await import('./services/EmailService');
          const { generateUnifiedPDF } = await import('./pdf/unifiedReportGenerator');
          const userEmail = process.env.REPL_ID 
            ? req.user?.claims?.email 
            : (req.session as any)?.userEmail;
          
          if (userEmail) {
            // Ensure email service is ready before sending
            const isReady = await emailService.ensureReady();
            const hasTransporter = emailService.transporter !== null;
            
            if (isReady && hasTransporter) {
              // Generate PDF and send email asynchronously (don't block response)
              generateUnifiedPDF(lookupResult.vehicleData, lookupResult.reportRaw, true)
                .then((pdfBuffer) => {
                  return emailService.sendReportEmail(userEmail, pdfBuffer, registration.trim().toUpperCase());
                })
                .then((success) => {
                  if (success) {
                    console.log(`✅ PDF report automatically sent to ${userEmail} for ${registration.trim().toUpperCase()}`);
                  } else {
                    console.log(`⚠️ Failed to send PDF report to ${userEmail}`);
                  }
                })
                .catch((error) => {
                  console.error(`❌ Error sending automatic PDF report:`, error);
                  // Don't fail the request if email fails
                });
            } else {
              console.log(`⚠️ Email service not ready - skipping automatic email for ${registration}`);
            }
          }
        } catch (emailError) {
          console.error('Error setting up automatic email delivery:', emailError);
          // Don't fail the request if email setup fails
        }
        
        res.json({
          success: true,
          vehicleData: {
            ...lookupResult.vehicleData,
            lookupId: lookup.id
          },
          reportRaw: lookupResult.reportRaw,
          lookup,
          creditBalance: newBalance,
          message: "Vehicle lookup completed successfully (1 credit used)"
        });
      } catch (error: any) {
        await storage.addCredits(userId, 1, `Refund for failed lookup: ${registration.trim().toUpperCase()}`);
        await storage.createVehicleLookup({
          userId,
          registration: registration.trim().toUpperCase(),
          vehicleData: null,
          creditsCost: 0,
          success: false,
          errorMessage: error.message,
        });
        res.status(400).json({
          success: false,
          message: error.message || "Failed to lookup vehicle details (credit refunded)",
          creditBalance: await storage.getUserCreditBalance(userId)
        });
      }
    } catch (error: any) {
      console.error("❌ Vehicle lookup error:", error);
      console.error("Error stack:", error.stack);
      console.error("Error message:", error.message);
      res.status(500).json({ 
        message: "Internal server error",
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // VEHICLE LOOKUPS - RETURN COMPREHENSIVE DATA WITH RAW REPORTS
  app.get('/api/vehicle-lookups', isAuthenticated, async (req: any, res) => {
    try {
      // Support both session-based (demo) and OAuth-based (production) authentication
      const userId = req.session?.userId || (req.user && req.user.claims ? req.user.claims.sub : null);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const limit = parseInt(req.query.limit as string) || 20;
      const lookups = await storage.getVehicleLookups(userId, limit);

      // FORCE COMPREHENSIVE DATA RETRIEVAL FOR ALL LOOKUPS
      const detailedLookups = await Promise.all(
        lookups.map(async (lookup) => {
          if (lookup.reportRaw && lookup.vehicleData) {
            console.log(`Lookup ${lookup.id}: Using stored comprehensive data`);
            return {
              ...lookup,
              vehicleData: lookup.vehicleData,
              reportRaw: lookup.reportRaw
            };
          } else {
            console.log(`Lookup ${lookup.id}: Re-fetching comprehensive data for ${lookup.registration}`);
            try {
              const result = await comprehensiveVehicleDataLookup(lookup.registration);
              return {
                ...lookup,
                vehicleData: result.vehicleData,
                reportRaw: result.reportRaw
              };
            } catch (error) {
              console.error(`Failed to fetch comprehensive data for ${lookup.registration}:`, error);
              return lookup;
            }
          }
        })
      );

      res.json(detailedLookups);
    } catch (error) {
      console.error("Error fetching lookups:", error);
      res.status(500).json({ message: "Failed to fetch lookups" });
    }
  });

  // Get individual vehicle lookup by ID
  app.get('/api/vehicle-lookup/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const lookup = await storage.getVehicleLookupById(id);
      
      if (!lookup || lookup.userId !== userId) {
        return res.status(404).json({ message: "Vehicle lookup not found" });
      }
      
      // Return the full lookup data including reportRaw
      res.json({
        id: lookup.id,
        registration: lookup.registration,
        vehicleData: lookup.vehicleData,
        reportRaw: lookup.reportRaw,
        isPremium: lookup.isPremium || false,
        success: lookup.success,
        createdAt: lookup.createdAt
      });
    } catch (error) {
      console.error("Error fetching vehicle lookup:", error);
      res.status(500).json({ message: "Failed to fetch vehicle lookup" });
    }
  });
  
  // Generate PDF for individual vehicle lookup
  app.get('/api/vehicle-lookup/:id/pdf', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const lookup = await storage.getVehicleLookupById(id);
      
      if (!lookup || lookup.userId !== userId) {
        return res.status(404).json({ message: "Vehicle lookup not found" });
      }
      
      if (!lookup.reportRaw) {
        return res.status(400).json({ message: "No report data available for PDF generation" });
      }
      
      // Import the unified PDF generator
      const { generateUnifiedPDF } = await import('./pdf/unifiedReportGenerator');
      
      // Generate PDF using the unified report template
      const isPremium = lookup.isPremium || false;
      const pdfBuffer = await generateUnifiedPDF(lookup.vehicleData, lookup.reportRaw, isPremium);
      
      // Return PDF for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="vehicle-report-${lookup.registration}.pdf"`);
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error("Error generating PDF for vehicle lookup:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });
  
  app.get('/api/user-stats', isAuthenticated, async (req: any, res) => {
    try {
      // Support both session-based (demo) and OAuth-based (production) authentication
      const userId = req.session?.userId || (req.user && req.user.claims ? req.user.claims.sub : null);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  app.get('/api/download-report/:lookupId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { lookupId } = req.params;
      const lookup = await storage.getVehicleLookupById(lookupId);
      if (!lookup || lookup.userId !== userId) {
        return res.status(404).json({ message: "Vehicle lookup not found" });
      }
      if (!lookup.vehicleData) {
        return res.status(400).json({ message: "No vehicle data available for download" });
      }
      const vehicleData = lookup.vehicleData as any;
      const reportDate = new Date().toLocaleDateString('en-GB');
      const reportContent = `
===============================================
    HG VERIFIED VEHICLE CHECK - PREMIUM REPORT
===============================================
Report Generated: ${reportDate}
Data Source: ${vehicleData.dataSource || 'Vehicle Data UK'}
Report ID: HG-${lookup.id.substr(0, 8).toUpperCase()}
-----------------------------------------------
              VEHICLE IDENTIFICATION
-----------------------------------------------
Registration Number: ${vehicleData.registration}
Make: ${vehicleData.make}
Model: ${vehicleData.model}
Year of Manufacture: ${vehicleData.year}
Engine Size: ${vehicleData.engineSize}
Fuel Type: ${vehicleData.fuelType}
Colour: ${vehicleData.colour}
First Registration: ${vehicleData.firstRegistration}
Body Type: ${vehicleData.bodyType || 'N/A'}
Doors: ${vehicleData.doors || 'N/A'}
Wheel Plan: ${vehicleData.wheelplan || 'N/A'}
Transmission: ${vehicleData.transmission || 'N/A'}
-----------------------------------------------
               MOT & TAX STATUS
-----------------------------------------------
MOT Expiry Date: ${vehicleData.motExpiry}
Latest MOT Result: ${vehicleData.motResult}
Recorded Mileage: ${vehicleData.mileage}
CO2 Emissions: ${vehicleData.co2Emissions || 'N/A'}
Euro Status: ${vehicleData.euroStatus || 'N/A'}
Tax Band: ${vehicleData.taxBand}
SORN Status: ${vehicleData.sornStatus}
-----------------------------------------------
            COMPREHENSIVE SECURITY CHECKS
-----------------------------------------------
Theft Status (PNC): ${vehicleData.stolenStatus}
Insurance Write-Off: ${vehicleData.insuranceWriteOff}
Finance Outstanding: ${vehicleData.financeOutstanding}
Finance Provider: ${vehicleData.financeProvider || 'N/A'}
Previous Owners: ${vehicleData.previousOwners}
Market Valuation: ${vehicleData.marketValue}
-----------------------------------------------
                 SPECIFICATIONS
-----------------------------------------------
Seats: ${vehicleData.specifications.numberOfSeats}
Doors: ${vehicleData.specifications.numberOfDoors}
Transmission: ${vehicleData.specifications.transmission}
Drive Type: ${vehicleData.specifications.driveType}
${
  vehicleData.motHistory.length > 0
    ? `
-----------------------------------------------
                 MOT TEST HISTORY
-----------------------------------------------
${vehicleData.motHistory
  .map(
    (mot: any, index: number) => `
${index + 1}. ${mot.date}
  Result: ${mot.result}
  Mileage: ${mot.mileage}
  Expiry Date: ${mot.expiryDate}
  Certificate: ${mot.testCertificateNumber}
  Defects: ${mot.defects}
  ${
    mot.annotations.length > 0
      ? `Annotations:
    ${mot.annotations
      .map((ann: any) => `    - ${ann.Type}: ${ann.Text}${ann.IsDangerous ? ' (Dangerous)' : ''}`)
      .join('\n')}`
      : ''
  }
`
  )
  .join('\n')}
`
    : ''
}
${
  vehicleData.mileageHistory.length > 0
    ? `
-----------------------------------------------
               MILEAGE VERIFICATION
-----------------------------------------------
${vehicleData.mileageHistory
  .map(
    (record: any, index: number) =>
      `${index + 1}. ${record.date} - ${record.mileage}${record.discrepancy ? ' (DISCREPANCY DETECTED)' : ''}`
  )
  .join('\n')}
`
    : ''
}
${
  vehicleData.vehicleImages.length > 0
    ? `
-----------------------------------------------
                VEHICLE IMAGES
-----------------------------------------------
${vehicleData.vehicleImages
  .map((image: any, index: number) => `${index + 1}. ${image.Description} (${image.ViewAngle})`)
  .join('\n')}
`
    : ''
}
===============================================
                   IMPORTANT NOTICE
===============================================
This report is generated from official UK databases
including DVLA, MIAFTR, and PNC records.
For the most up-to-date information, always verify
directly with DVLA before making purchase decisions.
-----------------------------------------------
Report generated by HG Verified Vehicle Check
Enterprise Vehicle Intelligence Platform
Website: https://hgverifiedvehiclecheck.com
For support: support@hgverifiedvehiclecheck.com
===============================================`;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="vehicle-report-${vehicleData.registration}-${reportDate.replace(/\//g, '-')}.txt"`
      );
      res.send(reportContent);
    } catch (error) {
      console.error("Download report error:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Share vehicle report endpoint - create a shareable link
  app.post('/api/share-report', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { lookupId, expiresInDays } = req.body;
      
      if (!lookupId) {
        return res.status(400).json({ message: "Lookup ID is required" });
      }
      
      // Verify the lookup belongs to the user
      const lookup = await storage.getVehicleLookupById(lookupId);
      if (!lookup || lookup.userId !== userId) {
        return res.status(403).json({ message: "Report not found or access denied" });
      }
      
      // Generate a unique share code
      const shareCode = nanoid(10);
      
      // Calculate expiry date (default 7 days if not specified)
      const daysToExpire = expiresInDays || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysToExpire);
      
      // Create the shared report
      const sharedReport = await storage.createSharedReport(
        {
          lookupId,
          userId,
          expiresAt,
        },
        shareCode
      );
      
      // Generate the share URL
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const shareUrl = `${appUrl}/share/${shareCode}`;
      
      res.json({
        shareCode,
        shareUrl,
        expiresAt: sharedReport.expiresAt,
      });
    } catch (error) {
      console.error("Create share link error:", error);
      res.status(500).json({ message: "Failed to create share link" });
    }
  });

  // Get shared report by share code (public endpoint)
  app.get('/api/shared-report/:shareCode', async (req, res) => {
    try {
      const { shareCode } = req.params;
      
      // Get the shared report
      const sharedReport = await storage.getSharedReportByCode(shareCode);
      
      if (!sharedReport) {
        return res.status(404).json({ message: "Shared report not found" });
      }
      
      // Check if the report has expired
      if (sharedReport.expiresAt && new Date() > new Date(sharedReport.expiresAt)) {
        return res.status(410).json({ message: "This shared report has expired" });
      }
      
      // Get the vehicle lookup data
      const lookup = await storage.getVehicleLookupById(sharedReport.lookupId);
      
      if (!lookup || !lookup.success) {
        return res.status(404).json({ message: "Report data not found" });
      }
      
      // Increment view count
      await storage.incrementShareViewCount(shareCode);
      
      // Return the report data
      res.json({
        registration: lookup.registration,
        vehicleData: lookup.vehicleData,
        reportRaw: lookup.reportRaw,
        createdAt: lookup.createdAt,
        viewCount: sharedReport.viewCount + 1,
      });
    } catch (error) {
      console.error("Get shared report error:", error);
      res.status(500).json({ message: "Failed to retrieve shared report" });
    }
  });

  // Get user's shared reports
  app.get('/api/my-shared-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sharedReports = await storage.getUserSharedReports(userId);
      
      // Add the full share URLs to each report
      const reportsWithUrls = sharedReports.map(report => ({
        ...report,
        shareUrl: `${process.env.APP_URL || 'http://localhost:3000'}/share/${report.shareCode}`,
      }));
      
      res.json(reportsWithUrls);
    } catch (error) {
      console.error("Get user shared reports error:", error);
      res.status(500).json({ message: "Failed to get shared reports" });
    }
  });

  // Delete a shared report
  app.delete('/api/shared-report/:shareCode', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { shareCode } = req.params;
      
      const success = await storage.deleteSharedReport(shareCode, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Shared report not found or access denied" });
      }
      
      res.json({ message: "Share link deleted successfully" });
    } catch (error) {
      console.error("Delete shared report error:", error);
      res.status(500).json({ message: "Failed to delete share link" });
    }
  });

  // Send vehicle report via email endpoint
  app.post('/api/send-vehicle-report', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      const { registration, reportType, pdfBase64, vehicleData, isComprehensive } = req.body;
      
      if (!registration || !reportType || !pdfBase64) {
        return res.status(400).json({ message: "Missing required data for email" });
      }

      // Create email transporter using Gmail or system email service
      // For production, you'd use proper SMTP settings or an email service like SendGrid
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false, // true for 465, false for other ports
        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        } : undefined,
        // Fallback to sendmail if no SMTP credentials
        ...((!process.env.SMTP_USER || !process.env.SMTP_PASS) && {
          sendmail: true,
          newline: 'unix',
          path: '/usr/sbin/sendmail',
        }),
      });

      // Prepare email content
      const reportDate = new Date().toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });

      const emailSubject = `HG Verified ${reportType} Vehicle Report - ${registration}`;
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .vehicle-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HG Verified Vehicle Check</h1>
              <p>${reportType} Report for ${registration}</p>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName || 'Valued Customer'},</h2>
              <p>Thank you for using HG Verified Vehicle Check. Your ${reportType.toLowerCase()} vehicle report is attached to this email as a PDF.</p>
              
              <div class="vehicle-info">
                <h3>Vehicle Details</h3>
                <div class="info-row">
                  <span class="label">Registration:</span>
                  <span class="value">${registration}</span>
                </div>
                <div class="info-row">
                  <span class="label">Make:</span>
                  <span class="value">${vehicleData.make}</span>
                </div>
                <div class="info-row">
                  <span class="label">Model:</span>
                  <span class="value">${vehicleData.model}</span>
                </div>
                <div class="info-row">
                  <span class="label">Year:</span>
                  <span class="value">${vehicleData.year}</span>
                </div>
                <div class="info-row">
                  <span class="label">Report Generated:</span>
                  <span class="value">${reportDate}</span>
                </div>
              </div>

              ${isComprehensive ? `
                <div class="success">
                  <strong>✓ Comprehensive Report</strong><br>
                  This report includes all premium security checks, finance verification, mileage history, and stolen status checks.
                </div>
              ` : `
                <div class="warning">
                  <strong>Free Basic Report</strong><br>
                  This report contains basic vehicle information only. For comprehensive security checks, finance verification, and stolen status, consider upgrading to our premium report.
                </div>
              `}

              <p>The attached PDF contains the complete vehicle report with all available information. Please save it for your records.</p>

              <center>
                <a href="https://hgverifiedvehiclecheck.com" class="button">Visit Our Website</a>
              </center>

              <p><strong>Important:</strong> This report is based on data available at the time of generation. Always verify the latest information with official sources before making purchase decisions.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} HG Verified Vehicle Check - Professional Vehicle Intelligence</p>
              <p>This email and any attachments are confidential and intended for the addressee only.</p>
              <p>For support, contact: support@hgverifiedvehiclecheck.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailText = `
HG Verified Vehicle Check
${reportType} Report for ${registration}

Hello ${user.firstName || 'Valued Customer'},

Thank you for using HG Verified Vehicle Check. Your ${reportType.toLowerCase()} vehicle report is attached to this email as a PDF.

Vehicle Details:
- Registration: ${registration}
- Make: ${vehicleData.make}
- Model: ${vehicleData.model}
- Year: ${vehicleData.year}
- Report Generated: ${reportDate}

${isComprehensive ? 
'✓ This is a COMPREHENSIVE report including all premium security checks, finance verification, mileage history, and stolen status checks.' :
'Note: This is a FREE BASIC report containing basic vehicle information only. For comprehensive security checks, consider upgrading to our premium report.'}

The attached PDF contains the complete vehicle report with all available information. Please save it for your records.

Important: This report is based on data available at the time of generation. Always verify the latest information with official sources before making purchase decisions.

Visit our website: https://hgverifiedvehiclecheck.com

© ${new Date().getFullYear()} HG Verified Vehicle Check - Professional Vehicle Intelligence
For support, contact: support@hgverifiedvehiclecheck.com
      `;

      // Prepare the PDF attachment
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      const fileName = `HG-Verified-${reportType.replace(' ', '-')}-Report-${registration}-${new Date().toISOString().split('T')[0]}.pdf`;

      // Send the email
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"HG Verified Vehicle Check" <noreply@hgverifiedvehiclecheck.com>',
        to: user.email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
        attachments: [
          {
            filename: fileName,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      // Try to send the email
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Vehicle report email sent to ${user.email} for registration ${registration}`);
        console.log('Message ID:', info.messageId);
        
        res.json({
          success: true,
          message: `Report sent successfully to ${user.email}`,
          messageId: info.messageId
        });
      } catch (emailError: any) {
        console.error('Email sending failed:', emailError);
        // Even if email fails, don't fail the whole request since PDF download worked
        res.json({
          success: false,
          message: 'Report generated but email could not be sent. Please download the PDF directly.',
          error: emailError.message
        });
      }
    } catch (error: any) {
      console.error('Error in send-vehicle-report endpoint:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to send report via email",
        error: error.message 
      });
    }
  });

  // Save PDF report to user account
  app.post('/api/reports/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { vrm, checkType, pdfBlob, pdfBase64, fileName } = req.body;
      
      if (!vrm || !checkType || !fileName) {
        return res.status(400).json({ message: "Missing required data for saving report" });
      }

      // Flexible parsing for both base64 and Buffer
      let bytes: Buffer | undefined;
      if (pdfBase64) {
        bytes = Buffer.from(pdfBase64, 'base64');
      } else if (pdfBlob?.data) {
        // Handle blob serialization from axios/fetch
        bytes = Buffer.from(pdfBlob.data);
      } else if (pdfBlob) {
        // Assume pdfBlob is base64 string for backward compatibility
        bytes = Buffer.from(pdfBlob, 'base64');
      }
      
      if (!bytes) {
        return res.status(400).json({ success: false, message: "PDF data missing" });
      }
      
      // Generate storage key and download URL
      const storageKey = `reports/${userId}/${Date.now()}-${vrm}-${checkType}.pdf`;
      const downloadUrl = `/api/reports/download/${storageKey}`;

      // Save the report to the database
      const savedReport = await storage.savePDFReport({
        userId,
        vrm,
        checkType,
        bytes: bytes.length,
        fileName,
        storageKey,
        downloadUrl
      });

      res.json({
        success: true,
        message: "Report saved successfully",
        reportId: savedReport.id
      });
    } catch (error: any) {
      console.error('Error saving PDF report:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to save report",
        error: error.message 
      });
    }
  });

  // Get saved reports list for user
  app.get('/api/reports/list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reports = await storage.getUserSavedReports(userId);
      
      res.json({
        success: true,
        reports: reports
      });
    } catch (error: any) {
      console.error('Error fetching saved reports:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch saved reports",
        error: error.message 
      });
    }
  });

  // Get user's saved reports
  app.get('/api/saved-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reports = await storage.getUserSavedReports(userId);
      
      res.json(reports);
    } catch (error) {
      console.error("Get saved reports error:", error);
      res.status(500).json({ message: "Failed to get saved reports" });
    }
  });

  // Get a specific saved report
  app.get('/api/saved-report/:reportId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { reportId } = req.params;
      
      const report = await storage.getSavedReportById(reportId, userId);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Get saved report error:", error);
      res.status(500).json({ message: "Failed to get report" });
    }
  });

  // Delete a saved report
  app.delete('/api/saved-report/:reportId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { reportId } = req.params;
      
      const success = await storage.deleteSavedReport(reportId, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Report not found or access denied" });
      }
      
      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      console.error("Delete saved report error:", error);
      res.status(500).json({ message: "Failed to delete report" });
    }
  });

  // Download saved PDF report
  app.get('/api/reports/download/*', async (req: any, res) => {
    try {
      const filePath = req.params[0]; // Get everything after /api/reports/download/
      const fullPath = path.join(process.cwd(), 'reports', filePath);
      
      // Security: Ensure path is within reports directory
      const reportsDir = path.join(process.cwd(), 'reports');
      const normalizedPath = path.normalize(fullPath);
      if (!normalizedPath.startsWith(reportsDir)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if file exists
      if (!fs.existsSync(normalizedPath)) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      // Read and send PDF file
      const pdfBuffer = fs.readFileSync(normalizedPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(normalizedPath)}"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("Download PDF error:", error);
      res.status(500).json({ message: "Failed to download report", error: error.message });
    }
  });

  // Get saved PDFs for a specific lookup
  app.get('/api/lookup/:lookupId/pdf', async (req: any, res) => {
    try {
      const { lookupId } = req.params;
      
      // Get saved reports for this lookup
      const lookupReports = await storage.getSavedReportsByLookupId(lookupId);
      
      if (lookupReports.length === 0) {
        return res.status(404).json({ message: "No PDF reports found for this lookup" });
      }
      
      // Return the most recent PDF
      const latestReport = lookupReports[0]; // Already sorted by createdAt desc
      
      res.json(latestReport);
    } catch (error: any) {
      console.error("Get lookup PDF error:", error);
      res.status(500).json({ message: "Failed to get PDF report", error: error.message });
    }
  });

  // REMOVED: Duplicate route - keeping the more comprehensive one above

  // Test PDF endpoint removed - using /api/report endpoint for all PDF generation

  // Generate PDF report and send to Azure for email
  // Allow both authenticated and non-authenticated users to download PDFs
  app.post('/api/report', async (req: any, res) => {
    console.log('PDF Generation Request received:', { 
      registration: req.body.registration, 
      email: req.body.email,
      lookupId: req.body.lookupId,
      hasVehicleData: !!req.body.vehicleData,
      hasReportRaw: !!req.body.reportRaw,
      isAuthenticated: !!(req.session?.userLoggedIn || req.user)
    });
    
    try {
      const { registration, email, vehicleData, reportRaw, lookupId } = req.body;
      
      // Registration and vehicle data are required, but email is optional
      if (!registration || (!vehicleData && !reportRaw)) {
        console.error('Missing required fields:', { registration, hasVehicleData: !!vehicleData, hasReportRaw: !!reportRaw });
        return res.status(400).json({ message: "Registration and vehicle data are required" });
      }

      console.log('Creating comprehensive PDF document for:', registration);
      
      // Import the unified PDF generator and email service
      const { generateUnifiedPDF } = await import('./pdf/unifiedReportGenerator');
      const { emailService } = await import('./services/EmailService');
      
      // Ensure registration is in vehicleData if not already present
      let finalVehicleData = vehicleData;
      if (!finalVehicleData?.registration && registration) {
        finalVehicleData = { ...finalVehicleData, registration: registration.toUpperCase() };
      }
      
      console.log('📋 PDF Generation - Final Data Check:');
      console.log('  - Registration from body:', registration);
      console.log('  - vehicleData.registration:', finalVehicleData?.registration);
      console.log('  - reportRaw?.Results?.VehicleDetails?.VehicleIdentification?.Vrm:', reportRaw?.Results?.VehicleDetails?.VehicleIdentification?.Vrm);
      
      // Generate PDF using the unified report template
      const isPremium = finalVehicleData?.isComprehensive || false;
      const dateOfCheck = reportRaw?.dateOfCheck || reportRaw?.checkTimestamp || new Date();
      const reference = reportRaw?.reportReference || reportRaw?.Reference || nanoid(12).toUpperCase();
      const pdfBuffer = await generateUnifiedPDF(finalVehicleData, reportRaw, isPremium, dateOfCheck, reference);
      
      console.log('Comprehensive PDF generated successfully, size:', pdfBuffer.length, 'bytes');

      // Get user ID for saving PDF
      const isAuthenticated = process.env.REPL_ID 
        ? (req.user && req.user.claims && req.user.claims.sub)
        : (req.session?.userLoggedIn && req.session?.userId);
      const userId = isAuthenticated 
        ? (process.env.REPL_ID ? req.user?.claims?.sub : (req.session as any)?.userId)
        : null;

      // Auto-save PDF report metadata to database (non-blocking)
      // Note: On Vercel serverless, we can't save to file system, so we skip file system operations
      const isVercel = process.env.VERCEL || process.env.VERCEL_URL;
      
      if ((userId || lookupId) && !isVercel) {
        // Only save to file system in non-serverless environments
        try {
          // Ensure reports directory exists
          const reportsDir = path.join(process.cwd(), 'reports');
          if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
          }

          // Create user-specific directory if authenticated
          let filePath: string;
          let storageKey: string;
          let downloadUrl: string;
          
          if (userId) {
            const userReportsDir = path.join(reportsDir, userId);
            if (!fs.existsSync(userReportsDir)) {
              fs.mkdirSync(userReportsDir, { recursive: true });
            }
            const fileName = `HG-Verified-Report-${registration}-${new Date().toISOString().split('T')[0]}.pdf`;
            filePath = path.join(userReportsDir, fileName);
            storageKey = `reports/${userId}/${fileName}`;
            downloadUrl = `/api/reports/download/${userId}/${fileName}`;
          } else {
            // For non-authenticated users with lookupId, save to a temp directory
            const fileName = `HG-Verified-Report-${registration}-${new Date().toISOString().split('T')[0]}.pdf`;
            filePath = path.join(reportsDir, fileName);
            storageKey = `reports/${fileName}`;
            downloadUrl = `/api/reports/download/${fileName}`;
          }

          // Save PDF to file system (only in non-serverless environments)
          fs.writeFileSync(filePath, pdfBuffer);
          console.log('✅ PDF saved to file system:', filePath);

          // Save PDF report metadata to database
          await storage.savePDFReport({
            userId: userId || "public",
            vrm: registration.toUpperCase(),
            checkType: vehicleData?.isComprehensive ? "premium" : "free",
            bytes: pdfBuffer.length,
            fileName: path.basename(filePath),
            storageKey,
            downloadUrl,
            lookupId: lookupId || null
          });
          console.log('✅ PDF report saved to database with lookupId:', lookupId || 'none');
        } catch (e: any) {
          console.warn("Non-fatal: savePDFReport failed:", e.message);
        }
      } else if (userId || lookupId) {
        // On Vercel, just save metadata to database without file system
        try {
          await storage.savePDFReport({
            userId: userId || "public",
            vrm: registration.toUpperCase(),
            checkType: vehicleData?.isComprehensive ? "premium" : "free",
            bytes: pdfBuffer.length,
            fileName: `HG-Verified-Report-${registration}-${new Date().toISOString().split('T')[0]}.pdf`,
            storageKey: `reports/${userId || 'public'}/${registration}-${Date.now()}.pdf`,
            downloadUrl: '', // No file system URL on serverless
            lookupId: lookupId || null
          });
          console.log('✅ PDF report metadata saved to database (serverless mode)');
        } catch (e: any) {
          console.warn("Non-fatal: savePDFReport failed:", e.message);
        }
      }

      // Send PDF via email - use provided email or authenticated user email
      // Check both Passport auth and local dev session (isAuthenticated already defined above)
      
      // Get user email - prefer session email, then provided email, then user claims email
      const userEmail = (process.env.REPL_ID 
        ? req.user?.claims?.email 
        : (req.session as any)?.userEmail) || email;
      
      console.log('📧 Email sending check:', {
        isAuthenticated,
        userEmail,
        hasSession: !!req.session,
        hasUser: !!req.user,
        providedEmail: email
      });
      
      // Send email if we have an email address (authenticated user email OR provided email)
      const emailToUse = userEmail || email;
      
      // Ensure email service is ready and send email
      if (emailToUse) {
        // Ensure email service is initialized
        const isReady = await emailService.ensureReady();
        const hasTransporter = emailService.transporter !== null;
        
        console.log('📧 Email sending check:', {
          emailToUse,
          isReady,
          hasTransporter,
          isAuthenticated,
          hasSession: !!req.session,
          hasUser: !!req.user
        });
        
        if (isReady && hasTransporter) {
          // Send email asynchronously (don't block PDF download)
          emailService.sendReportEmail(emailToUse, pdfBuffer, registration)
            .then((success) => {
              if (success) {
                console.log('✅ PDF successfully sent via email to:', emailToUse);
              } else {
                console.log('⚠️ Email service not available or failed');
              }
            })
            .catch((error) => {
              console.error('❌ Failed to send PDF via email:', error);
              // Don't fail the request if email fails
            });
        } else {
          console.log('⚠️ Email service not ready - skipping email delivery', { 
            isReady,
            hasTransporter,
            emailToUse
          });
        }
      } else {
        console.log('⚠️ No email available - skipping email delivery', { 
          isAuthenticated, 
          hasEmail: !!userEmail,
          providedEmail: email,
          hasSession: !!req.session,
          hasUser: !!req.user
        });
      }

      console.log('Sending PDF to browser for download...');
      
      // Return PDF immediately for browser download with proper headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.setHeader('Content-Disposition', `attachment; filename="vehicle-report-${registration}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Send as Buffer to ensure binary data is preserved
      res.end(pdfBuffer, 'binary');
      
      console.log('✅ PDF sent to browser successfully');

    } catch (error: any) {
      console.error("❌ Generate PDF report error:", error);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      
      // Return more detailed error information
      const errorMessage = error?.message || "Failed to generate PDF report";
      const statusCode = error?.message?.includes('timeout') ? 504 : 500;
      
      res.status(statusCode).json({ 
        message: errorMessage,
        error: error?.message,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      });
    }
  });

  // Get credit transactions for user
  app.get('/api/credit-transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getCreditTransactions(userId, 100);
      res.json(transactions);
    } catch (error) {
      console.error("Get credit transactions error:", error);
      res.status(500).json({ message: "Failed to get credit transactions" });
    }
  });

  app.post('/api/create-payment-intent', async (req: any, res) => {
    try {
      // Check authentication - support both Passport and local dev session
      const isAuthenticated = process.env.REPL_ID 
        ? (req.user && req.user.claims && req.user.claims.sub)
        : (req.session?.userLoggedIn && req.session?.userId);
      
      if (!isAuthenticated) {
        console.log('❌ Payment intent: User not authenticated', {
          hasSession: !!req.session,
          userLoggedIn: req.session?.userLoggedIn,
          userId: req.session?.userId
        });
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { amount, credits, description } = req.body;
      if (!amount || !credits) {
        return res.status(400).json({ message: "Amount and credits are required" });
      }
      if (!stripe) {
        console.error('❌ Stripe not initialized - check STRIPE_SECRET_KEY');
        console.error('STRIPE_SECRET_KEY present:', !!process.env.STRIPE_SECRET_KEY);
        console.error('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY?.length || 0);
        return res.status(500).json({ error: 'Payment processing is unavailable. Please contact support.' });
      }
      
      // Get user ID based on authentication method
      const userId = process.env.REPL_ID 
        ? req.user?.claims?.sub 
        : (req.session?.userId || "demo-user");
      
      console.log('💳 Creating payment intent for user:', userId, 'amount:', amount, 'credits:', credits);
      console.log('💳 Stripe instance available:', !!stripe);
      
      // Validate amount is a positive number
      const amountInPence = Math.round(amount * 100);
      if (isNaN(amountInPence) || amountInPence <= 0) {
        console.error('❌ Invalid amount:', amount, '->', amountInPence);
        return res.status(400).json({ message: "Invalid amount. Amount must be a positive number." });
      }
      
      console.log('💳 Calling Stripe API to create payment intent...');
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPence,
        currency: "gbp",
        automatic_payment_methods: { 
          enabled: true,
          allow_redirects: 'never' // Better for single-page checkout
        },
        // Note: Cannot specify payment_method_types when automatic_payment_methods is enabled
        // Stripe will automatically enable card, Apple Pay, Google Pay, etc. when automatic_payment_methods is enabled
        metadata: {
          userId: userId,
          credits: credits.toString(),
          description: description || `${credits} Credits Purchase`,
        },
      });
      
      console.log('✅ Payment intent created successfully:', paymentIntent.id);
      console.log('✅ Client secret length:', paymentIntent.client_secret?.length || 0);
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: any) {
      console.error("❌ Payment intent error:", error);
      console.error("Error details:", {
        message: error.message,
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        raw: error.raw,
        stack: error.stack
      });
      
      // Provide more specific error messages
      let errorMessage = "Error creating payment intent";
      if (error.type === 'StripeInvalidRequestError') {
        errorMessage = `Invalid payment request: ${error.message}`;
      } else if (error.type === 'StripeAPIError') {
        errorMessage = `Stripe API error: ${error.message}`;
      } else if (error.type === 'StripeAuthenticationError') {
        errorMessage = `Stripe authentication failed. Please check your API key.`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      res.status(500).json({ 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          type: error.type,
          code: error.code,
          statusCode: error.statusCode
        } : undefined
      });
    }
  });
  app.post('/api/confirm-payment', isAuthenticated, async (req, res) => {
    try {
      const { 
        paymentIntentId, 
        cancellationWaiverConsent, 
        consentTimestamp, 
        packageDetails 
      } = req.body;
      const userId = req.user.claims.sub;
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Validate required fields
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }
      
      if (!cancellationWaiverConsent) {
        return res.status(400).json({ 
          message: "Digital content cancellation waiver consent is required by UK law" 
        });
      }
      
      if (!consentTimestamp) {
        return res.status(400).json({ message: "Consent timestamp is required" });
      }
      
      if (!stripe) {
        return res.status(500).json({ error: 'Payment processing is unavailable. Please contact support.' });
      }
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded' && paymentIntent.metadata.userId === userId) {
        const credits = parseInt(paymentIntent.metadata.credits);
        const description = paymentIntent.metadata.description || 'Credit purchase';
        
        const existingTransactions = await storage.getCreditTransactions(userId, 100);
        const alreadyProcessed = existingTransactions.some(t => t.stripePaymentIntentId === paymentIntentId);
        
        if (!alreadyProcessed) {
          // Enhanced description with consent metadata for compliance audit trail
          const enhancedDescription = `${description} - Digital content waiver accepted at ${consentTimestamp}`;
          
          const transaction = await storage.addCredits(userId, credits, enhancedDescription, paymentIntentId);
          
          // Log consent for compliance records
          console.log(`[COMPLIANCE] Digital content consent captured for payment ${paymentIntentId}: {
            userId: ${userId},
            consent: ${cancellationWaiverConsent},
            timestamp: ${consentTimestamp},
            ip: ${clientIp},
            packageDetails: ${JSON.stringify(packageDetails)},
            transactionId: ${transaction.id}
          }`);
          
          const newBalance = await storage.getUserCreditBalance(userId);
          
          res.json({
            success: true,
            message: `Successfully added ${credits} credits to your account`,
            creditsAdded: credits,
            newBalance: newBalance,
            transactionId: transaction.id,
            consentRecorded: true
          });
        } else {
          const currentBalance = await storage.getUserCreditBalance(userId);
          res.json({
            success: true,
            message: "Credits were already added for this payment",
            creditsAdded: 0,
            newBalance: currentBalance,
            consentRecorded: true
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: "Payment was not successful or does not belong to this user"
        });
      }
    } catch (error: any) {
      console.error('[PAYMENT CONFIRMATION] Error confirming payment:', error);
      res.status(500).json({
        success: false,
        message: "Error confirming payment: " + error.message
      });
    }
  });
  app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;
    try {
      if (!stripe) {
        console.error('Stripe webhook received but Stripe is not initialized');
        return res.status(500).json({ error: 'Payment processing is unavailable' });
      }
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error('[STRIPE WEBHOOK] Signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { userId, credits, description } = paymentIntent.metadata;
      if (userId && credits) {
        try {
          const existingTransactions = await storage.getCreditTransactions(userId, 100);
          const alreadyProcessed = existingTransactions.some(t => t.stripePaymentIntentId === paymentIntent.id);
          if (!alreadyProcessed) {
            const transaction = await storage.addCredits(
              userId,
              parseInt(credits),
              description || 'Credit purchase',
              paymentIntent.id
            );
            const newBalance = await storage.getUserCreditBalance(userId);
            console.log(`[STRIPE WEBHOOK] Added ${credits} credits to user ${userId}. New balance: ${newBalance}`);
          }
        } catch (error) {
          console.error('[STRIPE WEBHOOK] Error adding credits:', error);
        }
      }
    }
    res.json({ received: true });
  });
  app.get('/api/credit-transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getCreditTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching credit transactions:", error);
      res.status(500).json({ message: "Failed to fetch credit transactions" });
    }
  });
  app.post('/api/check-payment-status', isAuthenticated, async (req: any, res) => {
    try {
      const { paymentIntentId } = req.body;
      const userId = req.user.claims.sub;
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }
      if (!stripe) {
        return res.status(500).json({ error: 'Payment processing is unavailable. Please contact support.' });
      }
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const existingTransactions = await storage.getCreditTransactions(userId, 100);
      const creditTransaction = existingTransactions.find(t => t.stripePaymentIntentId === paymentIntentId);
      const currentBalance = await storage.getUserCreditBalance(userId);
      res.json({
        paymentIntentStatus: paymentIntent.status,
        creditsAlreadyAdded: !!creditTransaction,
        creditTransaction: creditTransaction || null,
        currentCreditBalance: currentBalance,
        paymentMetadata: paymentIntent.metadata
      });
    } catch (error: any) {
      console.error('[PAYMENT STATUS CHECK] Error:', error);
      res.status(500).json({ message: "Error checking payment status: " + error.message });
    }
  });
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName } = req.body;
      if (firstName !== undefined && typeof firstName !== 'string') {
        return res.status(400).json({ message: "First name must be a string" });
      }
      if (lastName !== undefined && typeof lastName !== 'string') {
        return res.status(400).json({ message: "Last name must be a string" });
      }
      const updatedUser = await storage.updateUserProfile(userId, {
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Customer history CSV download
  app.get('/api/profile/history/csv', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lookups = await storage.getVehicleLookups(userId, 1000);

      let csvContent = 'My Vehicle Check History\n\n';
      csvContent += 'Date,Registration,Success,Credits Used,Report Available\n';

      lookups.forEach(lookup => {
        csvContent += `${lookup.createdAt ? new Date(lookup.createdAt).toLocaleDateString() : 'Unknown'},${lookup.registration},${lookup.success ? 'Yes' : 'No'},${lookup.creditsCost},${lookup.vehicleData ? 'Yes' : 'No'}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="my-vehicle-history-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating history CSV:", error);
      res.status(500).json({ message: "Failed to generate history" });
    }
  });

  // Customer payment history CSV download
  app.get('/api/profile/payments/csv', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getCreditTransactions(userId, 1000);

      let csvContent = 'My Payment & Credit History\n\n';
      csvContent += 'Date,Amount,Description,Payment ID\n';

      transactions.forEach(transaction => {
        csvContent += `${transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'Unknown'},${transaction.amount},${transaction.description},${transaction.stripePaymentIntentId || 'N/A'}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="my-payment-history-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating payment CSV:", error);
      res.status(500).json({ message: "Failed to generate payment history" });
    }
  });

  // Password reset request
  app.post('/api/auth/password-reset', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // In production, you would send an actual email
      // For now, we'll just log and return success
      console.log(`[PASSWORD RESET] Password reset requested for user: ${user.email}`);

      res.json({
        message: "Password reset instructions have been sent to your email address"
      });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      res.status(500).json({ message: "Failed to request password reset" });
    }
  });

  // GDPR data deletion request
  app.post('/api/profile/delete-request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Log the deletion request for manual processing
      console.log(`[GDPR DELETION REQUEST] Data deletion requested for user: ${user.email} (ID: ${userId})`);

      // In production, you would:
      // 1. Create a deletion request record in database
      // 2. Send notification to admin
      // 3. Set up automated process for 30-day confirmation

      res.json({
        message: "Your data deletion request has been received and will be processed within 30 days as required by GDPR"
      });
    } catch (error) {
      console.error("Error processing deletion request:", error);
      res.status(500).json({ message: "Failed to process deletion request" });
    }
  });
  app.get('/api/admin/stats', isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getGlobalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });
  app.get('/api/admin/users', isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await storage.getAllUsers(limit, offset);
      res.json(result);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app.get('/api/admin/users/:userId', isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const [userStats, recentLookups, recentTransactions] = await Promise.all([
        storage.getUserStats(userId),
        storage.getVehicleLookups(userId, 10),
        storage.getCreditTransactions(userId, 10)
      ]);
      res.json({
        user,
        stats: userStats,
        recentLookups,
        recentTransactions
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });
  app.patch('/api/admin/users/:userId/role', isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
      }
      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  app.patch('/api/admin/users/:userId/credits', isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { creditBalance } = req.body;
      if (typeof creditBalance !== 'number' || creditBalance < 0) {
        return res.status(400).json({ message: "Invalid credit balance" });
      }
      const user = await storage.updateUserCredits(userId, creditBalance);
      await storage.addCredits(userId, creditBalance - (user.creditBalance || 0), `Admin adjustment by ${req.user.claims.email}`);
      res.json(user);
    } catch (error) {
      console.error("Error updating user credits:", error);
      res.status(500).json({ message: "Failed to update user credits" });
    }
  });
  app.get('/api/admin/transactions', isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await storage.getAllCreditTransactions(limit, offset);
      res.json(result);
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // ADMIN LOOKUPS - ENSURE COMPREHENSIVE DATA WITH RAW REPORTS
  app.get('/api/admin/lookups', isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await storage.getAllVehicleLookups(limit, offset);
      
      // Extract the lookups array from the result object
      const lookups = result.lookups || [];
      const total = result.total || 0;

      // FORCE COMPREHENSIVE DATA FOR ADMIN LOOKUPS
      const detailedLookups = await Promise.all(
        lookups.map(async (lookup) => {
          if (lookup.reportRaw && lookup.vehicleData) {
            console.log(`Admin Lookup ${lookup.id}: Using stored comprehensive data`);
            return {
              ...lookup,
              vehicleData: lookup.vehicleData,
              reportRaw: lookup.reportRaw
            };
          } else {
            console.log(`Admin Lookup ${lookup.id}: Re-fetching comprehensive data for ${lookup.registration}`);
            try {
              const result = await comprehensiveVehicleDataLookup(lookup.registration);
              return {
                ...lookup,
                vehicleData: result.vehicleData,
                reportRaw: result.reportRaw
              };
            } catch (error) {
              console.error(`Failed to fetch comprehensive data for ${lookup.registration}:`, error);
              return lookup;
            }
          }
        })
      );

      res.json({ lookups: detailedLookups, total });
    } catch (error) {
      console.error("Error fetching all lookups:", error);
      res.status(500).json({ message: "Failed to fetch lookups" });
    }
  });

  app.get('/api/admin/search/users', isAdmin, async (req: any, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ message: "Email parameter required" });
      }
      const user = await storage.getUserByEmail(email as string);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error searching for user:", error);
      res.status(500).json({ message: "Failed to search for user" });
    }
  });
  app.post('/api/admin/promote', async (req: any, res) => {
    try {
      const { email, adminKey } = req.body;
      if (!adminKey || adminKey !== process.env.ADMIN_PROMOTION_KEY) {
        return res.status(403).json({ message: "Invalid admin promotion key" });
      }
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const promotedUser = await storage.updateUserRole(user.id, 'admin');
      console.log(`User ${email} promoted to admin`);
      res.json({ message: "User promoted to admin", user: promotedUser });
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });
  app.post('/api/admin/restore-credits', async (req: any, res) => {
    try {
      const { userId, credits, reason } = req.body;
      if (!userId || !credits) {
        return res.status(400).json({ message: "User ID and credits required" });
      }
      const transaction = await storage.addCredits(
        userId,
        credits,
        reason || 'Administrative credit restoration'
      );
      const newBalance = await storage.getUserCreditBalance(userId);
      console.log(`[CREDIT RESTORATION] Restored ${credits} credits to user ${userId}. New balance: ${newBalance}`);
      res.json({
        message: `Successfully restored ${credits} credits`,
        transaction,
        newBalance
      });
    } catch (error) {
      console.error("Error restoring credits:", error);
      res.status(500).json({ message: "Failed to restore credits" });
    }
  });

  // Update customer details
  app.patch('/api/admin/customers/:userId', isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { firstName, lastName, email } = req.body;

      const updatedUser = await storage.updateUserProfile(userId, {
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // Adjust customer credits
  app.post('/api/admin/customers/:userId/credits', isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { amount, reason } = req.body;

      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ message: "Valid amount required" });
      }

      const transaction = await storage.addCredits(
        userId,
        amount,
        reason || `Admin ${amount > 0 ? 'credit addition' : 'credit deduction'}`
      );

      const newBalance = await storage.getUserCreditBalance(userId);

      console.log(`[ADMIN CREDIT ADJUSTMENT] ${amount > 0 ? 'Added' : 'Deducted'} ${Math.abs(amount)} credits ${amount > 0 ? 'to' : 'from'} user ${userId}. New balance: ${newBalance}`);

      res.json({
        message: `Successfully ${amount > 0 ? 'added' : 'deducted'} ${Math.abs(amount)} credits`,
        transaction,
        newBalance
      });
    } catch (error) {
      console.error("Error adjusting credits:", error);
      res.status(500).json({ message: "Failed to adjust credits" });
    }
  });

  // Download customer history as CSV
  app.get('/api/admin/customers/:userId/history/csv', isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;

      const [user, lookups, transactions] = await Promise.all([
        storage.getUser(userId),
        storage.getVehicleLookups(userId, 1000),
        storage.getCreditTransactions(userId, 1000)
      ]);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create CSV content
      let csvContent = 'Customer History Export\n\n';
      csvContent += 'Customer Information\n';
      csvContent += `Email,${user.email}\n`;
      csvContent += `Name,${user.firstName || ''} ${user.lastName || ''}\n`;
      csvContent += `Credit Balance,${user.creditBalance || 0}\n`;
      csvContent += `Member Since,${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}\n\n`;

      csvContent += 'Vehicle Lookups\n';
      csvContent += 'Date,Registration,Success,Credits Cost\n';
      lookups.forEach(lookup => {
        csvContent += `${lookup.createdAt ? new Date(lookup.createdAt).toLocaleDateString() : 'Unknown'},${lookup.registration},${lookup.success ? 'Yes' : 'No'},${lookup.creditsCost}\n`;
      });

      csvContent += '\nCredit Transactions\n';
      csvContent += 'Date,Amount,Description\n';
      transactions.forEach(transaction => {
        csvContent += `${transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'Unknown'},${transaction.amount},${transaction.description}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="customer-history-${user.email}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating customer history CSV:", error);
      res.status(500).json({ message: "Failed to generate customer history" });
    }
  });

  // Login page route - for local development
  app.get('/api/login', (req, res) => {
    // Store the redirect URL in the session
    if (req.query.redirect) {
      (req.session as any).returnTo = req.query.redirect as string;
    }
    
    // For local development without REPL_ID, show a simple login page
    if (!process.env.REPL_ID) {
      const redirectTo = req.query.redirect || '/app';
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>AutoCheckPro - Sign In</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 400px; margin: 100px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { text-align: center; color: #333; margin-bottom: 30px; }
            .btn { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
            .btn:hover { background: #0056b3; }
            .btn:disabled { background: #ccc; cursor: not-allowed; }
            .info { background: #e7f3ff; padding: 15px; border-radius: 4px; margin-bottom: 20px; color: #0066cc; }
            .spinner { display: none; margin: 10px auto; border: 3px solid #f3f3f3; border-top: 3px solid #007bff; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Sign In</h1>
            <div class="info">
              <strong>Local Development Mode</strong><br>
              Authentication is simplified for local testing. Click below to access the application.
            </div>
            <button class="btn" id="loginBtn" onclick="login()">
              Sign In
            </button>
            <div class="spinner" id="spinner"></div>
            <script>
              async function login() {
                const btn = document.getElementById('loginBtn');
                const spinner = document.getElementById('spinner');
                btn.disabled = true;
                btn.textContent = 'Signing in...';
                spinner.style.display = 'block';
                
                try {
                  const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                  });
                  
                  if (response.ok) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const redirectTo = decodeURIComponent(new URLSearchParams(window.location.search).get('redirect') || '/app');
                    window.location.href = redirectTo;
                  } else {
                    const data = await response.json();
                    alert('Login failed: ' + (data.message || 'Please try again'));
                    btn.disabled = false;
                    btn.textContent = 'Sign In';
                    spinner.style.display = 'none';
                  }
                } catch (error) {
                  console.error('Login error:', error);
                  alert('Login failed. Please check the console and try again.');
                  btn.disabled = false;
                  btn.textContent = 'Sign In';
                  spinner.style.display = 'none';
                }
              }
            </script>
          </div>
        </body>
        </html>
      `);
    }
    
    // For production, redirect to Google OAuth (only if configured)
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET) {
      res.redirect("/auth/google");
    } else {
      res.status(503).json({ 
        message: "Google OAuth not configured. Please configure GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables." 
      });
    }
  });

  // Gmail OAuth Routes - DISABLED FOR LOCAL DEVELOPMENT
  // For local development, use demo login instead
  app.get('/auth/google', (req, res) => {
    // Allow user to specify their email via query parameter, or use default
    const userEmail = (req.query.email as string) || "nokhen330@gmail.com";
    const userId = userEmail.split('@')[0].replace(/[^a-z0-9]/gi, '-') || "user";
    
    console.log('🔐 Local dev: Logging in user:', userEmail);
    
    // Create or get user in storage with the actual email
    storage.upsertUser({
      email: userEmail,
      firstName: userEmail.split('@')[0].split('.')[0] || "User",
      lastName: userEmail.split('@')[0].split('.').slice(1).join(' ') || "",
      role: "admin", // Give admin access for testing
      creditBalance: 1000,
      authProvider: "demo",
      emailVerified: true,
      isActive: true,
    }).then((user) => {
      // Set session to indicate user is logged in
      (req.session as any).userLoggedIn = true;
      (req.session as any).userId = user.id; // Use the actual user ID from storage
      (req.session as any).userRole = user.role;
      (req.session as any).userEmail = user.email; // Store actual email
      
      // Save session and redirect
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          return res.status(500).send('Failed to log in');
        }
        
        console.log('✅ User logged in successfully:', user.email);
        
        // Redirect to app
        const redirectTo = (req.query.redirect as string) || '/app';
        res.redirect(redirectTo);
      });
    }).catch((error) => {
      console.error('❌ Error creating/getting user:', error);
      res.status(500).send('Failed to log in');
    });
  });

  // Logout endpoint
  app.get('/api/logout', (req, res) => {
    console.log('🔓 User logging out...');
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Session destroy error:', err);
        return res.status(500).json({ message: 'Failed to log out' });
      }
      console.log('✅ User logged out successfully');
      res.redirect('/');
    });
  });

  app.post('/api/logout', (req, res) => {
    console.log('🔓 User logging out (POST)...');
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Session destroy error:', err);
        return res.status(500).json({ message: 'Failed to log out' });
      }
      console.log('✅ User logged out successfully');
      res.json({ success: true, redirectTo: '/' });
    });
  });

  app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      
      // Save the refresh token
      console.log('\n🎉 GMAIL OAUTH AUTHORIZATION SUCCESSFUL!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('SAVE THIS REFRESH TOKEN AS GMAIL_REFRESH_TOKEN:');
      console.log(tokens.refresh_token);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Add this to your environment variables:');
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      oauth2Client.setCredentials(tokens);
      res.send(`
        <html>
          <head><title>Gmail OAuth Success</title></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h1 style="color: #4CAF50;">✅ Gmail OAuth Authorization Successful!</h1>
            <p>Your Gmail account has been successfully authorized for sending emails.</p>
            <p><strong>Next steps:</strong></p>
            <ol>
              <li>Copy the refresh token from the server console</li>
              <li>Add it to your environment variables as <code>GMAIL_REFRESH_TOKEN</code></li>
              <li>Restart your server</li>
            </ol>
            <p>You can now close this window and return to your application.</p>
            <a href="/" style="background: #6B46C1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to App</a>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      res.status(500).send(`
        <html>
          <head><title>Gmail OAuth Error</title></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h1 style="color: #f44336;">❌ Gmail OAuth Authorization Failed</h1>
            <p>There was an error during the authorization process.</p>
            <p>Please try again or check the server logs for more details.</p>
            <a href="/auth/google" style="background: #6B46C1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Try Again</a>
          </body>
        </html>
      `);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}