import { ReactNode } from "react";
import BaseLayout from "./BaseLayout";

interface AppLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function AppLayout({ children, showFooter = true }: AppLayoutProps) {
  return (
    <BaseLayout variant="app" showFooter={showFooter}>
      {children}
    </BaseLayout>
  );
}