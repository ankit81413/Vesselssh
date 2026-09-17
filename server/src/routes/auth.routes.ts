import { Router } from "express";

import { setup,login,checkAdmin } from "../controllers/auth.controller.js";

const router = Router();

router.get("/",(req,res)=>{
    res.send("auth route got")
})
router.post("/setup", setup);
router.post("/login",login)
router.get("/checkadmin",checkAdmin)


export default router;
