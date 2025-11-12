/**
 * Brand theming and logo detection system
 */

export type BrandTheme = {
  name: string;
  primary: string;
  accent: string;
  logoSvg: string;
};

const DEFAULT: BrandTheme = {
  name: "HG Verified",
  primary: "#0066cc",
  accent: "#ff9800",
  logoSvg: ""
};

const registry: Record<string, BrandTheme> = {
  "VAUXHALL": { 
    name: "Vauxhall", 
    primary: "#D71920", 
    accent: "#222222", 
    logoSvg: "" 
  },
  "BMW": { 
    name: "BMW", 
    primary: "#1C69D4", 
    accent: "#000000", 
    logoSvg: "" 
  },
  "MERCEDES-BENZ": { 
    name: "Mercedes-Benz", 
    primary: "#00ADEF", 
    accent: "#222222", 
    logoSvg: "" 
  },
  "AUDI": { 
    name: "Audi", 
    primary: "#BB0000", 
    accent: "#222222", 
    logoSvg: "" 
  },
  "VOLKSWAGEN": { 
    name: "Volkswagen", 
    primary: "#001E50", 
    accent: "#1C69D4", 
    logoSvg: "" 
  },
  "FORD": { 
    name: "Ford", 
    primary: "#003478", 
    accent: "#FFA500", 
    logoSvg: "" 
  },
  "TOYOTA": { 
    name: "Toyota", 
    primary: "#EB0A1E", 
    accent: "#222222", 
    logoSvg: "" 
  },
  "NISSAN": { 
    name: "Nissan", 
    primary: "#C3002F", 
    accent: "#222222", 
    logoSvg: "" 
  },
  "HONDA": { 
    name: "Honda", 
    primary: "#E40521", 
    accent: "#222222", 
    logoSvg: "" 
  },
  "PEUGEOT": { 
    name: "Peugeot", 
    primary: "#00B0F0", 
    accent: "#003CA6", 
    logoSvg: "" 
  },
  "RENAULT": { 
    name: "Renault", 
    primary: "#FFCC33", 
    accent: "#000000", 
    logoSvg: "" 
  },
  "VOLVO": { 
    name: "Volvo", 
    primary: "#003057", 
    accent: "#65B5E3", 
    logoSvg: "" 
  },
  "JAGUAR": { 
    name: "Jaguar", 
    primary: "#000000", 
    accent: "#DF0027", 
    logoSvg: "" 
  },
  "LAND ROVER": { 
    name: "Land Rover", 
    primary: "#005A2B", 
    accent: "#222222", 
    logoSvg: "" 
  },
  "TESLA": { 
    name: "Tesla", 
    primary: "#CC0000", 
    accent: "#222222", 
    logoSvg: "" 
  },
  "HYUNDAI": { 
    name: "Hyundai", 
    primary: "#002C5F", 
    accent: "#007FA8", 
    logoSvg: "" 
  },
  "KIA": { 
    name: "Kia", 
    primary: "#BB162B", 
    accent: "#222222", 
    logoSvg: "" 
  },
  "MAZDA": { 
    name: "Mazda", 
    primary: "#E01F3D", 
    accent: "#222222", 
    logoSvg: "" 
  },
  "MINI": { 
    name: "MINI", 
    primary: "#000000", 
    accent: "#3A5DAE", 
    logoSvg: "" 
  },
  "PORSCHE": { 
    name: "Porsche", 
    primary: "#B12B28", 
    accent: "#D5001C", 
    logoSvg: "" 
  }
};

export function getTheme(make?: string): BrandTheme {
  if (!make) return DEFAULT;
  const key = make.trim().toUpperCase().replace(/\s+/g, " ");
  return registry[key] || DEFAULT;
}