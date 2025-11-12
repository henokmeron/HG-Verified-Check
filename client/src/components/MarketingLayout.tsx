import { ReactNode } from "react";
import BaseLayout from "./BaseLayout";

interface MarketingLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function MarketingLayout({ children, showFooter = true }: MarketingLayoutProps) {
  return (
    <BaseLayout variant="marketing" showFooter={showFooter}>
      {children}
    </BaseLayout>
  );
}