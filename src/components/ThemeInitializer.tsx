import { useContext, useEffect } from "react";

import { ThemeContext } from "../context/theme";

const ThemeInitializer = () => {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (theme) {
      // Apply both Bootstrap (data-bs-theme) and Tailwind (.dark class) for dark mode
      // This allows incremental migration from Bootstrap to Tailwind
      document.documentElement.setAttribute("data-bs-theme", theme);
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
