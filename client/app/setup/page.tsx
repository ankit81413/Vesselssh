"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function SetupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [setupComplete, setSetupComplete] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const passwordsMatch = password.length > 0 && password === confirmPassword;


    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!passwordsMatch || !username.trim() || isSubmitting || setupComplete) return;

        setIsSubmitting(true);
        setMessage("");

        try {
            const serverUrl = process.env.NEXT_PUBLIC_VESSEL_SERVER_URL;
            if (!serverUrl) {
                setMessage("Unable to connect to the server. Please check the server configuration.");
                return;
            }

            const response = await fetch(`${serverUrl.replace(/\/$/, "")}/api/auth/setup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username: username.trim(), password }),
            });

            if (response.status === 409) {
                setSetupComplete(true);
                setPassword("");
                setConfirmPassword("");
                setMessage("Setup has already been completed. Go to login to use your existing account.");
                return;
            }

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                setMessage(typeof data?.message === "string" ? data.message : "Unable to create the superuser. Please try again.");
                return;
            }

            setSetupComplete(true);
            setPassword("");
            setConfirmPassword("");
            setMessage("Superuser created successfully. You can now go to login.");
        } catch {
            setMessage("Could not confirm account creation. Check your connection and reload to verify setup status before trying again.");
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <main className="flex min-h-screen items-center justify-center bg-[#300a24] px-4 py-10 text-[#333]">
            <section aria-labelledby="setup-title" className="w-full max-w-lg overflow-hidden rounded-md border border-black/30 bg-[#f6f5f4] shadow-lg">
                <header className="border-b border-[#ccc] bg-[#e6e5e3] px-5 py-3 text-center text-sm font-semibold">
                    Vessel SSH — Setup
                </header>

                <form onSubmit={handleSubmit} aria-busy={isSubmitting} onChange={() => { if (!setupComplete) setMessage(""); }}>
                    <div className="px-6 py-7 sm:px-8">
                        <h1 id="setup-title" className="text-xl font-medium">Create a superuser</h1>
                        <p className="mt-2 text-sm leading-6 text-[#666]">
                            You’re going to create the superuser account. This user will have full administrator access.
                        </p>

                        <fieldset disabled={isSubmitting || setupComplete} className="mt-7 grid items-center gap-x-4 gap-y-2 disabled:opacity-60 sm:grid-cols-[90px_1fr] sm:gap-y-4">
                            <label htmlFor="username" className="text-sm sm:text-right">Username</label>
                            <input
                                id="username"
                                name="username"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                type="text"
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck={false}
                                required
                                className="h-9 w-full rounded border border-[#aaa] bg-white px-2.5 text-sm outline-none focus:border-[#e95420] focus:ring-1 focus:ring-[#e95420]"
                            />

                            <label htmlFor="password" className="mt-2 text-sm sm:mt-0 sm:text-right">Password</label>
                            <input
                                id="password"
                                name="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="h-9 w-full rounded border border-[#aaa] bg-white px-2.5 text-sm outline-none focus:border-[#e95420] focus:ring-1 focus:ring-[#e95420]"
                            />

                            <label htmlFor="confirm-password" className="mt-2 text-sm sm:mt-0 sm:text-right">Confirm password</label>
                            <input
                                id="confirm-password"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                autoComplete="new-password"
                                required
                                aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
                                aria-describedby="password-match"
                                className="h-9 w-full rounded border border-[#aaa] bg-white px-2.5 text-sm outline-none placeholder:text-[#666] focus:border-[#e95420] focus:ring-1 focus:ring-[#e95420]"
                            />
                            <p id="password-match" aria-live="polite" className="text-xs text-[#b3261e] empty:hidden sm:col-start-2">
                                {confirmPassword.length > 0 && !passwordsMatch ? "Passwords do not match." : ""}
                            </p>

                            <label className="mt-1 flex w-fit items-center gap-2 text-sm sm:col-start-2">
                                <input
                                    type="checkbox"
                                    checked={showPassword}
                                    onChange={(event) => setShowPassword(event.target.checked)}
                                    aria-controls="password confirm-password"
                                    className="h-4 w-4 accent-[#e95420]"
                                />
                                Show password
                            </label>
                        </fieldset>
                        <p role="status" className="mt-5 text-sm leading-5 text-[#666] empty:hidden">{message}</p>
                    </div>

                    <footer className="flex flex-wrap justify-end gap-2 border-t border-[#ddd] bg-[#eeedeb] px-6 py-4">
                        <Link href="/login" className="rounded border border-[#bbb] bg-[#fafafa] px-5 py-2 text-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e95420]">
                            {setupComplete ? "Go to login" : "Back"}
                        </Link>
                        <button type="submit" disabled={!username.trim() || !passwordsMatch || isSubmitting || setupComplete} className="rounded border border-[#c34113] bg-[#e95420] px-5 py-2 text-sm font-medium text-white enabled:hover:bg-[#d44919] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e95420]">
                            {isSubmitting ? "Creating…" : setupComplete ? "Setup complete" : "Create superuser"}
                        </button>
                    </footer>
                </form>
            </section>
        </main>
    );
}
