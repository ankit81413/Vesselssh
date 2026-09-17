import Image from "next/image";

type HeaderProps = {
    clock : string,
    date : string
}

export default function Header({clock,date} : HeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex h-9 items-center justify-between border-b border-white/10 bg-zinc-950/32 px-3 text-[13px] font-medium text-white/90 shadow-lg shadow-black/10 backdrop-blur-xl sm:px-5">
      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/10"
          aria-label="Open Vessel menu"
        >
          <Image src="/logo.svg" width={100} height={100} className="h-8 w-15" alt="VesselSSH"/>
        </button>
        <nav className="hidden items-center gap-3 text-white/72 md:flex">
          <button className="rounded px-2 py-1 hover:bg-white/10">File</button>
          <button className="rounded px-2 py-1 hover:bg-white/10">
            Session
          </button>
          <button className="rounded px-2 py-1 hover:bg-white/10">View</button>
        </nav>
      </div>

      <div className="flex items-center gap-3 text-white/80">
        <i className="fa-solid fa-wifi" aria-hidden="true" />
        <i className="fa-solid fa-battery-three-quarters" aria-hidden="true" />
        <span className="hidden sm:inline">{date}</span>
        <span>{clock}</span>
      </div>
    </header>
  );
}
