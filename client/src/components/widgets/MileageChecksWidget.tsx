import HexagonWidget from "./HexagonWidget";

const MileageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="mileage-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <radialGradient id="speed-glow">
        <stop offset="0%" stopColor="#fbbf24" opacity="0.8"/>
        <stop offset="100%" stopColor="#f59e0b" opacity="0.2"/>
      </radialGradient>
    </defs>
    <path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="url(#speed-glow)"/>
    <path d="M19.5 12c0-1.5-.5-3-1.5-4.2L16.5 9.3c.6.7 1 1.7 1 2.7 0 2.2-1.8 4-4 4s-4-1.8-4-4c0-1 .4-2 1-2.7L9 7.8C8 9 7.5 10.5 7.5 12c0 3.6 2.9 6.5 6.5 6.5s6.5-2.9 6.5-6.5z" fill="url(#mileage-grad)"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="url(#mileage-grad)" opacity="0.4"/>
    <path d="M12 12l-3-6" stroke="url(#mileage-grad)" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="1.5" fill="url(#mileage-grad)"/>
    <path d="M7 17h10M8 15l1 2 1-2M14 15l1 2 1-2" stroke="url(#mileage-grad)" strokeWidth="1" opacity="0.6"/>
  </svg>
);

export default function MileageChecksWidget() {
  return (
    <HexagonWidget
      icon={<MileageIcon />}
      title="Detailed Mileage Checks"
      color="#f59e0b"
      expandedContent={
        <div>
          <p>Analyze historical mileage records to detect potential odometer tampering or discrepancies.</p>
        </div>
      }
    />
  );
}