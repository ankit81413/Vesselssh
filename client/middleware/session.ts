import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function sessionMiddleware(req: NextRequest) {
    const session = req.cookies.get("vessel_session");

    if (!session?.value) {
        return NextResponse.redirect(
            new URL("/login", req.url)
        );
    }

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_VESSEL_SERVER_URL}/api/auth/verifySession`,
        {
            method: "POST",
            headers: {
                Cookie: req.headers.get("cookie") ?? "",
            },
        }
    );

    const data = await res.json();
    console.log(data)

    if (!res.ok) {
        return NextResponse.redirect(
            new URL("/login", req.url)
        );
    }

    return NextResponse.next();
}