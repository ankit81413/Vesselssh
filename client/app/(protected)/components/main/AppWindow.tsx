"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";

type AppWindowProps = {
  title: string;
  src: string;
  icon?: ReactNode;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
};

const controlClass =
  "grid h-8 w-9 shrink-0 place-items-center text-white/60 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:cursor-default disabled:text-white/25 disabled:hover:bg-transparent";

export default function AppWindow({
  title,
  src,
  icon,
  onClose,
  initialWidth = 860,
  initialHeight = 540,
}: AppWindowProps) {
  const titleId = useId();
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [maximized, setMaximized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [noDrag, setNoDrag] = useState(false)

  useEffect(() => {
    const keepVisible = () => {
      const bounds = frame.current?.getBoundingClientRect();
      if (!bounds) return;
      const maxX = Math.max(0, (window.innerWidth - bounds.width) / 2 - 12);
      const maxY = Math.max(0, (window.innerHeight - 108 - bounds.height) / 2);
      setPosition((current) => ({
        x: Math.max(-maxX, Math.min(maxX, current.x)),
        y: Math.max(-maxY, Math.min(maxY, current.y)),
      }));
    };
    window.addEventListener("resize", keepVisible);
    return () => window.removeEventListener("resize", keepVisible);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setNoDrag(false)
    }, 200);

  }, [noDrag])

  function startDrag(event: PointerEvent<HTMLElement>) {
    setTimeout(() => {
      setNoDrag(false)
    }, 5000);
    if (
      maximized ||
      event.button !== 0 ||
      (event.target as HTMLElement).closest("button") ||
      (event.target as HTMLElement).closest("a") || noDrag
    )
      return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: position.x,
      top: position.y,
    };
    setDragging(true);
  }

  function moveDrag(event: PointerEvent<HTMLElement>) {
    const start = drag.current;
    const bounds = frame.current?.getBoundingClientRect();
    if (!start || start.pointerId !== event.pointerId || !bounds) return;
    const maxX = Math.max(0, (window.innerWidth + 300 - bounds.width) / 2 - 12);
    const maxY = Math.max(0, (window.innerHeight + 450 - bounds.height) / 2);
    setPosition({
      x: Math.max(-maxX, Math.min(maxX, start.left + event.clientX - start.x)),
      y: Math.max(-50, Math.min(maxY, start.top + event.clientY - start.y)),
    });
  }

  function stopDrag() {
    setNoDrag(true)
    drag.current = null;
    setDragging(false);
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 bottom-12 z-30 flex items-center justify-center">
        <div className={`appWindowMoveBorder absolute pointer-events-auto flex-col justify-center items-center overflow-hidden  text-white ${maximized ? "absolute top-0 h-full w-full rounded-none" : "rounded-xl shadow-sm"} border border-dashed border-2 bg-black/90 ${dragging ? "flex" : "hidden"}`}
          style={
            maximized
              ? undefined
              : {
                width: initialWidth,
                height: initialHeight,
                maxWidth: "100%",
                maxHeight: "100%",
                transform: `translate(${position.x}px, ${position.y}px)`,
              }
          }>

          <span
            aria-hidden="true"
            className="flex shrink-0 items-center text-cyan-200"
          >
            <div className="AppWindowimageContainer overflow-hidden rounded rounded-xl">

              <Image src="/yt.png" alt="App" width={100} height={100} />
            </div>
          </span>


        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-0 bottom-12 z-30 flex items-center justify-center">
        <div
          ref={frame}
          role="dialog"
          aria-labelledby={titleId}
          className={`pointer-events-auto flex flex-col overflow-hidden  text-white ${maximized ? "absolute top-0 h-full w-full rounded-none" : "rounded-xl shadow-sm"} ${dragging ? "hidden" : "flex"}`}
          style={
            maximized
              ? undefined
              : {
                width: initialWidth,
                height: initialHeight,
                maxWidth: "100%",
                maxHeight: "100%",
                transform: `translate(${position.x}px, ${position.y}px)`,
              }
          }
        >
          <div className="w-full h-full flex flex-col border border-white/15 bg-[#11151e]">
            <header
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              onLostPointerCapture={stopDrag}
              onDoubleClick={(event) => {
                if (!(event.target as HTMLElement).closest("button"))
                  setMaximized((value) => !value);
              }}
              className={`flex h-8 shrink-0 touch-none select-none items-center gap-3 border-b border-white/8 bg-[#11151e] px-3 ${maximized ? "" : dragging ? "cursor-grabbing" : "cursor-grab"}`}
            >
              <span
                aria-hidden="true"
                className="flex shrink-0 items-center text-cyan-200"
              >
                {icon ?? <i className="fa-regular fa-window-maximize text-[13px] h-2 w-2" />}
              </span>
              <h2
                id={titleId}
                className="min-w-0 flex-1 truncate text-[13px] font-medium tracking-wide text-white/85"
              >
                {title}
              </h2>
              <div className="flex items-center gap-1">
                <a

                  href={src}
                  target="_blank"
                  aria-label="Open in new tab"
                  title="Open in new tab"
                  className={controlClass}
                >
                  <i
                    aria-hidden="true"
                    className="fa-solid fa-arrow-up-right-from-square text-xs"
                  />
                </a>
                <span className="mx-1 h-4 w-px bg-white/10" />
                <button
                  type="button"
                  disabled
                  aria-label="Minimize (coming soon)"
                  title="Minimize (coming soon)"
                  className={controlClass}
                >
                  <i aria-hidden="true" className="fa-solid fa-minus text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => setMaximized((value) => !value)}
                  aria-label={maximized ? "Restore window" : "Fullscreen"}
                  title={maximized ? "Restore window" : "Fullscreen"}
                  aria-pressed={maximized}
                  className={controlClass}
                >
                  <i
                    aria-hidden="true"
                    className={`fa-solid ${maximized ? "fa-compress" : "fa-expand"} text-xs`}
                  />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={`Close ${title}`}
                  title="Close"
                  className={`${controlClass} hover:bg-red-500/80`}
                >
                  <i aria-hidden="true" className="fa-solid fa-xmark text-sm" />
                </button>
              </div>
            </header>
            <div className="relative min-h-0 flex-1 bg-black">
              <iframe
                key={src}
                src={src}
                title={title}
                className={`h-full w-full border-0 ${dragging ? "pointer-events-none" : ""}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
              {dragging && <div className="absolute inset-0" aria-hidden="true" />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
