import { Router } from "express";
import authRouter from "./auth.routes.js"
import appRouter from "./app.routes.js"
const router = Router();

router.use("/auth", authRouter);
router.use("/openApp", appRouter)



export default router;
