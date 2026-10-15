import { create } from "zustand";

export type TaskbarAppType = {
    appId: string;
    label: string;
    icon: string;
    pinned: boolean;
    isActive: boolean;
    isFocused: boolean;
    tone: string;
  };
  
  type TaskbarAppState = {
    taskbarApps: TaskbarAppType[];
    setAppActive: (appId: string, isActive: boolean) => void;
    setAppFocused: (appId: string, isFocused: boolean) => void;
  };

export const useTaskbarAppStore = create<TaskbarAppState>((set) => {
  const taskbarApps = [
    {
      appId: "Terminal",
      label: "Terminal",
      icon: "fa-solid fa-terminal",
      pinned: true,
      isActive: false,
      isFocused: false,
      tone: "text-emerald-200",
    },
    {
      appId: "Files",
      label: "Files",
      icon: "fa-solid fa-folder-open",
      pinned: true,
      isActive: false,
      isFocused: false,
      tone: "text-sky-100",
    },
    {
      appId: "Browser",
      label: "Browser",
      icon: "fa-solid fa-globe",
      pinned: true,
      isActive: false,
      isFocused: false,
      tone: "text-cyan-100",
    },
    {
      appId: "Monitor",
      label: "Monitor",
      icon: "fa-solid fa-chart-simple",
      pinned: true,
      isActive: false,
      isFocused: false,
      tone: "text-cyan-200",
    },
    {
      appId: "Settings",
      label: "Settings",
      icon: "fa-solid fa-gear",
      pinned: true,
      isActive: false,
      isFocused: false,
      tone: "text-zinc-100",
    },
  ];

  return {
    taskbarApps,

    setAppActive: (appId, isActive) =>
      set((state) => ({
        taskbarApps: state.taskbarApps.map((app) =>
          app.appId === appId ? { ...app, isActive } : app
        ),
      })),

    setAppFocused: (appId, isFocused) =>
      set((state) => ({
        taskbarApps: state.taskbarApps.map((app) =>
          app.appId === appId ? { ...app, isFocused } : app
        ),
      })),
  };
});
