import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Simple PDF generator that works on Vercel serverless
 * Uses jsPDF instead of Puppeteer/Chromium
 */
export async function generateSimplePDF(
  vehicleData: any,
  reportRaw: any,
  isPremium: boolean,
  dateOfCheck: Date | string,
  reference: string,
  registration: string
): Promise<Buffer> {
  console.log('📄 Generating PDF with jsPDF (serverless-compatible)');
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Colors
  const primaryColor: [number, number, number] = [11, 95, 255];
  const textColor: [number, number, number] = [0, 0, 0];
  const grayColor: [number, number, number] = [128, 128, 128];
  
  let yPos = 20;
  
  // Header with blue background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle Check Report', 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('HG Verified Vehicle Check', 105, 25, { align: 'center' });
  
  // Registration in yellow box
  doc.setFillColor(255, 215, 0);
  doc.roundedRect(70, 30, 70, 12, 2, 2, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(registration.toUpperCase(), 105, 37, { align: 'center' });
  
  yPos = 50;
  
  // Report metadata
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date of Check: ${new Date(dateOfCheck).toLocaleDateString('en-GB')}`, 20, yPos);
  yPos += 5;
  doc.text(`Reference: ${reference}`, 20, yPos);
  yPos += 5;
  doc.text(`Report Type: ${isPremium ? 'Comprehensive' : 'Basic'}`, 20, yPos);
  yPos += 10;
  
  // Vehicle Identification Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Vehicle Identification', 20, yPos);
  yPos += 2;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 8;
  
  const vehicleId = reportRaw?.Results?.VehicleDetails?.VehicleIdentification || {};
  const modelDetails = reportRaw?.Results?.ModelDetails || {};
  
  const vehicleInfo = [
    ['VRM', vehicleId.Vrm || registration],
    ['DVLA Make', vehicleId.DvlaMake || 'N/A'],
    ['DVLA Model', vehicleId.DvlaModel || 'N/A'],
    ['Date First Registered', vehicleId.DateFirstRegisteredInUk || 'N/A'],
    ['Colour', vehicleId.Colour || 'N/A'],
    ['Fuel Type', vehicleId.FuelType || 'N/A'],
    ['Body Style', vehicleId.BodyStyle || 'N/A'],
    ['Engine Size', vehicleId.EngineCapacity ? `${vehicleId.EngineCapacity}cc` : 'N/A'],
    ['Transmission', vehicleId.Transmission || 'N/A'],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: vehicleInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 }
    },
    margin: { left: 20, right: 20 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // MOT History Section
  const motHistory = reportRaw?.Results?.MotHistoryDetails;
  const motTests = motHistory?.MotTestDetailsList || [];
  
  if (motTests.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('MOT History', 20, yPos);
    yPos += 2;
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(`${motTests.length} MOT test(s) found`, 20, yPos);
    yPos += 8;
    
    // Show last 5 MOT tests
    const recentTests = motTests.slice(0, 5);
    
    for (let i = 0; i < recentTests.length; i++) {
      const test = recentTests[i];
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Test header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPos - 4, 170, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(`Test Date: ${test.TestDate || 'N/A'}`, 25, yPos);
      
      // Result badge
      const isPass = test.TestResult === 'Pass' || test.TestResult === 'PASS';
      doc.setFillColor(isPass ? 16 : 239, isPass ? 185 : 68, isPass ? 129 : 68);
      doc.roundedRect(150, yPos - 4, 35, 6, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(test.TestResult || 'N/A', 167, yPos - 1, { align: 'center' });
      
      yPos += 8;
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      
      const testInfo = [
        ['Mileage', test.OdometerReading ? `${test.OdometerReading.toLocaleString()} miles` : 'N/A'],
        ['Expiry Date', test.ExpiryDate || 'N/A'],
        ['Test Number', test.TestNumber || 'N/A']
      ];
      
      autoTable(doc, {
        startY: yPos,
        head: [],
        body: testInfo,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 1.5 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 120 }
        },
        margin: { left: 25, right: 25 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 2;
      
      // Advisories
      if (test.AdvisoryNoticeList && test.AdvisoryNoticeList.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(217, 119, 6);
        doc.text(`Advisories (${test.AdvisoryNoticeList.length}):`, 25, yPos);
        yPos += 5;
        
        test.AdvisoryNoticeList.slice(0, 3).forEach((adv: any) => {
          const text = adv.AdvisoryNotice || adv.toString();
          const lines = doc.splitTextToSize(text, 160);
          doc.setTextColor(...grayColor);
          doc.text(lines, 30, yPos);
          yPos += lines.length * 4;
        });
        
        if (test.AdvisoryNoticeList.length > 3) {
          doc.setFontStyle('italic');
          doc.text(`+ ${test.AdvisoryNoticeList.length - 3} more advisories`, 30, yPos);
          yPos += 4;
        }
      }
      
      yPos += 6;
    }
    
    if (motTests.length > 5) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...grayColor);
      doc.text(`Showing 5 of ${motTests.length} tests`, 105, yPos, { align: 'center' });
      yPos += 10;
    }
  }
  
  // Footer on last page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  yPos = 270;
  doc.setFillColor(245, 245, 245);
  doc.rect(0, yPos, 210, 27, 'F');
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('This report was generated by HG Verified Vehicle Check', 105, yPos + 8, { align: 'center' });
  doc.text(`Report Reference: ${reference}`, 105, yPos + 13, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 105, yPos + 18, { align: 'center' });
  
  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  console.log('✅ PDF generated successfully with jsPDF, size:', pdfBuffer.length, 'bytes');
  
  return pdfBuffer;
}

