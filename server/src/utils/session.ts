import { randomBytes } from "node:crypto";
import db from "../config/db.js";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export function createSessionServ(userId: string) {
    const sessionId = randomBytes(32).toString("hex");

    const expiresAt = Date.now() + SESSION_DURATION;

    db.prepare(`
        INSERT INTO sessions (
            id,
            user_id,
            expires_at,
            created_at
        )
        VALUES (?, ?, ?, ?)
    `).run(
        sessionId,
        userId,
        expiresAt,
        Date.now()
    );

    return {
        sessionId,
        expiresAt
    };
}
