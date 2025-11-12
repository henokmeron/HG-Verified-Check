import HexagonWidget from "./HexagonWidget";

const PlateIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="plate-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="50%" stopColor="#f9a8d4" />
        <stop offset="100%" stopColor="#db2777" />
      </linearGradient>
      <radialGradient id="plate-bg">
        <stop offset="0%" stopColor="#fce7f3" />
        <stop offset="100%" stopColor="#fbcfe8" />
      </radialGradient>
    </defs>
    <rect x="1" y="8" width="22" height="8" rx="1" fill="url(#plate-bg)" opacity="0.3"/>
    <rect x="1" y="8" width="22" height="8" rx="1" stroke="url(#plate-grad)" strokeWidth="2" fill="none"/>
    <rect x="2" y="9" width="3" height="6" fill="url(#plate-grad)" opacity="0.8"/>
    <text x="12" y="13" fontSize="6" fontWeight="bold" textAnchor="middle" fill="url(#plate-grad)">AB12 CDE</text>
    <circle cx="20" cy="12" r="1" fill="url(#plate-grad)"/>
    <path d="M6 5l2 3M16 5l2 3M8 19l-2-3M18 19l-2-3" stroke="url(#plate-grad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

export default function PlateChangeWidget() {
  return (
    <HexagonWidget
      icon={<PlateIcon />}
      title="Plate Change"
      color="#ec4899"
      expandedContent={
        <div>
          <p>Check if the vehicle has had any registration plate changes that could indicate identity alterations.</p>
        </div>
      }
    />
  );
}