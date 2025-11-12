import HexagonWidget from "./HexagonWidget";

const ValuationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="valuation-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="50%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
      <linearGradient id="value-bars" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
    </defs>
    <rect x="2" y="14" width="4" height="8" fill="url(#value-bars)" opacity="0.6"/>
    <rect x="7" y="10" width="4" height="12" fill="url(#value-bars)" opacity="0.7"/>
    <rect x="12" y="6" width="4" height="16" fill="url(#value-bars)" opacity="0.8"/>
    <rect x="17" y="2" width="4" height="20" fill="url(#value-bars)"/>
    <path d="M2 14c0-6 4-10 10-10s10 4 10 10" stroke="url(#valuation-grad)" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="12" cy="4" r="2" fill="url(#valuation-grad)"/>
    <path d="M12 4l3-2M12 4l-3-2" stroke="url(#valuation-grad)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function IndependentValuationWidget() {
  return (
    <HexagonWidget
      icon={<ValuationIcon />}
      title="Independent Valuation"
      color="#dc2626"
      expandedContent={
        <div>
          <p>Get current market valuation based on condition, mileage, and market trends.</p>
        </div>
      }
    />
  );
}