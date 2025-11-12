import { NormalizedReport } from './normalizeReport';

export interface RiskAssessment {
  hasIssues: boolean;
  isCritical: boolean;
  summary: string;
  issues: string[];
  stolen: {
    status: boolean;
    message: string;
  };
  writeOff: {
    status: boolean;
    message: string;
  };
  finance: {
    status: boolean;
    message: string;
  };
  certificateOfDestruction: {
    status: boolean;
    message: string;
  };
  scrapped: {
    status: boolean;
    message: string;
  };
  mileage: {
    status: boolean;
    message: string;
  };
}

export function assessVehicleRisks(report: NormalizedReport): RiskAssessment {
  const issues: string[] = [];
  let hasIssues = false;
  let isCritical = false;

  // Check stolen status
  const isStolen = report.stolen?.isStolen === 'Yes' || report.stolen?.isStolen === true;
  const stolenStatus = {
    status: !isStolen,
    message: isStolen ? '✗ STOLEN' : '✓ NOT STOLEN'
  };
  if (isStolen) {
    issues.push('Vehicle reported as stolen');
    isCritical = true;
  }

  // Check write-off status
  const hasWriteOff = report.miaftr?.recordsFound === 'Yes' || 
                      (report.writeOffRecords && report.writeOffRecords.length > 0);
  const writeOffCategory = report.miaftr?.writeOffCategory || 
                          report.writeOffRecords?.[0]?.category || '';
  const writeOffStatus = {
    status: !hasWriteOff,
    message: hasWriteOff ? `✗ WRITE-OFF (${writeOffCategory})` : '✓ NO WRITE-OFF'
  };
  if (hasWriteOff) {
    const date = report.miaftr?.writeOffDate || report.writeOffRecords?.[0]?.date || '';
    issues.push(`Insurance write-off recorded (Category ${writeOffCategory}${date ? `, ${date}` : ''})`);
    hasIssues = true;
    // Categories A and B are critical (structural damage)
    if (writeOffCategory && ['A', 'B'].includes(writeOffCategory.toUpperCase())) {
      isCritical = true;
    }
  }

  // Check finance status
  const hasFinance = report.finance?.recordsFound === 'Yes';
  const financeStatus = {
    status: !hasFinance,
    message: hasFinance ? '✗ FINANCE OUTSTANDING' : '✓ NO FINANCE'
  };
  if (hasFinance) {
    issues.push('Outstanding finance agreement found');
    hasIssues = true;
  }

  // Check certificate of destruction
  const hasCertOfDestruction = report.vehicleStatus?.certOfDestruction === 'Yes' || 
                               report.vehicleStatus?.certOfDestruction === true;
  const certOfDestructionStatus = {
    status: !hasCertOfDestruction,
    message: hasCertOfDestruction ? '✗ CERTIFICATE OF DESTRUCTION ISSUED' : '✓ NO DESTRUCTION CERTIFICATE'
  };
  if (hasCertOfDestruction) {
    issues.push('Certificate of Destruction has been issued');
    isCritical = true;
  }

  // Check scrapped status
  const isScrapped = report.vehicleStatus?.isScrapped === 'Yes' || 
                    report.vehicleStatus?.isScrapped === true ||
                    report.vehicleIdentification?.isScrapped === 'Yes';
  const scrappedStatus = {
    status: !isScrapped,
    message: isScrapped ? '✗ VEHICLE SCRAPPED' : '✓ NOT SCRAPPED'
  };
  if (isScrapped) {
    const date = report.vehicleStatus?.dateScrapped || '';
    issues.push(`Vehicle has been scrapped${date ? ` on ${date}` : ''}`);
    isCritical = true;
  }

  // Check mileage discrepancies (simplified check)
  let hasMileageIssues = false;
  const mileageHistory = report.mileageHistory || [];
  if (mileageHistory.length > 1) {
    // Check for mileage going backwards
    for (let i = 1; i < mileageHistory.length; i++) {
      const currentMileage = parseInt(mileageHistory[i].mileage.replace(/[^0-9]/g, '') || '0');
      const previousMileage = parseInt(mileageHistory[i-1].mileage.replace(/[^0-9]/g, '') || '0');
      if (currentMileage < previousMileage && currentMileage > 0 && previousMileage > 0) {
        hasMileageIssues = true;
        break;
      }
    }
  }
  const mileageStatus = {
    status: !hasMileageIssues,
    message: hasMileageIssues ? '⚠ MILEAGE ANOMALY' : '✓ MILEAGE VERIFIED'
  };
  if (hasMileageIssues) {
    issues.push('Mileage discrepancy detected');
    hasIssues = true;
  }

  // Determine overall summary
  let summary = 'All major databases checked • ';
  if (isCritical) {
    summary += 'CRITICAL ISSUES FOUND - DO NOT PURCHASE';
  } else if (hasIssues) {
    summary += 'Issues detected - review carefully';
  } else {
    summary += 'No critical issues detected';
  }

  return {
    hasIssues: hasIssues || isCritical,
    isCritical,
    summary,
    issues,
    stolen: stolenStatus,
    writeOff: writeOffStatus,
    finance: financeStatus,
    certificateOfDestruction: certOfDestructionStatus,
    scrapped: scrappedStatus,
    mileage: mileageStatus
  };
}