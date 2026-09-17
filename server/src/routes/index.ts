import { Router } from "express";

import { setup } from "../controllers/auth.controller.js";
import { app } from "../app.js";
import authRouter from "./auth.routes.js"

const router = Router();

router.use("/auth", authRouter);



export default router;
