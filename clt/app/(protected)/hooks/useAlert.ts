"use client";

import { create } from "zustand";

export type AlertOptions = {
  title: string;
  heading: string;
  text: string;
  albuttons?: string[];
  okAction?: () => void;
};

type AlertState = {
  alert: AlertOptions | null;
  showAlert: (options: AlertOptions) => void;
  closeAlert: () => void;
};

export const useAlert = create<AlertState>((set) => ({
  alert: null,
  showAlert: (options) => set({ alert: { ...options } }),
  closeAlert: () => set({ alert: null }),
}));

export default useAlert;
