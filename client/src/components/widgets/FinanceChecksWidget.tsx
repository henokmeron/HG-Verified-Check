import HexagonWidget from "./HexagonWidget";

const FinanceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="finance-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="50%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <pattern id="pattern-finance" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.5" fill="url(#finance-grad)" opacity="0.3"/>
      </pattern>
    </defs>
    <rect x="2" y="5" width="20" height="14" rx="3" fill="url(#pattern-finance)"/>
    <rect x="2" y="5" width="20" height="14" rx="3" stroke="url(#finance-grad)" strokeWidth="2" fill="none"/>
    <circle cx="7" cy="12" r="3" fill="url(#finance-grad)" opacity="0.3"/>
    <circle cx="17" cy="12" r="3" fill="url(#finance-grad)" opacity="0.3"/>
    <rect x="8" y="10" width="8" height="4" rx="1" fill="url(#finance-grad)"/>
    <path d="M12 2v3M12 19v3M6 12h2M16 12h2" stroke="url(#finance-grad)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

export default function FinanceChecksWidget() {
  return (
    <HexagonWidget
      icon={<FinanceIcon />}
      title="Finance Checks"
      color="#6366f1"
      expandedContent={
        <div>
          <p>Check for outstanding finance agreements that could affect ownership transfer and legal status.</p>
        </div>
      }
    />
  );
}