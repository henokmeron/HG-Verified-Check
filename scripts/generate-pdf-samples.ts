import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildUnifiedReportData } from '../server/pdf/unifiedReportData';
import { generateSimplePDF } from '../server/pdf/simplePdfGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadMockLookup() {
  const mockPath = path.resolve(__dirname, '../data/mock-storage.json');
  const raw = await fs.readFile(mockPath, 'utf-8');
  const parsed = JSON.parse(raw);
  const lookup = parsed?.lookups?.[0];
  if (!lookup) {
    throw new Error('No lookup data found in mock-storage.json');
  }
  return lookup;
}

async function generateSample(reporter: 'free' | 'full') {
  const lookup = await loadMockLookup();
  const unified = buildUnifiedReportData({
    registration: lookup.registration,
    lookupId: lookup.id,
    vehicleData: lookup.vehicleData,
    reportRaw: lookup.reportRaw,
    reference: `${lookup.id}-${reporter}`,
    isPremium: reporter === 'full'
  });
  const buffer = await generateSimplePDF(unified);
  const outDir = path.resolve(__dirname, 'reports');
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `pdf-${reporter}.pdf`);
  await fs.writeFile(outPath, buffer);
  console.log(`✅ Generated ${reporter.toUpperCase()} PDF: ${outPath}`);
}

async function run() {
  await generateSample('free');
  await generateSample('full');
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

