"use client"

import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";

export default function NotFound() {
    const Router = useRouter()
    const pathName = usePathname()

    useEffect(()=>{
        Router.push(`/?alert=route-not-found&alroute=${pathName}`)
    })
  return (
    <div className="text-5xl flex items-center justify-center w-full h-screen bg-black">
      <div className="center border border-white p-2 px-3 rounded-xl">
        <p className="text-2xl">Loading...</p>
      </div>
    </div>
  );
}
