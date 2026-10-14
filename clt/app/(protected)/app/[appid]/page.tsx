"use client";

import { use, useEffect, useState } from "react";

export default function AppPage({
  params,
}: {
  params: Promise<{ appid: string }>;
}) {
  const { appid } = use(params);

  const [clt_url, setClt_url] = useState("");

  // Start the app.
  useEffect(() => {
    let cancelled = false;

    async function openApp() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_VESSEL_SERVER_URL}/api/openApp/${appid}`
        );

        if (!res.ok) {
          throw new Error(`Failed to open app: HTTP ${res.status}`);
        }

        const data = await res.json();

        if (!cancelled) {
          setClt_url(data.data.clt_url);
        }
      } catch (err) {
        console.error("App startup failed:", err);
      }
    }

    openApp();

    return () => {
      cancelled = true;
    };
  }, [appid]);

  // Listen for close requests from AppWindow.
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Accept messages only from the parent window.
      if (event.origin !== window.location.origin) return;
      if (event.source !== window.parent) return;
      if (event.data?.type !== "CLOSE_APP") return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_VESSEL_SERVER_URL}/api/openApp/${appid}/close`,
          { method: "POST" }
        );

        if (!response.ok) {
          throw new Error(`Failed to close app: HTTP ${response.status}`);
        }

        window.parent.postMessage(
          { type: "APP_CLOSED", appid },
          event.origin
        );
        
      } catch (err) {
        console.error("App cleanup failed:", err);

        window.parent.postMessage(
          { type: "APP_CLOSE_FAILED", appid },
          event.origin
        );
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [appid]);

  return (
    <div className="h-dvh w-full overflow-hidden">
      {clt_url && (
        <iframe
          src={clt_url}
          title={`${appid} application`}
          className="block h-full w-full border-0"
        />
      )}
    </div>
  );
}