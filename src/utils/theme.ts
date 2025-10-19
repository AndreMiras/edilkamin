const themeLocalStorageKey = "theme";

type Theme = "light" | "dark";

const getThemeLocalStorage = (): Theme | null => {
  const theme = localStorage.getItem(themeLocalStorageKey);
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  return null;
};

const setThemeLocalStorage = (theme: Theme): void => {
  localStorage.setItem(themeLocalStorageKey, theme);
};

export { getThemeLocalStorage, setThemeLocalStorage };
export type { Theme };
