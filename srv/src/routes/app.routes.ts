import { Router } from "express";
import { openApp , closeApp } from "../controllers/app.controller.js";


const router = Router()

router.get("/:appid",openApp)
router.post("/:appid/close",closeApp)

export default router;
