import { Router } from "express";
import { openApp } from "../controllers/app.controller.js";


const router = Router()

router.get("/:appid",openApp)

export default router;
