
import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useAppStore } from "../../store/appStore";

export default function TerminalDock() {
  const addApp = useAppStore((state) => state.addApp);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [showTerminalPerview, setShowTerminalPerview] =
    useState(false);
  const [previewWidth, setPreviewWidth] = useState(0);
  const [previewHeight, setPreviewHeight] = useState(0);

  const updatePreview = (e: PointerEvent<HTMLDivElement>) => {
    setPreviewHeight(Math.max(0, e.clientY - 8));
    setPreviewWidth(Math.max(0, e.clientX - 8));
  };

  const startTerminalRelase = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !e.isPrimary) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
    updatePreview(e);
    setShowTerminalPerview(true);
  };

  const stopTerminalRelase = (e: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (e.type === "pointerup" && start && Math.hypot(e.clientX - start.x, e.clientY - start.y) >= 5) {
      const width = Math.max(0, e.clientX - 8);
      const height = Math.max(0, e.clientY - 8);
      // AppWindow is centered in the viewport above the 3rem taskbar.
      const taskbarHeight = 3 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      const desktopHeight = window.innerHeight - taskbarHeight;
      if (width >= 32 && height >= 32) {
        addApp({
          id: crypto.randomUUID(),
          appId: "Terminal",
          name: "Terminal",
          icon: "fa-solid fa-terminal",
          status: "running",
          initialBounds: {
            width,
            height,
            x: 8 + width / 2 - window.innerWidth / 2,
            y: 8 + height / 2 - desktopHeight / 2,
          },
        });
      }
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setShowTerminalPerview(false);
  };

  return (
    <>
      <div
        className="h-6 w-25 absolute z-21 m-[5px] touch-none select-none"
        onPointerDown={startTerminalRelase}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) updatePreview(e);
        }}
        onPointerUp={stopTerminalRelase}
        onPointerCancel={stopTerminalRelase}
        onLostPointerCapture={() => {
          dragStart.current = null;
          setShowTerminalPerview(false);
        }}
      >
        <div className="bg-black/30 w-full h-full rounded-xl flex justify-center items-center cursor-pointer hover:bg-black">
          <p className="text-sm mb-1 text-white/50 hover:text-white">
            &gt;_ Terminal
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{ width: previewWidth, height: previewHeight, top: 8, left: 8 }}
        className={`terminalPreview pointer-events-none fixed z-22 bg-black/50 rounded-xl border-2 border-dashed ${
          showTerminalPerview ? "flex" : "hidden"
        }`}
      />
    </>
  );
}
