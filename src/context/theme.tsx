import {
  createContext,
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  getThemeLocalStorage,
  setThemeLocalStorage,
  Theme,
} from "../utils/theme";

interface ThemeContextType {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
}

const defaultTheme: Theme = "light";
const themeContextDefault: ThemeContextType = {
  theme: defaultTheme,
  setTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(themeContextDefault);

const ThemeContextProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    const savedTheme = getThemeLocalStorage();
    setThemeState(savedTheme || defaultTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setThemeLocalStorage(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeContextProvider };
