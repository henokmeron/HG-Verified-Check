import HexagonWidget from "./HexagonWidget";

const WriteOffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="writeoff-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="50%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
      <radialGradient id="crash-grad">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="100%" stopColor="#ef4444" />
      </radialGradient>
    </defs>
    <g transform="translate(12, 12)">
      <path d="M-8 0l3-3v2h4l1 2h-5v2z" fill="url(#writeoff-grad)" opacity="0.8"/>
      <path d="M8 0l-3-3v2h-4l-1 2h5v2z" fill="url(#writeoff-grad)" opacity="0.8"/>
      <circle r="5" fill="none" stroke="url(#writeoff-grad)" strokeWidth="2" strokeDasharray="2 1"/>
      <path d="M-2 -1l4 0l-2 3z" fill="url(#crash-grad)"/>
      <path d="M-3 -5l2 2M3 -5l-2 2M-3 5l2-2M3 5l-2-2" stroke="url(#writeoff-grad)" strokeWidth="2" strokeLinecap="round"/>
    </g>
  </svg>
);

export default function WriteOffWidget() {
  return (
    <HexagonWidget
      icon={<WriteOffIcon />}
      title="Write-off & Scrapped"
      color="#ef4444"
      expandedContent={
        <div>
          <p>Identify if the vehicle has been written off by insurers or officially scrapped through MIAFTR database checks.</p>
        </div>
      }
    />
  );
}