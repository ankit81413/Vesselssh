import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

export function createWebSocketServer(server: Server) {
    const wss = new WebSocketServer({
        server,
        path: "/ws",
    });

    wss.on("connection", (ws: WebSocket) => {
        console.log("WebSocket connected");

        ws.on("message", (message) => {
            console.log("WebSocket message:", message.toString());
        });

        ws.on("close", () => {
            console.log("WebSocket disconnected");
        });

        ws.on("error", (error) => {
            console.error("WebSocket error:", error);
        });
    });

    return wss;
}