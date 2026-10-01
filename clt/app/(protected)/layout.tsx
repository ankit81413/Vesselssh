import type { ReactNode } from "react";
import DesktopLayout from "@/app/(protected)/components/DesktopLayout";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");

  if (!pathname) {
    redirect("/");
  }

  const except = ["app", "PreinstalledApps"];

  const path = pathname.split("/").filter(Boolean);

  const isExcepted = path.some((segment) => except.includes(segment));

  if (isExcepted) {
    return <>{children}</>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}