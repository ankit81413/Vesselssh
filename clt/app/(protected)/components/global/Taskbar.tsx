import { useFullscreen } from "@/app/(protected)/hooks/useFullscreen";
import Image from "next/image";
import TaskbarClock from "./TaskbarClock";
import { memo, useMemo } from "react";
import { useAppStore } from "../../store/appStore";
import { useTaskbarAppStore } from "../../store/taskBarApps";

type TaskbarProps = {
  currentTime: Date | null;
};



function Taskbar({ currentTime }: TaskbarProps) {
  const { enterFullscreen, exitFullscreen, isFullscreen } = useFullscreen();
  const apps = useAppStore((s) => s.apps);
  const focusedInstanceId = useAppStore((s) => s.focusedAppId);
  const restoreApp = useAppStore((s) => s.restoreApp);
  const minimizeApp = useAppStore((s) => s.minimizeApp);
  const pinnedApps = useTaskbarAppStore((s) => s.taskbarApps);

  const taskbarApps = useMemo(() => {
    const runningApps = apps.filter((app) => app.status === "running");
    const activeAppIds = new Set(runningApps.map((app) => app.appId));
    const focusedAppId = runningApps.find(
      (app) => app.id === focusedInstanceId && !app.isMinimized
    )?.appId;
    const pinnedAppIds = new Set(pinnedApps.filter((app) => app.pinned).map((app) => app.appId));
    const unpinnedRunningApps = runningApps.filter(
      (app, index) =>
        !pinnedAppIds.has(app.appId) &&
        runningApps.findIndex((candidate) => candidate.appId === app.appId) === index
    );

    return [
      ...pinnedApps.map((app) => ({
        ...app,
        isActive: activeAppIds.has(app.appId),
        isFocused: app.appId === focusedAppId,
      })),
      ...unpinnedRunningApps.map((app) => ({
        appId: app.appId,
        label: app.name,
        icon: app.icon,
        pinned: false,
        isActive: true,
        isFocused: app.appId === focusedAppId,
        tone: "text-cyan-100",
      })),
    ];
  }, [apps, focusedInstanceId, pinnedApps]);
  

  return (
    <footer className="absolute inset-x-0 bottom-0 z-20">
      <div className="flex h-12 w-full items-center justify-between border-t border-cyan-100/18 bg-slate-950/46 px-3 text-cyan-50 shadow-[0_-14px_42px_rgba(2,8,23,0.36)] sm:px-5">
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
              onClick={() => {
                const instances = apps.filter((app) => app.appId === item.appId && app.status === "running");
                const focusedInstance = instances.find(
                  (app) => app.id === focusedInstanceId && !app.isMinimized
                );
                if (focusedInstance) {
                  minimizeApp(focusedInstance.id);
                  return;
                }

                const target = instances.find((app) => app.isMinimized)
                  ?? instances[instances.length - 1];
                if (target) restoreApp(target.id);
              }}
              className={`group relative grid h-8 w-8 place-items-center rounded-md transition hover:bg-cyan-100/12 focus:outline-none focus:ring-2 focus:ring-cyan-200/55 ${item.isFocused
                ? "bg-cyan-100/14 shadow-sm shadow-cyan-950/20"
                : "bg-transparent"
                }`}
            >
              <i className={`${item.icon} ${item.tone} text-[13px]`} />
              <span
                className={`absolute bottom-0.5 h-0.5 rounded-full bg-cyan-200 transition-all ${item.isFocused
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


export default memo(Taskbar)
