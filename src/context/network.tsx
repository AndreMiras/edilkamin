import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface NetworkContextType {
  isOnline: boolean;
  reportOnline: () => void;
  reportOffline: () => void;
}

const networkContextDefault: NetworkContextType = {
  isOnline: true,
  reportOnline: () => {},
  reportOffline: () => {},
};

const NetworkContext = createContext<NetworkContextType>(networkContextDefault);

/**
 * NetworkContextProvider tracks network connectivity using both:
 * 1. Browser's navigator.onLine API (unreliable but catches some cases)
 * 2. Fetch-based detection (components report success/failure)
 *
 * Components should call reportOffline() when a fetch fails with network error,
 * and reportOnline() when a fetch succeeds.
 */
const NetworkContextProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Sync with current state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const reportOnline = useCallback(() => setIsOnline(true), []);
  const reportOffline = useCallback(() => setIsOnline(false), []);

  return (
    <NetworkContext.Provider value={{ isOnline, reportOnline, reportOffline }}>
      {children}
    </NetworkContext.Provider>
  );
};

const useNetwork = () => useContext(NetworkContext);

export { NetworkContext, NetworkContextProvider, useNetwork };
