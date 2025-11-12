import path from 'path';
import fs from 'fs';

// Mapping of vehicle makes to their logo files
const brandLogoMap: Record<string, string> = {
  // German Brands
  'AUDI': 'audi.svg',
  'BMW': 'bmw.svg',
  'MERCEDES': 'mercedes.svg',
  'MERCEDES-BENZ': 'mercedes.svg',
  'VOLKSWAGEN': 'volkswagen.svg',
  'VW': 'volkswagen.svg',
  'PORSCHE': 'porsche.svg',
  'OPEL': 'opel.svg',
  
  // British Brands
  'ASTON MARTIN': 'aston-martin.svg',
  'BENTLEY': 'bentley.svg',
  'JAGUAR': 'jaguar.svg',
  'LAND ROVER': 'land-rover.svg',
  'MINI': 'mini.svg',
  'ROLLS-ROYCE': 'rolls-royce.svg',
  'VAUXHALL': 'vauxhall.svg',
  'LOTUS': 'lotus.svg',
  'MCLAREN': 'mclaren.svg',
  
  // Japanese Brands
  'HONDA': 'honda.svg',
  'TOYOTA': 'toyota.svg',
  'NISSAN': 'nissan.svg',
  'MAZDA': 'mazda.svg',
  'MITSUBISHI': 'mitsubishi.svg',
  'SUBARU': 'subaru.svg',
  'SUZUKI': 'suzuki.svg',
  'LEXUS': 'lexus.svg',
  'INFINITI': 'infiniti.svg',
  'DAIHATSU': 'daihatsu.svg',
  
  // American Brands
  'FORD': 'ford.svg',
  'CHEVROLET': 'chevrolet.svg',
  'CHRYSLER': 'chrysler.svg',
  'DODGE': 'dodge.svg',
  'JEEP': 'jeep.svg',
  'TESLA': 'tesla.svg',
  'CADILLAC': 'cadillac.svg',
  'GMC': 'gmc.svg',
  'LINCOLN': 'lincoln.svg',
  'BUICK': 'buick.svg',
  'RAM': 'ram.svg',
  
  // Italian Brands
  'ALFA ROMEO': 'alfa-romeo.svg',
  'FERRARI': 'ferrari.svg',
  'FIAT': 'fiat.svg',
  'LAMBORGHINI': 'lamborghini.svg',
  'MASERATI': 'maserati.svg',
  'LANCIA': 'lancia.svg',
  
  // French Brands
  'CITROEN': 'citroen.svg',
  'PEUGEOT': 'peugeot.svg',
  'RENAULT': 'renault.svg',
  'DS': 'ds.svg',
  'ALPINE': 'alpine.svg',
  
  // Korean Brands
  'HYUNDAI': 'hyundai.svg',
  'KIA': 'kia.svg',
  'GENESIS': 'genesis.svg',
  'SSANGYONG': 'ssangyong.svg',
  
  // Swedish Brands
  'VOLVO': 'volvo.svg',
  'SAAB': 'saab.svg',
  'POLESTAR': 'polestar.svg',
  
  // Other Brands
  'SEAT': 'seat.svg',
  'SKODA': 'skoda.svg',
  'SMART': 'smart.svg',
  'DACIA': 'dacia.svg',
  'MG': 'mg.svg',
  'ROVER': 'rover.svg',
  'ISUZU': 'isuzu.svg',
  'DAEWOO': 'daewoo.svg'
};

/**
 * Get the brand logo URL for a given vehicle make
 * Returns a base64 encoded SVG if logo file exists, otherwise returns null
 */
export function getBrandLogoUrl(make: string | undefined | null): string | null {
  if (!make) return null;
  
  const upperMake = make.toUpperCase().trim();
  const logoFilename = brandLogoMap[upperMake];
  
  if (!logoFilename) {
    // Try to find a partial match
    for (const [brand, filename] of Object.entries(brandLogoMap)) {
      if (upperMake.includes(brand) || brand.includes(upperMake)) {
        return getLogoBase64(filename);
      }
    }
    return getGenericLogo();
  }
  
  return getLogoBase64(logoFilename);
}

/**
 * Get base64 encoded logo
 */
function getLogoBase64(filename: string): string | null {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'brand-logos', filename);
    
    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      console.warn(`Logo file not found: ${logoPath}`);
      return getGenericLogo();
    }
    
    // Read and encode the file
    const logoContent = fs.readFileSync(logoPath);
    const base64 = logoContent.toString('base64');
    const mimeType = filename.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`Error loading logo ${filename}:`, error);
    return getGenericLogo();
  }
}

/**
 * Get a generic car logo as fallback
 */
function getGenericLogo(): string {
  // Return a simple inline SVG car icon as base64
  const genericCarSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0066cc">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  `;
  
  const base64 = Buffer.from(genericCarSvg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Create placeholder logo files for common brands
 */
export function createPlaceholderLogos(): void {
  const logoDir = path.join(process.cwd(), 'public', 'brand-logos');
  
  // Ensure directory exists
  if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
  }
  
  // Create a generic placeholder SVG for each brand
  const placeholderSvg = (brandName: string, color: string = '#0066cc') => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="white"/>
  <circle cx="100" cy="100" r="90" fill="${color}" opacity="0.1"/>
  <text x="100" y="100" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
        text-anchor="middle" dominant-baseline="middle" fill="${color}">
    ${brandName.substring(0, 3).toUpperCase()}
  </text>
</svg>`;
  
  // Create placeholder files for major brands
  const majorBrands = [
    { name: 'BMW', color: '#0066cc' },
    { name: 'MERCEDES', color: '#00adef' },
    { name: 'AUDI', color: '#bb0a30' },
    { name: 'VOLKSWAGEN', color: '#001e50' },
    { name: 'FORD', color: '#003478' },
    { name: 'TOYOTA', color: '#eb0a1e' },
    { name: 'HONDA', color: '#cc0000' },
    { name: 'NISSAN', color: '#c3002f' },
    { name: 'VAUXHALL', color: '#e01a4f' },
    { name: 'PEUGEOT', color: '#00b2e3' },
    { name: 'RENAULT', color: '#ffcc33' },
    { name: 'FIAT', color: '#a6192e' },
    { name: 'VOLVO', color: '#003057' },
    { name: 'MAZDA', color: '#7c7c7c' },
    { name: 'HYUNDAI', color: '#002c5f' },
    { name: 'KIA', color: '#bb162b' },
    { name: 'LAND ROVER', color: '#005a2b' },
    { name: 'JAGUAR', color: '#761848' },
    { name: 'MINI', color: '#000000' },
    { name: 'TESLA', color: '#cc0000' }
  ];
  
  for (const brand of majorBrands) {
    const filename = brandLogoMap[brand.name];
    if (filename) {
      const filepath = path.join(logoDir, filename);
      if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, placeholderSvg(brand.name, brand.color));
      }
    }
  }
  
  // Create generic logo
  const genericPath = path.join(logoDir, 'generic.svg');
  if (!fs.existsSync(genericPath)) {
    fs.writeFileSync(genericPath, placeholderSvg('CAR', '#666666'));
  }
}

// Initialize placeholder logos on module load
createPlaceholderLogos();