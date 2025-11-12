import React from 'react';
import { HideStrategy } from './types';

export const SectionGate: React.FC<{
  docName: string;
  included: boolean;
  strategy: HideStrategy;
  children: React.ReactNode;
}> = ({ docName, included, strategy, children }) => {
  if (included) return <>{children}</>;
  if (strategy === 'hide') return null;

  // blur
  return (
    <div className="vd-blur">
      <div className="vd-blur__overlay">Available in Full Check</div>
      {children}
    </div>
  );
};