import { useEffect, useState } from "react";

/**
 * Hook to track network connectivity status.
 * Uses navigator.onLine and online/offline events.
 *
 * @returns boolean - true if online, false if offline
 *
 * Note: navigator.onLine can have false positives (connected to network
 * but no internet), but it reliably detects complete offline state.
 */
export const useNetworkStatus = (): boolean => {
  // Default to true for SSR (assume online on server)
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    // Skip if running on server
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Sync with current state in case it changed during SSR
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};
