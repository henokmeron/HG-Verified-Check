import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Send } from "lucide-react";

export default function TestPDF() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [registration, setRegistration] = useState("TEST123");
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test basic PDF generation
  const testBasicPDF = async () => {
    setIsLoading(true);
    addResult("Testing basic PDF generation...");
    
    try {
      const response = await fetch('/api/test-pdf');
      
      if (response.ok) {
        const blob = await response.blob();
        addResult(`✅ Basic PDF generated successfully (${blob.size} bytes)`);
        
        // Download the test PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'test.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Test PDF Downloaded",
          description: "Basic PDF generation is working!"
        });
      } else {
        addResult(`❌ Failed to generate basic PDF: ${response.status}`);
        toast({
          title: "Test Failed",
          description: "Basic PDF generation failed",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test full PDF with Azure
  const testFullPDF = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    addResult("Testing full PDF generation with Azure...");
    
    try {
      // Create comprehensive test data that matches the schema structure
      const testReportRaw = {
        Results: {
          VehicleDetails: [{
            VehicleIdentification: {
              DvlaMake: "BMW",
              DvlaModel: "3 SERIES",
              Vrm: registration,
              VinLast5: "AB123",
              YearOfManufacture: "2023",
              DvlaBodyType: "Saloon",
              DvlaFuelType: "Petrol",
              EngineNumber: "ENG123456",
              DvlaWheelPlan: "2 Axle Rigid Body",
              DateFirstRegistered: "2023-01-01",
              DateFirstRegisteredUk: "2023-01-01",
              DateOfManufacture: "2022-12-01",
              VehicleUsedBeforeFirstRegistration: false
            },
            VehicleStatus: {
              IsImported: false,
              IsExported: false,
              IsScrapped: false,
              DvlaCherishedTransferMarker: false
            },
            VehicleExciseDutyDetails: {
              DvlaCo2: "120",
              DvlaBand: "F",
              DvlaCo2Band: "Band F (121-130 g/km)",
              VedRatesFirstYear6Months: "220.00",
              VedRatesFirstYear12Months: "440.00",
              VedRatesStandard6Months: "85.00",
              VedRatesStandard12Months: "170.00"
            }
          }],
          VehicleHistory: [{
            ColourDetails: {
              CurrentColour: "Blue",
              OriginalColour: "Blue",
              NumberOfColourChanges: "0"
            },
            KeeperChangeList: {
              NumberOfPreviousKeepers: "2",
              KeeperChanges: [
                { KeeperStartDate: "2023-01-01", PreviousKeeperDisposalDate: "2023-06-01" },
                { KeeperStartDate: "2023-06-01", PreviousKeeperDisposalDate: null }
              ]
            }
          }],
          MotHistoryDetails: [{
            Make: "BMW",
            Model: "3 SERIES",
            Colour: "Blue",
            LatestTestDate: "2024-01-01",
            Vrm: registration,
            FuelType: "Petrol",
            FirstUsedDate: "2023-01-01",
            MotStatus: "Valid",
            MotDueDate: "2025-01-01",
            DaysSinceLastMot: "365",
            RecordedMileageData: {
              CountOfMotMileageRecords: "2",
              MinMileage: "1000",
              MaxMileage: "15000",
              ClockingCheckResult: "No Issues"
            },
            MotRecords: [
              {
                TestNumber: "123456789",
                TestDate: "2024-01-01",
                MotResult: "Pass",
                IsRetest: false,
                ExpiryDate: "2025-01-01",
                TestPassed: true,
                OdometerReading: "15000"
              }
            ]
          }],
          AdditionalCriticalChecks: [{
            Finance: false,
            WriteOff: false,
            AnomalyMileage: false,
            RecordedAsStolen: false,
            VrmOnPnc: false,
            VinOnPnc: false,
            NoLogbookLoan: true,
            MileageVerified: true
          }]
        }
      };
      
      const testVehicleData = {
        registration: registration,
        make: "BMW",
        model: "3 SERIES",
        year: "2023",
        engineSize: "2000cc",
        fuelType: "Petrol",
        colour: "Blue",
        bodyType: "Saloon",
        firstRegistration: "01/01/2023",
        motExpiry: "01/01/2025",
        motStatus: "Valid",
        taxStatus: "Valid",
        taxDue: "01/01/2025",
        sornStatus: "Not SORN",
        co2Emissions: "120g/km",
        dataSource: "Test Data",
        isComprehensive: true,
        insuranceWriteOff: "No",
        stolenStatus: "Not Stolen",
        financeOutstanding: "No",
        previousOwners: "2",
        marketValue: "£15,000"
      };

      addResult(`Sending request with email: ${email}`);
      
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registration: registration,
          email: email,
          vehicleData: testVehicleData,
          reportRaw: testReportRaw // Include comprehensive test data matching schema
        }),
      });

      addResult(`Response status: ${response.status}`);
      
      if (response.ok) {
        const blob = await response.blob();
        addResult(`✅ PDF generated successfully (${blob.size} bytes)`);
        addResult(`📧 Email should be sent to: ${email}`);
        
        // Download the PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vehicle-report-${registration}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Success!",
          description: `PDF downloaded and email will be sent to ${email}`
        });
      } else {
        const errorText = await response.text();
        addResult(`❌ Failed: ${errorText}`);
        toast({
          title: "Test Failed",
          description: "Failed to generate PDF with Azure",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            PDF Generation Test Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address (for Azure test)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                Email will be sent via your Azure Function
              </p>
            </div>
            
            <div>
              <Label htmlFor="registration">Registration (for filename)</Label>
              <Input
                id="registration"
                type="text"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                autoComplete="off"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={testBasicPDF}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Test Basic PDF
            </Button>
            
            <Button
              onClick={testFullPDF}
              disabled={isLoading || !email}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Test Full PDF + Azure Email
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <div className="space-y-1 font-mono text-sm">
                {testResults.map((result, index) => (
                  <div key={index} className={
                    result.includes('✅') ? 'text-green-600' :
                    result.includes('❌') ? 'text-red-600' :
                    'text-gray-700'
                  }>
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">How to Test:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Test Basic PDF" to verify server-side PDF generation is working</li>
              <li>Enter your email address</li>
              <li>Click "Test Full PDF + Azure Email" to test the complete flow</li>
              <li>Check your browser downloads for the PDF</li>
              <li>Check your email for the PDF sent via Azure</li>
            </ol>
            <p className="text-sm text-gray-600 mt-2">
              Check the browser console and server logs for detailed debugging information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}