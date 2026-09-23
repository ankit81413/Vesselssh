import Image from "next/image";
import TerminalDock from "./TerminalDock";


export default function Header() {
  return (
    <>

      <header className="absolute inset-x-0 top-0 z-10 flex h-9 items-center justify-between border-b border-white/10 bg-zinc-950/32 px-3 text-[13px] font-medium text-white/90 shadow-lg shadow-black/10 sm:px-5">
        <div className="flex items-center gap-4">
          <div className="termianlDockSpace h-6 w-25"></div>
          <nav className="hidden items-center gap-3 text-white/72 md:flex">
            <button className="rounded px-2 py-1 hover:bg-white/10">File</button>
            <button className="rounded px-2 py-1 hover:bg-white/10">
              Session
            </button>
            <button className="rounded px-2 py-1 hover:bg-white/10">View</button>
          </nav>
        </div>

        {/* <div className="flex items-center gap-3 text-white/80">
        <i className="fa-solid fa-wifi" aria-hidden="true" />
        <i className="fa-solid fa-battery-three-quarters" aria-hidden="true" />
      </div> */}
      </header>

      <TerminalDock />
    </>
  );
}
