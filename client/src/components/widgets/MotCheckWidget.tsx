import HexagonWidget from "./HexagonWidget";

const MotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="mot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <radialGradient id="mot-center">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#0891b2" />
      </radialGradient>
    </defs>
    <rect x="4" y="6" width="16" height="14" rx="2" fill="url(#mot-grad)" opacity="0.1"/>
    <rect x="4" y="6" width="16" height="14" rx="2" stroke="url(#mot-grad)" strokeWidth="2" fill="none"/>
    <rect x="6" y="4" width="3" height="4" rx="1" fill="url(#mot-grad)"/>
    <rect x="15" y="4" width="3" height="4" rx="1" fill="url(#mot-grad)"/>
    <circle cx="12" cy="13" r="4" fill="url(#mot-center)" opacity="0.3"/>
    <path d="M10 13l1.5 1.5 2.5-3" stroke="url(#mot-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="12" y="19" fontSize="4" fontWeight="bold" textAnchor="middle" fill="url(#mot-grad)">MOT</text>
  </svg>
);

export default function MotCheckWidget() {
  return (
    <HexagonWidget
      icon={<MotIcon />}
      title="MOT Check"
      color="#06b6d4"
      defaultExpanded={true}
      expandedContent={
        <div>
          <p>Discover complete MOT test history with pass/fail results, advisories, and mileage verification. Get instant access to official DVSA records showing all tests and safety issues.</p>
        </div>
      }
    />
  );
}