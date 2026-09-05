"use client"

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function NotFound() {
    let Router = useRouter()   

    useEffect(()=>{
        Router.push("/?alert=not-found")
    })
  return (
    <div className="text-5xl flex items-center justify-center w-full h-screen bg-black">
      <div className="center border border-white p-2 px-3 rounded-xl">
        <p className="text-2xl">Loading...</p>
      </div>
    </div>
  );
}
