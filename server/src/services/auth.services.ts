import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

import db from "../config/db.js";
import { createSessionServ } from "../utils/session.js";

export function createSuperUser(username: string, password: string) {
  const existing_superUser = db.prepare(`SELECT id FROM users LIMIT 1`).get();
  if (existing_superUser) {
    throw new Error("SETUP_COMPLETED");
  }

  const id = randomUUID();
  const passwordHash = bcrypt.hashSync(password, 12);

  db.prepare(
    `
        INSERT INTO users (
                id,
                username,
                password_hash,
                role,
                created_at
            )
            VALUES (?, ?, ?, ?, ?)
    `
  ).run(id, username, passwordHash, "SUPERADMIN", Date.now());
  const session = createSessionServ(id);
  return {
    user: {
      id,
      username,
      role: "SUPERADMIN",
    },
    session,
  };
}

export function loginUser(username: string, password: string) {
  const user = db
    .prepare(
      "SELECT id,username,password_hash,role FROM users WHERE username = ?"
    )
    .get(username) as
    | {
        id: string;
        username: string;
        password_hash: string;
        role: string;
      }
    | undefined;

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordValid = bcrypt.compareSync(password, user.password_hash);

  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const session = createSessionServ(user.id)

  return {
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    session,
  };
}


export function verifySessionServ(sessionId: unknown) {
  if (typeof sessionId !== "string" || !sessionId) return false;
  const session = db.prepare("SELECT id FROM sessions WHERE id = ? AND expires_at > ?").get(sessionId, Date.now());
  return !!session;
}