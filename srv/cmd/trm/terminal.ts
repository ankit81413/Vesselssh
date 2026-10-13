import * as pty from "node-pty";
import { WebSocketServer } from "ws";

let wss: WebSocketServer | null = null;

export async function start() {

    // If the server is already running, reuse it
    if (wss) {
        const address = wss.address();

        if (address && typeof address !== "string") {
            return {
                status: "running",
                clt_url: "/PreinstalledApps/Terminal",
                url: `ws://localhost:${address.port}`
            };
        }
    }

    wss = new WebSocketServer({ port: 4000 });

    await new Promise<void>((resolve, reject) => {
        wss!.once("listening", resolve);
        wss!.once("error", reject);
    });

    const address = wss.address();

    if (!address || typeof address === "string") {
        throw new Error("Failed to start terminal WebSocket server");
    }

    const url = `ws://localhost:${address.port}`;

    wss.on("connection", (ws) => {
        const terminal = createTerminal();

        terminal.onData((data) => {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({
                    type: "output",
                    data
                }));
            }
        });

        ws.on("message", (message) => {
            const payload = JSON.parse(message.toString());

            if (payload.type === "input") {
                terminal.write(payload.data);
            }

            if (payload.type === "resize") {
                terminal.resize(payload.cols, payload.rows);
            }
        });

        ws.on("close", () => {
            terminal.kill();
        });
    });

    return {
        status: "running",
        clt_url: "/PreinstalledApps/Terminal",
        url
    };
}

export function createTerminal() {
    const shell = process.platform === "win32"
        ? "powershell.exe"
        : "bash";

    // Remove the backend's PORT variable from the user's shell environment
    const terminalEnv = { ...process.env };
    delete terminalEnv.PORT;

    return pty.spawn(shell, [], {
        name: "xterm-color",
        cols: 80,
        rows: 24,
        cwd: process.env.HOME || process.cwd(),
        env: terminalEnv as Record<string, string>,
    });
}