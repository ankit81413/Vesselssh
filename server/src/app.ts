import express from "express";
import cookieParser from "cookie-parser";

import "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.send("Server is working")
})

app.use("/auth", authRoutes);
