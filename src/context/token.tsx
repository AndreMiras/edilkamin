import { getSession } from "edilkamin";
import { createContext, ReactNode, useEffect, useState } from "react";

import { getTokenLocalStorage, setTokenLocalStorage } from "../utils/helpers";

interface TokenContextType {
  token: string | null | undefined;
  setToken: (token: string | null) => void;
}

const defaultToken = undefined;
const tokenContextDefault = {
  token: defaultToken,
  setToken: () => {},
};

const TokenContext = createContext<TokenContextType>(tokenContextDefault);

const TokenContextProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null | undefined>();

  useEffect(() => {
    const initializeToken = async () => {
      const storedToken = getTokenLocalStorage();
      if (!storedToken) {
        setToken(null);
        return;
      }
      try {
        const useLegacy = process.env.NEXT_PUBLIC_USE_LEGACY_API === "true";
        const refreshedToken = await getSession(false, useLegacy);
        setTokenLocalStorage(refreshedToken);
        setToken(refreshedToken);
      } catch {
        // Session expired or invalid, clear token and require re-login
        setToken(null);
      }
    };
    initializeToken();
  }, []);

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export { TokenContext, TokenContextProvider };
