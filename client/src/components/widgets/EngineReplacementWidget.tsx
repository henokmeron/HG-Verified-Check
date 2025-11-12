import HexagonWidget from "./HexagonWidget";

const EngineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="engine-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d946ef" />
        <stop offset="50%" stopColor="#e879f9" />
        <stop offset="100%" stopColor="#a21caf" />
      </linearGradient>
      <radialGradient id="piston-grad">
        <stop offset="0%" stopColor="#f0abfc" />
        <stop offset="100%" stopColor="#d946ef" />
      </radialGradient>
    </defs>
    <g transform="translate(12, 12)">
      <rect x="-8" y="-4" width="16" height="8" rx="1" fill="url(#engine-grad)" opacity="0.3"/>
      <rect x="-6" y="-2" width="4" height="6" fill="url(#piston-grad)"/>
      <rect x="-1" y="-2" width="4" height="6" fill="url(#piston-grad)"/>
      <rect x="4" y="-2" width="4" height="6" fill="url(#piston-grad)"/>
      <path d="M-8 -6h16v2h-16zM-8 4h16v2h-16z" fill="url(#engine-grad)"/>
      <circle r="10" fill="none" stroke="url(#engine-grad)" strokeWidth="1" strokeDasharray="1 2" opacity="0.3"/>
      <path d="M-4 -8v-2M0 -8v-2M4 -8v-2M-4 8v2M0 8v2M4 8v2" stroke="url(#engine-grad)" strokeWidth="2" strokeLinecap="round"/>
    </g>
  </svg>
);

export default function EngineReplacementWidget() {
  return (
    <HexagonWidget
      icon={<EngineIcon />}
      title="Engine Replacement"
      color="#d946ef"
      expandedContent={
        <div>
          <p>Identify if the vehicle has undergone engine replacement or major mechanical modifications.</p>
        </div>
      }
    />
  );
}