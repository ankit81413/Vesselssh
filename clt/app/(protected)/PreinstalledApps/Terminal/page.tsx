"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

export default function TerminalApp() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 15,
      fontFamily: "monospace",
      theme: {
        background: "#000000",
        foreground: "#ffffff",
      },
    });

    terminal.open(terminalRef.current);
    terminal.focus();

    const ws = new WebSocket("ws://localhost:4000/terminal");

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
      console.log("Terminal connected");
    };

    ws.onerror = (error) => {
      console.error("Terminal WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("Terminal disconnected");
    };

    return () => {
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
