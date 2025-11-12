import HexagonWidget from "./HexagonWidget";

const ColourIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="colour-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="33%" stopColor="#f59e0b" />
        <stop offset="66%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient id="colour-grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="50%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#f43f5e" />
      </linearGradient>
    </defs>
    <path d="M12 2l3.5 7H8.5z" fill="url(#colour-grad1)"/>
    <path d="M15.5 9l3.5 7h-7z" fill="url(#colour-grad2)"/>
    <path d="M8.5 9l-3.5 7h7z" fill="url(#colour-grad1)" opacity="0.8"/>
    <path d="M5 16h14l-7 6z" fill="url(#colour-grad2)" opacity="0.6"/>
    <circle cx="12" cy="12" r="2" fill="white"/>
    <circle cx="12" cy="12" r="1" fill="url(#colour-grad1)"/>
  </svg>
);

export default function ColourChangeWidget() {
  return (
    <HexagonWidget
      icon={<ColourIcon />}
      title="Colour Change"
      color="#f97316"
      expandedContent={
        <div>
          <p>Track any colour changes from the original manufacturer specification.</p>
        </div>
      }
    />
  );
}