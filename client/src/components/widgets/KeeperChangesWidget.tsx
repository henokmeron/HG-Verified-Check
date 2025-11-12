import HexagonWidget from "./HexagonWidget";

const KeeperIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="keeper-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="50%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <g transform="translate(2, 2)">
      <rect x="0" y="0" width="6" height="8" rx="1" fill="url(#keeper-grad)" opacity="0.3"/>
      <rect x="7" y="0" width="6" height="8" rx="1" fill="url(#keeper-grad)" opacity="0.5"/>
      <rect x="14" y="0" width="6" height="8" rx="1" fill="url(#keeper-grad)" opacity="0.7"/>
      <circle cx="3" cy="4" r="2" fill="url(#keeper-grad)"/>
      <circle cx="10" cy="4" r="2" fill="url(#keeper-grad)"/>
      <circle cx="17" cy="4" r="2" fill="url(#keeper-grad)"/>
      <path d="M0 10h6l1 2-1 2H0zM7 10h6l1 2-1 2H7zM14 10h6l1 2-1 2h-6z" fill="url(#keeper-grad)" opacity="0.4"/>
      <path d="M3 16v2M10 16v2M17 16v2" stroke="url(#keeper-grad)" strokeWidth="2" strokeLinecap="round"/>
    </g>
  </svg>
);

export default function KeeperChangesWidget() {
  return (
    <HexagonWidget
      icon={<KeeperIcon />}
      title="Keeper Changes"
      color="#a855f7"
      expandedContent={
        <div>
          <p>Track the number of previous owners and keeper change history for ownership verification.</p>
        </div>
      }
    />
  );
}