"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";

type ResizeGeometry = { width: number; height: number; x: number; y: number };

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

function keepHeaderVisible(position: { x: number; y: number }, frame: HTMLDivElement | null, width?: number, height?: number) {
  const desktop = frame?.parentElement;
  if (!frame || !desktop) return position;
  const bounds = frame.getBoundingClientRect();
  const windowWidth = width ?? bounds.width;
  const windowHeight = height ?? bounds.height;
  const visibleWidth = Math.min(200, windowWidth, desktop.clientWidth);
  const headerHeight = Math.min(frame.querySelector("header")?.getBoundingClientRect().height ?? 32, desktop.clientHeight);
  const maxX = (desktop.clientWidth + windowWidth) / 2 - visibleWidth;
  const minY = (windowHeight - desktop.clientHeight) / 2;
  const maxY = (windowHeight + desktop.clientHeight) / 2 - headerHeight;
  return {
    x: Math.max(-maxX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y)),
  };
}

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

  const [WindowWidth, setWindowWidth] = useState(initialWidth)
  const [WindowHeight, setWindowHeight] = useState(initialHeight)

  const [resizeX, setResizeX] = useState(false)
  const [resizeY, setResizeY] = useState(false)

  const [resizePreview, setResizePreview] = useState<ResizeGeometry | null>(null);
  const resizeDraft = useRef<ResizeGeometry | null>(null);
  const resizeAnimation = useRef<number | null>(null);
  const resizeSession = useRef<{
    pointerId: number;
    start: ResizeGeometry;
    pointerX: number;
    pointerY: number;
    desktopWidth: number;
    desktopHeight: number;
    headerHeight: number;
  } | null>(null);
  const preview = resizePreview ?? { width: WindowWidth, height: WindowHeight, ...position };

  useEffect(() => () => {
    if (resizeAnimation.current !== null) cancelAnimationFrame(resizeAnimation.current);
  }, []);

  const showLightPreview = dragging || resizeX || resizeY;
  // Window resize safty function
  useEffect(() => {
    const keepVisible = () => {
      setPosition((current) => {
        const next = keepHeaderVisible(current, frame.current);
        return next.x === current.x && next.y === current.y ? current : next;
      });
    };
    const observer = new ResizeObserver(keepVisible);
    if (frame.current) observer.observe(frame.current);
    if (frame.current?.parentElement) observer.observe(frame.current.parentElement);
    window.addEventListener("resize", keepVisible);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", keepVisible);
    };
  }, []);


  // Drag Debounce
  useEffect(() => {
    setTimeout(() => {
      setNoDrag(false)
    }, 200);

  }, [noDrag])


  // Drag Functionality
  function startDrag(event: PointerEvent<HTMLElement>) {
    setTimeout(() => {
      setNoDrag(false)
    }, 500);
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
    const next = keepHeaderVisible({
      x: resizeY ? position.x : start.left + event.clientX - start.x,
      y: resizeX ? position.y : start.top + event.clientY - start.y,
    }, frame.current);
    setPosition({
      // x: Math.max(-maxX, Math.min(maxX, start.left + event.clientX - start.x)),
      // x:position.x,
      // y: Math.max(-50, Math.min(maxY, start.top + event.clientY - start.y)),
      // y: position.y,
      x: next.x,
      y: next.y
    });
  }

  function stopDrag() {
    setNoDrag(true)
    drag.current = null;
    setDragging(false);
  }

  // Resize Functionality
  // == Right Reesize Functionality

  // const [RightResizeFlag, setRightResizeFlag] = useState(false)
    // startDrag(event);
    // setRightResizeFlag(true)
    // if (!RightResizeFlag) return
    // moveDrag(event)
    // setRightResizeFlag(false)
    // stopDrag();
  // == Left Resize Functionality
  // const [RightResizeFlag, setRightResizeFlag] = useState(false)
  // const PointerDownPos = useRef({
  //   StartWindowWidth: initialWidth,
  //   x: 0,
  //   y: 0
  // })
    // setRightResizeFlag(true)
    // if (!RightResizeFlag) return
    // setRightResizeFlag(false)
  // == Top Resize Functionality
  // const [RightResizeFlag, setRightResizeFlag] = useState(false)
  // const PointerDownPos = useRef({
  //   StartWindowWidth: initialWidth,
  //   x: 0,
  //   y: 0
  // })
    // console.log(PointerDownPos.current);
    // setRightResizeFlag(true)
    // if (!RightResizeFlag) return
    // setRightResizeFlag(false)
  const beginResize = (event: PointerEvent<HTMLElement>, horizontal: boolean, vertical: boolean) => {
    if (maximized || dragging || resizeSession.current || event.button !== 0) return;
    const element = frame.current;
    const desktop = element?.parentElement;
    if (!element || !desktop) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const bounds = element.getBoundingClientRect();
    const start = { width: bounds.width, height: bounds.height, ...position };
    resizeSession.current = {
      pointerId: event.pointerId,
      start,
      pointerX: event.clientX,
      pointerY: event.clientY,
      desktopWidth: desktop.clientWidth,
      desktopHeight: desktop.clientHeight,
      headerHeight: element.querySelector("header")?.getBoundingClientRect().height ?? 32,
    };
    resizeDraft.current = start;
    setResizePreview(start);
    setResizeX(horizontal);
    setResizeY(vertical);
  }

  const updateResize = (event: PointerEvent<HTMLElement>, horizontal: -1 | 0 | 1, vertical: -1 | 0 | 1) => {
    const session = resizeSession.current;
    if (!session || session.pointerId !== event.pointerId || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const { start, desktopWidth, desktopHeight, headerHeight } = session;
    const maxWidth = Math.max(0, Math.min(desktopWidth + 400, desktopWidth / 2 - horizontal * start.x + start.width / 2 + 200));
    const maxHeight = Math.max(0, Math.min(desktopHeight + 100, desktopHeight / 2 - vertical * start.y + start.height / 2 + (vertical === -1 ? 0 : 100)));
    const width = horizontal ? Math.max(Math.min(320, maxWidth), Math.min(maxWidth, start.width + horizontal * (event.clientX - session.pointerX))) : start.width;
    const height = vertical ? Math.max(Math.min(320, maxHeight), Math.min(maxHeight, start.height + vertical * (event.clientY - session.pointerY))) : start.height;
    const maxX = (desktopWidth + width) / 2 - Math.min(200, width, desktopWidth);
    const minY = (height - desktopHeight) / 2;
    const maxY = (height + desktopHeight) / 2 - Math.min(headerHeight, desktopHeight);
    resizeDraft.current = {
      width,
      height,
      x: Math.max(-maxX, Math.min(maxX, start.x + horizontal * (width - start.width) / 2)),
      y: Math.max(minY, Math.min(maxY, start.y + vertical * (height - start.height) / 2)),
    };
    if (resizeAnimation.current === null) {
      resizeAnimation.current = requestAnimationFrame(() => {
        resizeAnimation.current = null;
        setResizePreview(resizeDraft.current);
      });
    }
  }

  const finishResize = () => {
    if (!resizeSession.current) return;
    if (resizeAnimation.current !== null) {
      cancelAnimationFrame(resizeAnimation.current);
      resizeAnimation.current = null;
    }
    const final = resizeDraft.current;
    resizeSession.current = null;
    resizeDraft.current = null;
    if (final) {
      setWindowWidth(final.width);
      setWindowHeight(final.height);
      setPosition(keepHeaderVisible({ x: final.x, y: final.y }, frame.current, final.width, final.height));
    }
    setResizePreview(null);
    setResizeX(false);
    setResizeY(false);
  }

  const startRightResize = (event: PointerEvent<HTMLElement>) => beginResize(event, true, false);
  const RightResize = (event: PointerEvent<HTMLElement>) => updateResize(event, 1, 0);
  const stopRightResize = finishResize;

  const startLeftResize = (event: PointerEvent<HTMLElement>) => beginResize(event, true, false);
  const LeftResize = (event: PointerEvent<HTMLElement>) => updateResize(event, -1, 0);
  const stopLeftResize = finishResize;

  const startTopResize = (event: PointerEvent<HTMLElement>) => beginResize(event, false, true);
  const TopResize = (event: PointerEvent<HTMLElement>) => updateResize(event, 0, -1);
  const stopTopResize = finishResize;

  const startBottomResize = (event: PointerEvent<HTMLElement>) => beginResize(event, false, true);
  const BottomResize = (event: PointerEvent<HTMLElement>) => updateResize(event, 0, 1);
  const stopBottomResize = finishResize;

  const startCornerResize = (event: PointerEvent<HTMLElement>) => beginResize(event, true, true);
  const resizeCorner = (event: PointerEvent<HTMLElement>, horizontal: -1 | 1, vertical: -1 | 1) => updateResize(event, horizontal, vertical);
  const stopCornerResize = finishResize;
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 bottom-12 z-30 flex items-center justify-center">
        <div className={`appWindowMoveBorder absolute pointer-events-none flex-col justify-center items-center overflow-hidden  text-white ${maximized ? "absolute top-0 h-full w-full rounded-none" : "rounded-xl shadow-sm"} border border-dashed border-2 bg-black/90 ${showLightPreview ? "flex" : "hidden"}`}
          style={
            maximized
              ? undefined
              : {
                width: preview.width,
                height: preview.height,
                maxWidth: "calc(100% + 400px)",
                maxHeight: "calc(100% + 100px)",
                transform: `translate(${preview.x}px, ${preview.y}px)`,
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
        <div aria-hidden="true" className={`appWindowResizers pointer-events-none absolute z-10 ${maximized ? "hidden" : "flex flex-col"}`}
          style={
            maximized
              ? undefined
              : {
                width: preview.width,
                height: preview.height,
                maxWidth: "calc(100% + 400px)",
                maxHeight: "calc(100% + 100px)",
                transform: `translate(${preview.x}px, ${preview.y}px)`,
              }
          }>


          <div className="appWindowLeftResizer pointer-events-auto touch-none absolute top-0 -left-1 h-full w-2 cursor-ew-resize rounded-full bg-transparent transition-colors duration-150 hover:bg-cyan-300/40"
            onPointerDown={startLeftResize}
            onPointerUp={stopLeftResize}
            onPointerMove={LeftResize}
            onPointerCancel={stopLeftResize}
            onLostPointerCapture={stopLeftResize}
          ></div>
          <div className="appWindowRightResizer pointer-events-auto touch-none absolute top-0 -right-1 h-full w-2 cursor-ew-resize rounded-full bg-transparent transition-colors duration-150 hover:bg-cyan-300/40"
            onPointerDown={startRightResize}
            onPointerUp={stopRightResize}
            onPointerMove={RightResize}
            onPointerCancel={stopRightResize}
            onLostPointerCapture={stopRightResize}></div>
          <div className="appWindowTopResizer pointer-events-auto touch-none absolute -top-1 left-0 h-2 w-full cursor-ns-resize rounded-full bg-transparent transition-colors duration-150 hover:bg-cyan-300/40"
            onPointerDown={startTopResize}
            onPointerUp={stopTopResize}
            onPointerMove={TopResize}
            onPointerCancel={stopTopResize}
            onLostPointerCapture={stopTopResize}
          ></div>
          <div className="appWindowBottomResizer pointer-events-auto touch-none absolute -bottom-1 left-0 h-2 w-full cursor-ns-resize rounded-full bg-transparent transition-colors duration-150 hover:bg-cyan-300/40"
            onPointerDown={startBottomResize}
            onPointerUp={stopBottomResize}
            onPointerMove={BottomResize}
            onPointerCancel={stopBottomResize}
            onLostPointerCapture={stopBottomResize}
          ></div>

          <div className="appWindowTopLeftResizer pointer-events-auto touch-none absolute z-20 -top-1 -left-1 h-3 w-3 cursor-nwse-resize rounded-full bg-transparent transition-colors duration-150 hover:bg-cyan-300/40"
            onPointerDown={startCornerResize}
            onPointerMove={(event) => resizeCorner(event, -1, -1)}
            onPointerUp={stopCornerResize}
            onPointerCancel={stopCornerResize}
            onLostPointerCapture={stopCornerResize}
          ></div>
          <div className="appWindowTopRightResizer pointer-events-auto touch-none absolute z-20 -top-1 -right-1 h-3 w-3 cursor-nesw-resize rounded-full bg-transparent transition-colors duration-150 hover:bg-cyan-300/40"
            onPointerDown={startCornerResize}
            onPointerMove={(event) => resizeCorner(event, 1, -1)}
            onPointerUp={stopCornerResize}
            onPointerCancel={stopCornerResize}
            onLostPointerCapture={stopCornerResize}
          ></div>
          <div className="appWindowBottomLeftResizer pointer-events-auto touch-none absolute z-20 -bottom-1 -left-1 h-3 w-3 cursor-nesw-resize rounded-full bg-transparent transition-colors duration-150 hover:bg-cyan-300/40"
            onPointerDown={startCornerResize}
            onPointerMove={(event) => resizeCorner(event, -1, 1)}
            onPointerUp={stopCornerResize}
            onPointerCancel={stopCornerResize}
            onLostPointerCapture={stopCornerResize}
          ></div>
          <div className="appWindowBottomRightResizer pointer-events-auto touch-none absolute z-20 -bottom-1 -right-1 h-3 w-3 cursor-nwse-resize rounded-full bg-transparent transition-colors duration-150 hover:bg-cyan-300/40"
            onPointerDown={startCornerResize}
            onPointerMove={(event) => resizeCorner(event, 1, 1)}
            onPointerUp={stopCornerResize}
            onPointerCancel={stopCornerResize}
            onLostPointerCapture={stopCornerResize}
          ></div>

        </div>

        <div
          ref={frame}
          role="dialog"
          className={`pointer-events-auto flex shrink-0 flex-col overflow-hidden  text-white ${maximized ? "absolute top-0 h-full w-full rounded-none" : "rounded-xl shadow-sm"} ${showLightPreview ? "opacity-0" : ""}`}
          style={
            maximized
              ? undefined
              : {
                width: WindowWidth,
                height: WindowHeight,
                maxWidth: "calc(100% + 400px)",
                maxHeight: "calc(100% + 100px)",
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
              {maximized ? <div className="termianlDockSpace h-6 w-25"></div> : ""}
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
                className={`h-full w-full border-0 ${showLightPreview ? "pointer-events-none" : ""}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
              {showLightPreview && <div className="absolute inset-0" aria-hidden="true" />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
