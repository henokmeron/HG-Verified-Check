import { buildUnifiedReportData } from './unifiedReportData';
import { generateSimplePDF } from './simplePdfGenerator';
import { generateUnifiedPDF } from './unifiedReportGenerator';

export interface GenerateReportOptions {
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

const shouldUseSimpleGenerator = () => {
  if (process.env.FORCE_SIMPLE_PDF === '1') return true;
  if (process.env.VERCEL === '1') return true;
  if (process.env.VERCEL_URL) return true;
  return false;
};

export async function generateReportPDF(options: GenerateReportOptions): Promise<Buffer> {
  const unified = buildUnifiedReportData(options);

  if (shouldUseSimpleGenerator()) {
    console.log('🧾 Using jsPDF simple generator (serverless-compatible) for report PDF');
    return generateSimplePDF(unified);
  }

  console.log('🧾 Using existing unifiedReportGenerator (Puppeteer) for PDF');
  const { vehicleData, reportRaw, context } = unified;

  return generateUnifiedPDF(
    vehicleData,
    reportRaw,
    context.isPremium,
    context.dateOfCheck,
    context.reference
  );
}
