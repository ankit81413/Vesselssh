import { create } from "zustand";

type AppInstance = {
  id: string;
  appId: string;
  name: string;
  icon: string
  status: "running" | "stopped" | "error";
};

type AppState = {
  apps: AppInstance[];

  addApp: (app: AppInstance) => void;
  removeApp: (id: string) => void;
  updateAppStatus: (
    id: string,
    status: AppInstance["status"]
  ) => void;
};

export const useAppStore = create<AppState>((set) => ({
  apps: [],

  addApp: (app) => {
    set((state) => ({
      apps: [...state.apps, app],
    }))
  },

  removeApp: (id) =>
    set((state) => ({
      apps: state.apps.filter((app) => app.id !== id),
    })),

  updateAppStatus: (id, status) =>
    set((state) => ({
      apps: state.apps.map((app) =>
        app.id === id ? { ...app, status } : app
      ),
    })),
}));