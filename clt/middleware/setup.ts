import { NextRequest, NextResponse } from "next/server";

export async function setupMiddleware(req: NextRequest) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_VESSEL_SERVER_URL}/api/auth/checkadmin`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) },
    );

    if (!response.ok) throw new Error("Admin check failed");

    const data = await response.json();
    if (typeof data?.data?.hasAdmin !== "boolean") {
      throw new Error("Invalid admin check response");
    }

    if (data.data.hasAdmin) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  } catch {
    return new NextResponse("Unable to check setup status. Please try again shortly.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "5", "Cache-Control": "no-store" },
    });
  }
}
