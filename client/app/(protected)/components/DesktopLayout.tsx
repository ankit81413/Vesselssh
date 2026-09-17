"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Taskbar from "@/app/(protected)/components/global/Taskbar";
import wallpaper from "@/app/(protected)/assets/HomeWallpaper.jpg";
import TerminalDock from "./global/TerminalDock";
import Header from "./global/Header";

type DesktopLayoutProps = {
  children: ReactNode;
};

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    
    return () => {};
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <Image
        src={wallpaper}
        alt="Vessel desktop wallpaper"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <Header />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(4,12,24,0.36),rgba(4,7,12,0.14)_42%,rgba(4,12,24,0.46))]" />
      <div className="relative z-20 min-h-screen">{children}</div>
      <Taskbar currentTime={time} />
    </div>
  );
}
