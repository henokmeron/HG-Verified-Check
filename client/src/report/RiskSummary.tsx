import React from 'react';
import { deriveRisk } from './formatters';

const Pill: React.FC<{label:string; risk:'pass'|'warn'|'fail'|'na'}> = ({label, risk}) => (
  <div className={`pill pill--${risk}`}><span>{label}</span></div>
);

export const RiskSummary: React.FC<{ payload:any }> = ({ payload }) => {
  const keys = [
    ['Finance','Finance'],
    ['MIAFTR','MIAFTR'],
    ['PNC','PNC'],
    ['Mileage','Mileage']
  ] as const;

  // Check if any of the risk data sections actually have data
  const hasAnyRiskData = payload?.Results?.FinanceDetails || 
                         payload?.Results?.MiaftrDetails || 
                         payload?.Results?.PncDetails || 
                         payload?.Results?.MileageCheckDetails;

  // Don't render Risk Summary at all if no risk data is available (free checks)
  if (!hasAnyRiskData) {
    return null;
  }

  return (
    <section className="section section--tight" id="risk-summary">
      <header className="section__header"><h2>Risk Summary</h2></header>
      <div className="risk-row">
        {keys.map(([k, label]) => <Pill key={k} label={label} risk={deriveRisk(payload, k)} />)}
      </div>
    </section>
  );
};