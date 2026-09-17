import type { NextRequest } from "next/server";
import { sessionMiddleware } from "./middleware/session";
import { setupMiddleware } from "./middleware/setup";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/setup" || pathname.startsWith("/setup/")) {
    return setupMiddleware(req);
  }

  // return sessionMiddleware(req);
}

export const config = {
  matcher: ["/", "/setup/:path*"],
};
