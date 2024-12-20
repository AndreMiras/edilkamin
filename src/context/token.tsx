import {
  createContext,
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";

import { getTokenLocalStorage } from "../utils/helpers";

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

const TokenContextProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null | undefined>();

  useEffect(() => setToken(getTokenLocalStorage()), []);

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export { TokenContext, TokenContextProvider };
