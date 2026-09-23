import useClickOutside from "@/app/(protected)/hooks/useClickOutside";
import { useMemo, useRef, useState } from "react";

type TaskbarClockProps = {
  currentTime: Date | null;
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TaskbarClock({ currentTime }: TaskbarClockProps) {
  const [isClockOpen, setIsClockOpen] = useState(false);
  const [is24Hour, setIs24Hour] = useState(false);

  const clock =
    currentTime?.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }) ?? "--:--";

  const date =
    currentTime?.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    }) ?? "";

  const detailedTime =
    currentTime?.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: !is24Hour,
    }) ?? "--:--:--";

  const detailedDate =
    currentTime?.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }) ?? "";

  const monthLabel =
    currentTime?.toLocaleDateString([], {
      month: "long",
      year: "numeric",
    }) ?? "";

  const calendarDays = useMemo(() => {
    if (!currentTime) {
      return [];
    }

    const year = currentTime.getFullYear();
    const month = currentTime.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [currentTime]);

  const clockref = useRef<HTMLDivElement>(null);

  useClickOutside(clockref, () => {
    setIsClockOpen(false);
  });

  return (
    <div className="relative" ref={clockref}>
      {isClockOpen && (
        <div className="absolute bottom-11 right-0 w-80 overflow-hidden rounded-md border border-cyan-100/18 bg-slate-950/92 text-cyan-50 shadow-[0_18px_58px_rgba(2,8,23,0.5)] backdrop-blur-2xl">
          <div className="border-b border-cyan-100/14 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold leading-none">
                  {detailedTime}
                </p>
                <p className="mt-2 text-xs text-cyan-50/60">{detailedDate}</p>
              </div>

              <button
                type="button"
                aria-pressed={is24Hour}
                title="Switch time format"
                className="rounded-md border border-cyan-100/16 px-2.5 py-1 text-xs font-semibold text-cyan-50/82 transition hover:bg-cyan-100/12"
                onClick={() => setIs24Hour((value) => !value)}
              >
                {is24Hour ? "24H" : "12H"}
              </button>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">{monthLabel}</p>
              <i className="fa-regular fa-calendar text-cyan-100/70" />
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map((day) => (
                <span
                  key={day}
                  className="text-[10px] font-semibold uppercase text-cyan-50/46"
                >
                  {day}
                </span>
              ))}

              {calendarDays.map((day, index) =>
                day ? (
                  <span
                    key={`${day}-${index}`}
                    className={`grid h-8 place-items-center rounded-md text-xs ${
                      day === currentTime?.getDate()
                        ? "bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(103,232,249,0.36)]"
                        : "text-cyan-50/78"
                    }`}
                  >
                    {day}
                  </span>
                ) : (
                  <span key={`empty-${index}`} className="h-8" />
                )
              )}
            </div>
          </div>
        </div>
      )}

      <button
        className="rounded-md px-2 py-1 text-right hover:bg-cyan-100/12"
        aria-expanded={isClockOpen}
        aria-label="Open clock and calendar"
        onClick={() => setIsClockOpen((value) => !value)}
      >
        <span className="block text-xs font-semibold leading-3">{clock}</span>
        <span className="hidden text-[10px] leading-3 text-cyan-50/56 sm:block">
          {date}
        </span>
      </button>
    </div>
  );
}
