import { useFullscreen } from "@/app/(protected)/hooks/useFullscreen";
import Image from "next/image";
import TaskbarClock from "./TaskbarClock";

type TaskbarProps = {
  currentTime: Date | null;
};

const taskbarApps = [
  {
    label: "Terminal",
    icon: "fa-terminal",
    isActive: true,
    isFocused: true,
    tone: "text-emerald-200",
  },
  {
    label: "Files",
    icon: "fa-folder-open",
    isActive: true,
    isFocused: false,
    tone: "text-sky-100",
  },
  {
    label: "Browser",
    icon: "fa-globe",
    isActive: false,
    isFocused: false,
    tone: "text-cyan-100",
  },
  {
    label: "Monitor",
    icon: "fa-chart-simple",
    isActive: false,
    isFocused: false,
    tone: "text-cyan-200",
  },
  {
    label: "Settings",
    icon: "fa-gear",
    isActive: false,
    isFocused: false,
    tone: "text-zinc-100",
  },
];

export default function Taskbar({ currentTime }: TaskbarProps) {
  const { enterFullscreen, exitFullscreen, isFullscreen } = useFullscreen();

  return (
    <footer className="absolute inset-x-0 bottom-0 z-20">
      <div className="flex h-12 w-full items-center justify-between border-t border-cyan-100/18 bg-slate-950/46 px-3 text-cyan-50 shadow-[0_-14px_42px_rgba(2,8,23,0.36)] backdrop-blur-2xl sm:px-5">
        <button
          title="Vessel Launcher"
          aria-label="Open Vessel launcher"
          className="grid h-8 w-15 shrink-0 place-items-center rounded-md text-cyan-100 shadow-sm shadow-cyan-950/30 transition hover:bg-cyan-200/22 focus:outline-none focus:ring-2 focus:ring-cyan-200/55"
        >
          <Image
            src="/logo.svg"
            width={100}
            height={100}
            className="h-8"
            alt="VesselSSH"
          />
        </button>

        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5">
          {taskbarApps.map((item) => (
            <button
              key={item.label}
              title={item.label}
              aria-label={item.label}
              aria-current={item.isFocused ? "page" : undefined}
              className={`group relative grid h-8 w-8 place-items-center rounded-md transition hover:bg-cyan-100/12 focus:outline-none focus:ring-2 focus:ring-cyan-200/55 ${
                item.isFocused
                  ? "bg-cyan-100/14 shadow-sm shadow-cyan-950/20"
                  : "bg-transparent"
              }`}
            >
              <i className={`fa-solid ${item.icon} ${item.tone} text-[13px]`} />
              <span
                className={`absolute bottom-0.5 h-0.5 rounded-full bg-cyan-200 transition-all ${
                  item.isFocused
                    ? "w-4 shadow-[0_0_10px_rgba(103,232,249,0.7)]"
                    : item.isActive
                    ? "w-2 opacity-80"
                    : "w-1 opacity-0 group-hover:opacity-60"
                }`}
              />
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 text-cyan-50/88">
          <button
            title="FullScreen"
            aria-label="FullScreen status"
            className="hidden h-8 w-8 place-items-center rounded-md hover:bg-cyan-100/12 sm:grid"
            onClick={() => {
              if (isFullscreen) {
                exitFullscreen();
              } else {
                enterFullscreen();
              }
            }}
          >
            <i className="fa-solid fa-expand"></i>
          </button>
          <button
            title="Audio"
            aria-label="Audio controls"
            className="hidden h-8 w-8 place-items-center rounded-md hover:bg-cyan-100/12 sm:grid"
          >
            <i className="fa-solid fa-volume-high text-xs" />
          </button>
          <button
            title="Power"
            aria-label="Power menu"
            className="hidden h-8 w-8 place-items-center rounded-md hover:bg-cyan-100/12 md:grid"
          >
            <i className="fa-solid fa-power-off text-xs" />
          </button>
          <TaskbarClock currentTime={currentTime} />
        </div>
      </div>
    </footer>
  );
}
