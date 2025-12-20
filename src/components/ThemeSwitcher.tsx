import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";

import { ThemeContext } from "../context/theme";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="ml-2 p-2 rounded-md text-foreground hover:bg-muted transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring"
    >
      <FontAwesomeIcon icon={theme === "light" ? "moon" : "sun"} />
    </button>
  );
};

export default ThemeSwitcher;
