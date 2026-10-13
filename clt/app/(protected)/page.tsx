"use client";

import { useEffect, useRef, useState } from "react";
import AppWindow from "./components/main/AppWindow";
import { useAppStore } from "./store/appStore";

export default function Home() {
  const apps = useAppStore((s) => s.apps);
  const addApp = useAppStore((s) => s.addApp);


  const openApp = (appId: string, name: string, icon: string) => {
    addApp({
      id: crypto.randomUUID(),
      appId: appId,
      name: name,
      status: "running",
      icon: icon
    });
  };

  const desktopApps = [
    {
      Appid: "Terminal",
      name: "Terminal",
      icon: "fa-solid fa-terminal",
      color: "text-green-400",
    },
    {
      Appid: "CodeServer",
      name: "Code Server",
      icon: "fa-solid fa-terminal",
      color: "text-red-400",
    }
  ];

  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white">
      <section className="flex min-h-screen flex-col">
        <div className="relative flex flex-1 px-4 pb-16 pt-14 sm:px-7">
          <div className="grid h-fit w-full grid-cols-[repeat(auto-fill,minmax(76px,90px))] gap-x-4 gap-y-5">
            {desktopApps.map((app) => (
              <button
                key={app.Appid}
                type="button"
                onClick={() => openApp(app.Appid, app.name, app.icon)}
                className="group flex min-h-[76px] w-full flex-col items-center justify-center gap-2 rounded-lg p-2 text-center transition-colors hover:bg-white/10"
                title={`Double-click to open ${app.name}`}
              >
                <i
                  aria-hidden="true"
                  className={`${app.icon} ${app.color} text-2xl transition-transform group-hover:scale-110`}
                />
                <span className="w-full break-words text-xs leading-4 text-white/90">
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {apps.map((app) => (
        <AppWindow
          key={app.id}
          id={app.id}
          initialWidth={app.initialBounds?.width}
          initialHeight={app.initialBounds?.height}
          initialPosition={app.initialBounds}
          title={app.name}
          src={`http://localhost:48283/app/${app.appId}`}
          icon={
            <i
              aria-hidden="true"
              className={`${app.icon} text-red-400 w-2 h-2 text-[10px]`}
            />
          }
          beforeClose={() => {
            console.log("Apps External function closed");
          }}
          data={app}
        />
      ))}


    </main>
  );
}
