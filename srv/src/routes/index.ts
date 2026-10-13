import { Router } from "express";
import authRouter from "./auth.routes.js"
import appRouter from "./app.routes.js"
import trm from "./trm.router.js";
const router = Router();

router.use("/auth", authRouter);
router.use("/openApp", appRouter)
router.use("/trm",trm)




export default router;
