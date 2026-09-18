"use client";

import { useEffect, useRef, useState } from "react";
import AppWindow from "./components/main/AppWindow";
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { isNull } from "util";

export default function Home() {
  const [youtubeOpen, setYoutubeOpen] = useState(true);

  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white">
      <section className="flex min-h-screen flex-col">
        <div className="relative flex flex-1 px-4 pb-16 pt-14 sm:px-7">
          <div className="grid h-fit grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-1">
            
          </div>
        </div>
      </section>


      {youtubeOpen && (
        <AppWindow
          title="VS Code"
          src="http://localhost:8080/"
          icon={<i aria-hidden="true" className="fa-solid fa-play text-red-400 w-2 h-2 text-[10px]" />}
          onClose={() => setYoutubeOpen(false)}
        />
      )}
    </main>
  );
}
