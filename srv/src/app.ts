import express from "express";
import cookieParser from "cookie-parser";

import cors from "cors"
import routes from "./routes/index.js"

import "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:48283",
        credentials: true,
    })
);

app.get("/",(req,res)=>{
    res.send("Server is working")
})

app.use("/api",routes)

// app.use("/auth", authRoutes);
