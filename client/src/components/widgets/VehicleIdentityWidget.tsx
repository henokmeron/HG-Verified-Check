import HexagonWidget from "./HexagonWidget";

const VehicleIdentityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="vehicle-id-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="50%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#glow)">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="url(#vehicle-id-grad)" opacity="0.2"/>
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" fill="url(#vehicle-id-grad)"/>
      <circle cx="12" cy="12" r="1.5" fill="url(#vehicle-id-grad)"/>
      <path d="M9 2h6v3H9zM5 8h14v2H5z" fill="url(#vehicle-id-grad)" opacity="0.6"/>
    </g>
  </svg>
);

export default function VehicleIdentityWidget() {
  return (
    <HexagonWidget
      icon={<VehicleIdentityIcon />}
      title="Vehicle Identity Check"
      color="#10b981"
      expandedContent={
        <div>
          <p>Verify the vehicle's true identity through comprehensive VIN and registration checks against official Vehicle Data UK records.</p>
        </div>
      }
    />
  );
}