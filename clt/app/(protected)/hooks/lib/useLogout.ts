
"use client";

import { useCallback, useRef, useState } from "react";

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const logoutInProgress = useRef(false);

  const logout = useCallback(async () => {
    // Prevent duplicate logout requests.
    if (logoutInProgress.current) return;

    logoutInProgress.current = true;
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_VESSEL_SERVER_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Logout failed: HTTP ${response.status}`);
      }

      // Clear client-side data after the server logout succeeds.
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies accessible to browser JavaScript.
      // HttpOnly cookies must be expired by the backend.
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();

        if (name) {
          document.cookie =
            `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        }
      });

      // Return to the lock/login screen.
      window.location.replace("/lockscreen");
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError("Could not log out. Please try again.");
      logoutInProgress.current = false;
      setIsLoggingOut(false);
    }
  }, []);

  return {
    logout,
    isLoggingOut,
    logoutError,
  };
}
