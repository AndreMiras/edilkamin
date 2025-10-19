import { useContext, useEffect } from "react";

import { ThemeContext } from "../context/theme";

const ThemeInitializer = () => {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-bs-theme", theme);
    }
  }, [theme]);

  return null;
};

export default ThemeInitializer;
