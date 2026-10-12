import { create } from "zustand";

export type TaskbarAppType = {
    appId: string;
    label: string;
    icon: string;
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
      icon: "fa-terminal",
      isActive: false,
      isFocused: false,
      tone: "text-emerald-200",
    },
    {
      appId: "Files",
      label: "Files",
      icon: "fa-folder-open",
      isActive: false,
      isFocused: false,
      tone: "text-sky-100",
    },
    {
      appId: "Browser",
      label: "Browser",
      icon: "fa-globe",
      isActive: false,
      isFocused: false,
      tone: "text-cyan-100",
    },
    {
      appId: "Monitor",
      label: "Monitor",
      icon: "fa-chart-simple",
      isActive: false,
      isFocused: false,
      tone: "text-cyan-200",
    },
    {
      appId: "Settings",
      label: "Settings",
      icon: "fa-gear",
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