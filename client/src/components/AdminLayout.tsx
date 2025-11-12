import { ReactNode } from "react";
import BaseLayout from "./BaseLayout";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <BaseLayout variant="admin" showFooter={false} showBackground={false}>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </BaseLayout>
  );
}