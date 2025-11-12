import HexagonWidget from "./HexagonWidget";

const TaxIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="tax-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#84cc16" />
        <stop offset="50%" stopColor="#a3e635" />
        <stop offset="100%" stopColor="#65a30d" />
      </linearGradient>
      <pattern id="tax-lines" x="0" y="0" width="4" height="1" patternUnits="userSpaceOnUse">
        <rect width="2" height="1" fill="url(#tax-grad)" opacity="0.2"/>
      </pattern>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#tax-lines)"/>
    <circle cx="12" cy="12" r="10" stroke="url(#tax-grad)" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="7" stroke="url(#tax-grad)" strokeWidth="1" fill="none" opacity="0.5"/>
    <text x="12" y="11" fontSize="8" fontWeight="bold" textAnchor="middle" fill="url(#tax-grad)">TAX</text>
    <text x="12" y="17" fontSize="5" textAnchor="middle" fill="url(#tax-grad)">VALID</text>
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="url(#tax-grad)" strokeWidth="1" opacity="0.4"/>
  </svg>
);

export default function RoadTaxWidget() {
  return (
    <HexagonWidget
      icon={<TaxIcon />}
      title="Road Tax"
      color="#84cc16"
      expandedContent={
        <div>
          <p>Check current road tax status, expiry date, and tax band information.</p>
        </div>
      }
    />
  );
}