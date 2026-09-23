import { Router } from "express";

import { setup,login,checkAdmin, verifySession, logout } from "../controllers/auth.controller.js";

const router = Router();

router.get("/",(req,res)=>{
    res.send("auth route got")
})
router.post("/setup", setup);
router.post("/login",login);
router.post("/logout", logout);
router.post("/verifySession",verifySession)
router.get("/checkadmin",checkAdmin)


export default router;
