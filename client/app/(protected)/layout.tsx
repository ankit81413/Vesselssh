import type { ReactNode } from "react";
import DesktopLayout from "@/app/(protected)/components/DesktopLayout";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <DesktopLayout>{children}</DesktopLayout>;
}
