import { NextRequest, NextResponse } from "next/server";

export function sessionMiddleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get("__Host-vessel_session")?.value);

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
