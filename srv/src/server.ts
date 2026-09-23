import "dotenv/config";
import { createServer } from "node:http";

import { app } from "./app.js";

const httpServer = createServer(app);

const PORT = 48273;

httpServer.listen(PORT, () => {
    console.log(`Vessel API running on port ${PORT}`);
});
