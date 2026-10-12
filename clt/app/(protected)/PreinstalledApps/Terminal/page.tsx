"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export default function TerminalApp() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = terminalRef.current;
    if (!container) return;

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 15,
      fontFamily: "monospace",
      theme: {
        background: "#000000",
        foreground: "#ffffff",
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(container);
    terminal.focus();

    const ws = new WebSocket("ws://localhost:4000/terminal");
    let resizeFrame: number | null = null;
    let disposed = false;
    let lastSize = "";

    const fitTerminal = () => {
      if (disposed || container.clientWidth <= 0 || container.clientHeight <= 0) return;
      fitAddon.fit();
      const { cols, rows } = terminal;
      const size = `${cols}:${rows}`;
      if (ws.readyState === WebSocket.OPEN && size !== lastSize) {
        ws.send(JSON.stringify({ type: "resize", cols, rows }));
        lastSize = size;
      }
    };

    const scheduleFit = () => {
      if (disposed || resizeFrame !== null) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        fitTerminal();
      });
    };

    const resizeObserver = new ResizeObserver(scheduleFit);
    resizeObserver.observe(container);
    window.addEventListener("resize", scheduleFit);
    void document.fonts.ready.then(scheduleFit);
    scheduleFit();

    // Backend → xterm
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "output") {
        terminal.write(message.data);
      }
    };

    // xterm → backend
    const inputDisposable = terminal.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "input",
            data,
          })
        );
      }
    });

    ws.onopen = () => {
      fitTerminal();
      console.log("Terminal connected");
    };

    ws.onerror = (error) => {
      console.error("Terminal WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("Terminal disconnected");
    };

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleFit);
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      inputDisposable.dispose();
      ws.close();
      terminal.dispose();
    };
  }, []);

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
      }}
    >
      <div
        ref={terminalRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </main>
  );
}
