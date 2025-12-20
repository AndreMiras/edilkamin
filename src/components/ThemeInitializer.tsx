import { useContext, useEffect } from "react";

import { ThemeContext } from "../context/theme";

const ThemeInitializer = () => {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (theme) {
      // Apply Tailwind dark mode class
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  return null;
};

export default ThemeInitializer;
