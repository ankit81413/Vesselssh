import "dotenv/config";
import { createServer } from "node:http";
import { createWebSocketServer } from "./realtime/websocket.js";

import { app } from "./app.js";

const server = createServer(app);

const PORT = Number(process.env.PORT) || 48273;

createWebSocketServer(server)

server.listen(PORT, () => {
    console.log(`Vessel API running on port ${PORT}`);
});
