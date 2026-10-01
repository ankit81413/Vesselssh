import { NextRequest, NextResponse } from "next/server";
import { sessionMiddleware } from "./middleware/session";
import { setupMiddleware } from "./middleware/setup";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  const request = new NextRequest(req, {
    headers: requestHeaders,
  });
  
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname === "/setup" || pathname.startsWith("/setup/")) {
    return setupMiddleware(request);
  }

  return sessionMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico$).*)"],
};
