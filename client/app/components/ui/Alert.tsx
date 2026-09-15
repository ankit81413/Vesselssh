"use client";
import useClickOutside from "@/app/hooks/useClickOutside";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";

type alertType = {
  title: string;
  heading: string;
  text: string;
  albuttons: Array<string>;
  okAction?: () => void;
};

const alertDict: Record<string, alertType> = {
  "route-not-found": {
    title: "Route not found ${alertTitle}",
    heading: "Route not found",
    text: "The page you are looking for could not be found.",
    albuttons: [],
  },
};

export default function Alert() {
  const searchParam = useSearchParams();

  const [dismissedAlertKey, setDismissedAlertKey] = useState<string | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);

  const alert = searchParam.get("alert");
  const alroute = searchParam.get("alroute");
  const alertKey = alert ? `${alert}:${alroute ?? ""}` : null;

  const alertToShow = useMemo(() => {
    if (!alert || !alertDict[alert]) {
      return null;
    }

    const alertData = alertDict[alert];
    const title = alertData.title.includes("${alertTitle}")
      ? alertData.title.replace("${alertTitle}", alroute ?? "")
      : alertData.title;

    return {
      ...alertData,
      title,
    };
  }, [alert, alroute]);

  const showalert = Boolean(alertToShow && alertKey !== dismissedAlertKey);

  const closeAlert = useCallback(() => {
    if (alertKey) {
      setDismissedAlertKey(alertKey);
    }
    window.history.replaceState({}, "", window.location.pathname);
  }, [alertKey]);

  const handheOk = () => {
    if (alertToShow?.okAction) {
      alertToShow.okAction();
    } else {
      closeAlert();
    }
  };

  const blinkAlert = useCallback(() => {
    if (!showalert) {
      return;
    }

    setIsBlinking(false);

    window.requestAnimationFrame(() => {
      setIsBlinking(true);
      window.setTimeout(() => setIsBlinking(false), 760);
    });
  }, [showalert]);

  useClickOutside(alertRef, blinkAlert);

  return (
    <>
      {showalert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
          <div
            className={`w-[380px] rounded-xl border bg-white transition duration-150 ${
              isBlinking
                ? "animate-[alert-blink_190ms_ease-in-out_4] border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.28),0_20px_60px_rgba(0,0,0,0.3)]"
                : "border-gray-300 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            }`}
            ref={alertRef}
          >
            <div
              className={`flex h-10 items-center justify-between rounded-t-xl border-b px-4 transition-colors ${
                isBlinking
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <span className="text-sm font-medium text-gray-800">
                {alertToShow?.title}
              </span>

              <button
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                aria-label="Close"
                onClick={() => {
                  closeAlert();
                }}
              >
                ×
              </button>
            </div>

            <style jsx>{`
              @keyframes alert-blink {
                0%,
                100% {
                  transform: scale(1);
                  filter: brightness(1);
                }

                50% {
                  transform: scale(1.018);
                  filter: brightness(0.88);
                }
              }
            `}</style>

            <div className="flex gap-4 px-6 py-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {alertToShow?.heading}
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-600">
                  {alertToShow?.text}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 rounded-b-xl border-t border-gray-200 bg-gray-50 px-5 py-3">
              {alertToShow?.albuttons.includes("cancel") && (
                <button className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100">
                  Cancel
                </button>
              )}

              <button
                className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                onClick={() => {
                  handheOk();
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
