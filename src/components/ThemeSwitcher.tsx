import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { Nav } from "react-bootstrap";

import { ThemeContext } from "../context/theme";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Nav.Link
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="ms-2"
    >
      <FontAwesomeIcon icon={theme === "light" ? "moon" : "sun"} />
    </Nav.Link>
  );
};

export default ThemeSwitcher;
