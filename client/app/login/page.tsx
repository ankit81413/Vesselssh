"use client";
import React, { useEffect, useRef, useState } from "react";
import wallpaper from "@/app/(protected)/assets/lockscreenWallpaper.jpg";
import desktopWallpaper from "@/app/(protected)/assets/HomeWallpaper.jpg";
import dp from "@/app/(protected)/assets/dp.jpg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function LockScreenPage() {

  const router = useRouter();



  const [time, setTime] = useState(new Date());
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("")
  const [usernamenow, setUsernamenow] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(true)
  const [fetchingLoginInfo, setFetchingLoginInfo] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<"checking" | "authenticated" | "anonymous">("checking");
  const [loggingOut, setLoggingOut] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [sessionError, setSessionError] = useState("");
  const LoginInput = useRef<HTMLInputElement | null>(null);
  const passInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("button, input, a")) return;
      if (e.key == "Enter" && sessionStatus !== "checking" && !loggingOut) {
        setLoginOpen(true);
      }

      if (e.key == "Escape") {
        setLoginOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sessionStatus, loggingOut]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${process.env.NEXT_PUBLIC_VESSEL_SERVER_URL}/api/auth/verifySession`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    }).then((response) => {
      setSessionStatus(response.ok ? "authenticated" : "anonymous");
    }).catch(() => {
      if (!controller.signal.aborted) setSessionStatus("anonymous");
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!loginOpen || sessionStatus !== "authenticated") return;
    const timer = window.setTimeout(() => router.push("/"), 500);
    return () => window.clearTimeout(timer);
  }, [loginOpen, sessionStatus, router]);

  async function logout() {
    setLoggingOut(true);
    setSessionError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_VESSEL_SERVER_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      setSessionStatus("anonymous");
      setLoginOpen(false);
      setUsername("");
      setPassword("");
      setUsernamenow(true);
    } catch {
      setSessionError("Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_VESSEL_SERVER_URL}/api/auth/checkadmin`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.data.hasAdmin) {
          setHasAdmin(true)
        } else {
          setHasAdmin(false)
        }
      } catch (error) {
        console.error("Failed to check admin:", error);
      }
    }
    checkAdmin();
  }, [])

  function getMonthName() {
    switch (time.getMonth()) {
      case 0:
        return "January";
      case 1:
        return "February";
      case 2:
        return "March";
      case 3:
        return "April";
      case 4:
        return "May";
      case 5:
        return "June";
      case 6:
        return "July";
      case 7:
        return "August";
      case 8:
        return "September";
      case 9:
        return "October";
      case 10:
        return "November";
      case 11:
        return "December";
      default:
        return "";
    }
  }

  function getDayName() {
    switch (time.getDay()) {
      case 0:
        return "Sunday";
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
      default:
        return "";
    }
  }

  useEffect(() => {
    if (!loginOpen || sessionStatus !== "anonymous") return;
    const timer = window.setTimeout(() => {
      (usernamenow ? LoginInput : passInput).current?.focus();
    }, usernamenow ? 500 : 0);
    return () => window.clearTimeout(timer);
  }, [usernamenow, loginOpen, sessionStatus]);

  function fetchusername(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username.trim()) return;
    setUsername(username.trim());
    setLoginError("");
    setUsernamenow(false)

  }

  async function SubmitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (fetchingLoginInfo || !username.trim() || !password) return;
    setLoginError("");
    setFetchingLoginInfo(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_VESSEL_SERVER_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username, password
        })
      });
      if (!res.ok) {
        setLoginError(res.status === 401 ? "Invalid username or password." : "Unable to log in. Please try again.");
        return;
      }
      setPassword("");
      setSessionStatus("authenticated");
      setLoginOpen(true);
    } catch {
      setLoginError("Could not connect to the server. Please try again.");
    } finally {
      setFetchingLoginInfo(false);
    }

  }

  const displayHour = time.getHours() % 12 || 12;
  const displayMinute = time.getMinutes().toString().padStart(2, "0");
  const period = time.getHours() >= 12 ? "PM" : "AM";

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${sessionStatus === "authenticated" ? desktopWallpaper.src : wallpaper.src})` }}
    >
      {sessionStatus !== "authenticated" && <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />}

      <main
        className={`relative z-10 grid min-h-screen place-items-center px-6 py-8 transition-all duration-700 ease-out ${loginOpen
          ? "scale-100 opacity-100 blur-0"
          : "scale-95 opacity-0 blur-sm"
          }`}
      >
        {sessionStatus === "authenticated" ? (
          <div role="status" aria-label="Opening desktop" className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        ) : sessionStatus === "anonymous" && loginOpen ? (
        <section className="flex w-full max-w-md justify-center">
          <div className="w-full px-6 py-8 text-center">
            <div className="flex justify-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-full bg-zinc-200 shadow-lg shadow-black/35 sm:h-32 sm:w-32">
                <Image
                  src={dp}
                  alt="Display Picture"
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>

            <form
              className={`mt-8 usenameForm ${usernamenow ? "block" : "hidden"}`}
              onSubmit={(e) => {
                fetchusername(e);
              }}
            >
              <div className="mx-auto flex h-11 w-full max-w-[310px] items-center overflow-hidden rounded-[6px] bg-zinc-100 text-zinc-950 shadow-lg shadow-black/30 ring-1 ring-white/20 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-[#e95420]">
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-4 text-[15px] font-medium outline-none placeholder:text-zinc-500"
                  placeholder="Tony_stark"
                  aria-label="Username"
                  ref={LoginInput}
                />
                <button
                  type="submit"
                  disabled={fetchingLoginInfo}
                  aria-label="Continue"
                  className="grid h-11 w-11 shrink-0 place-items-center bg-[#e95420] text-white transition hover:bg-[#c34113] active:bg-[#ad3510]"
                >
                  <i className="fa-solid fa-right-long text-sm"></i>
                </button>
              </div>
            </form>

            <form
              className={`mt-8 passwordForm ${usernamenow ? "hidden" : "block"
                }`}
              onSubmit={(e) => {
                SubmitForm(e)
              }}
            >
              <div className="mx-auto flex h-11 w-full max-w-[310px] items-center overflow-hidden rounded-[6px] bg-zinc-100 text-zinc-950 shadow-lg shadow-black/30 ring-1 ring-white/20 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-[#e95420]">
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  disabled={fetchingLoginInfo}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-4 text-[15px] font-medium outline-none placeholder:text-zinc-500"
                  placeholder="Password"
                  aria-label="Password"
                  ref={passInput}
                />
                <button
                  type="submit"
                  disabled={fetchingLoginInfo}
                  aria-label="Continue"
                  className="grid h-11 w-11 shrink-0 place-items-center bg-[#e95420] text-white transition hover:bg-[#c34113] active:bg-[#ad3510]"
                >
                  {!fetchingLoginInfo ?
                    <i className="fa-solid fa-right-long text-sm"></i>
                    : <i className="fa-solid fa-spinner fa-spin-snap-8"></i>
                  }
                </button>
              </div>
            </form>
            {loginError && <p role="alert" className="mt-4 text-sm text-red-200">{loginError}</p>}
            {!usernamenow && (
              <button type="button" disabled={fetchingLoginInfo}
                onClick={() => { setUsernamenow(true); setPassword(""); setLoginError(""); }}
                className="mt-4 text-sm text-white/80 hover:text-white disabled:opacity-50">
                Change username
              </button>
            )}
          </div>
        </section>
        ) : null}
      </main>

      <div
        className={`absolute inset-0 z-20 overflow-hidden transition-[visibility] duration-700 ${loginOpen ? "invisible" : "visible"
          }`}
      >
        <div
          className={`absolute inset-x-0 top-0 h-1/2 overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${loginOpen ? "-translate-y-full" : "translate-y-0"
            }`}
        >
          <div
            className="absolute inset-x-0 top-0 h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${wallpaper.src})` }}
          />
          <div className="absolute inset-x-0 top-0 h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.26),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(244,114,182,0.20),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.34),rgba(2,6,23,0.66))]" />
          {/* <div className="absolute inset-x-0 bottom-0 h-px bg-white/25 shadow-[0_0_30px_rgba(125,211,252,0.55)]" /> */}
        </div>

        <div
          className={`absolute inset-x-0 bottom-0 h-1/2 overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${loginOpen ? "translate-y-full" : "translate-y-0"
            }`}
        >
          <div
            className="absolute inset-x-0 bottom-0 h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${wallpaper.src})` }}
          />
          <div className="absolute inset-x-0 bottom-0 h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.26),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(244,114,182,0.20),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.34),rgba(2,6,23,0.66))]" />
          {/* <div className="absolute inset-x-0 top-0 h-px bg-white/25 shadow-[0_0_30px_rgba(125,211,252,0.55)]" /> */}
        </div>

        <main
          className={`relative z-10 flex min-h-screen flex-col justify-between px-6 py-8 transition-all duration-500 sm:px-10 lg:px-16 ${loginOpen
            ? "-translate-y-8 opacity-0 blur-sm"
            : "translate-y-0 opacity-100 blur-0"
            }`}
        >
          <header className="flex items-center justify-between text-sm text-white/80">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/15 px-3 py-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
              <span className="font-medium tracking-wide">Vessel SSH</span>
            </div>
          </header>

          <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100 shadow-2xl backdrop-blur-md">
              Secure | GUI | SSH
            </div>

            <div className="relative">
              <div className="absolute inset-x-8 top-6 h-20 rounded-full bg-cyan-300/20 blur-3xl" />
              <h1 className="relative text-[clamp(5rem,17vw,13rem)] font-semibold leading-none tracking-normal drop-shadow-2xl text-white">
                {displayHour}:{displayMinute}
              </h1>
            </div>

            <p className="mt-3 text-lg font-medium text-white/85 sm:text-2xl">
              {getDayName()}, {time.getDate()} {getMonthName()} | {period}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/62 sm:text-base">
              {sessionStatus === "authenticated" ? "Press Enter to open your workspace." : "Standby access for your remote vessel workspace."}
            </p>
          </section>

          <footer className="flex justify-center sm:justify-end">
            <div className="flex justify-end gap-3">
              {sessionError && <p role="alert" className="self-center text-red-200">{sessionError}</p>}
              {hasAdmin || sessionStatus !== "anonymous" ? "" :
                <Link
                  href="/setup"
                  className="flex items-center gap-2 rounded-xl border border-red-500 bg-red-300/10 px-5 py-3 font-medium text-red-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-700/30 hover:text-white hover:shadow-cyan-500/20"
                >
                  <i className="fa-solid fa-unlock"></i>
                  sudo
                </Link>}
              <button
                onClick={() => {
                  if (sessionStatus === "authenticated") void logout();
                  else setLoginOpen(true);
                }}
                disabled={sessionStatus === "checking" || loggingOut}
                className="flex items-center gap-2 rounded-4xl border border-white/30 bg-white/20 px-5 py-3 font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30 hover:shadow-cyan-500/20"
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                {sessionStatus === "checking" ? "Checking session…" : loggingOut ? "Logging out…" : sessionStatus === "authenticated" ? "Logout" : "Login"}
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
