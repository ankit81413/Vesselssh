import { Request, Response } from "express";
import { createSuperUser } from "../services/auth.services.js";


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
            "__Host-vessel_session",
            result.session.sessionId,
            {
                httpOnly: true,
                secure: false,
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