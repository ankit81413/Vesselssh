import { Request, Response } from "express";
import { createSuperUser, loginUser, verifySessionServ } from "../services/auth.services.js";
import db from "../config/db.js";





export function setup(req: Request, res: Response) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const result = createSuperUser(
            username,
            password
        );

        res.cookie(
            "vessel_session",
            result.session.sessionId,
            {
                httpOnly: true,
                secure: process.env.COOKIE_SECURE === "true",
                sameSite: "lax",
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
        );

        return res.status(201).json({
            user: result.user
        });

    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "SETUP_COMPLETED"
        ) {
            return res.status(409).json({
                message: "Vessel setup has already been completed"
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


export function checkAdmin(req: Request, res: Response) {
    const existingAdmin = db
        .prepare("SELECT id FROM users WHERE role = ? LIMIT 1")
        .get("SUPERADMIN");

    res.status(200).json({
        msg: "success",
        data: {
            hasAdmin: !!existingAdmin
        }
    });
}

export function login(req: Request, res: Response) {
    const { username, password } = req.body ?? {};
    if (typeof username !== "string" || !username.trim() ||
        typeof password !== "string" || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const result = loginUser(username.trim(), password);
        res.cookie("vessel_session", result.session.sessionId, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: "lax",
            path: "/",
            maxAge: Math.max(0, result.session.expiresAt - Date.now()),
        });
        return res.status(200).json({ user: result.user });
    } catch (error) {
        if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        console.error("Login failed:", error);
        return res.status(500).json({ message: "Unable to log in. Please try again." });
    }
}


export function verifySession(req: Request, res: Response) {
    const sessionId = req.cookies.vessel_session;
    const isValidSession = verifySessionServ(sessionId)

    if (isValidSession) {
        res.status(200).json({
            msg: "success"
        });
    }
    else{
        res.status(401).json({
            msg: "Unauthorised"
        });  
    }
}

export function logout(req: Request, res: Response) {
    const sessionId = req.cookies.vessel_session;
    if (sessionId) {
        db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
    }
    res.clearCookie("vessel_session", {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "lax",
        path: "/",
    });
    return res.status(200).json({ msg: "Logged out" });
}
