import { create } from "zustand";

export type AppInstance = {
  id: string;
  appId: string;
  name: string;
  icon: string;
  color:string;
  status: "running" | "stopped" | "error";
  isMinimized?: boolean;
  initialBounds?: { width: number; height: number; x: number; y: number };
};

type AppState = {
  apps: AppInstance[];
  focusedAppId: string | null;
  minimizeApp: (id: string) => void;
  restoreApp: (id: string) => void;

  addApp: (app: AppInstance) => void;
  removeApp: (id: string) => void;
  updateAppStatus: (
    id: string,
    status: AppInstance["status"]
  ) => void;
};

export const useAppStore = create<AppState>((set) => ({
  apps: [],
  focusedAppId: null,

  addApp: (app) => {
    set((state) => ({
      apps: [...state.apps, app],
      focusedAppId: app.status === "running" && !app.isMinimized ? app.id : state.focusedAppId,
    }))
  },

  removeApp: (id) =>
    set((state) => ({
      apps: state.apps.filter((app) => app.id !== id),
      focusedAppId: state.focusedAppId === id
        ? [...state.apps].reverse().find((app) => app.id !== id && app.status === "running" && !app.isMinimized)?.id ?? null
        : state.focusedAppId,
    })),

  minimizeApp: (id) =>
    set((state) => ({
      apps: state.apps.map((app) => app.id === id ? { ...app, isMinimized: true } : app),
      focusedAppId: state.focusedAppId === id
        ? [...state.apps].reverse().find((app) => app.id !== id && app.status === "running" && !app.isMinimized)?.id ?? null
        : state.focusedAppId,
    })),

  restoreApp: (id) =>
    set((state) => {
      const target = state.apps.find((app) => app.id === id && app.status === "running");
      if (!target || (state.focusedAppId === id && !target.isMinimized)) return state;
      return {
        apps: state.apps.map((app) => app.id === id ? { ...app, isMinimized: false } : app),
        focusedAppId: id,
      };
    }),

  updateAppStatus: (id, status) =>
    set((state) => ({
      apps: state.apps.map((app) =>
        app.id === id ? { ...app, status } : app
      ),
      focusedAppId: state.focusedAppId === id && status !== "running"
        ? [...state.apps].reverse().find((app) => app.id !== id && app.status === "running" && !app.isMinimized)?.id ?? null
        : state.focusedAppId,
    })),
}));
