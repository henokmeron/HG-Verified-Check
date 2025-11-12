import HexagonWidget from "./HexagonWidget";

const StolenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="stolen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
      <pattern id="lock-pattern" x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
        <rect width="1" height="1" fill="url(#stolen-grad)" opacity="0.2"/>
      </pattern>
    </defs>
    <rect x="6" y="11" width="12" height="10" rx="2" fill="url(#lock-pattern)"/>
    <rect x="6" y="11" width="12" height="10" rx="2" stroke="url(#stolen-grad)" strokeWidth="2" fill="none"/>
    <path d="M8 11V7a4 4 0 018 0v4" stroke="url(#stolen-grad)" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" fill="url(#stolen-grad)"/>
    <path d="M12 16v2" stroke="url(#stolen-grad)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 3l3 3M18 3l3 3M3 3l-1 1M22 3l1 1" stroke="url(#stolen-grad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

export default function StolenCheckWidget() {
  return (
    <HexagonWidget
      icon={<StolenIcon />}
      title="Stolen Check"
      color="#06b6d4"
      expandedContent={
        <div>
          <p>Verify against Police National Computer records to ensure the vehicle hasn't been reported stolen.</p>
        </div>
      }
    />
  );
}