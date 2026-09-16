import { Router } from "express";

import { setup } from "../controllers/auth.controller.js";

const router = Router();

router.post("/setup", setup);

export default router;
