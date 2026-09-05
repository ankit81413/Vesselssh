"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Header from "@/app/components/global/Header";
import Taskbar from "@/app/components/global/Taskbar";
import wallpaper from "@/app/assets/HomeWallpaper.jpg";
import { useSearchParams } from "next/navigation";

type DesktopLayoutProps = {
  children: ReactNode;
};

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  const [time, setTime] = useState(new Date());
  const searchParam = useSearchParams();

  useEffect(()=>{
    console.log(searchParam.get("alert"));
    
  },[])

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
     
    return () => window.clearInterval(timer);
  }, []);

  const clock = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const date = time.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });



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
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(4,12,24,0.36),rgba(4,7,12,0.14)_42%,rgba(4,12,24,0.46))]" />
      <Header clock={clock} date={date} />
      <div className="relative z-10 min-h-screen">{children}</div>
      <Taskbar clock={clock} date={date} />
    </div>
  );
}
