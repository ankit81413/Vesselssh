"use client"

import type { ReactNode } from "react";
import DesktopLayout from "@/app/(protected)/components/DesktopLayout";
import { usePathname } from "next/navigation";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {

  const pathname = usePathname()
  const path = pathname.toLowerCase().split("/");
  console.log(path);
  
  if (path.includes("app")){
    return children
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}
