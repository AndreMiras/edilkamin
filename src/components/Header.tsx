import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../context/theme";
import { useIsLoggedIn, useLogout } from "../utils/hooks";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const Header = () => {
  const { t } = useTranslation("header");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const { theme, setTheme } = useContext(ThemeContext);
  const logout = useLogout();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-card border-b border-border -mt-[env(safe-area-inset-top)] pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center text-foreground font-semibold text-lg no-underline hover:text-foreground"
          >
            <FontAwesomeIcon
              icon={["fas", "fire-flame-curved"]}
              className="mr-2"
            />
            Edilkamin
          </Link>

          {/* Desktop navigation */}
          <div className="hidden sm:flex sm:items-center sm:gap-2">
            <a
              href="https://github.com/AndreMiras/edilkamin"
              className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm no-underline"
            >
              <FontAwesomeIcon icon={["fab", "github-alt"]} className="mr-1" />
              {t("about")}
            </a>
            <LanguageSwitcher />
            <ThemeSwitcher />
            {isLoggedIn && (
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {t("logout")}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="sm:hidden p-2 text-muted-foreground hover:text-foreground"
                aria-label="Toggle menu"
              >
                <FontAwesomeIcon icon="bars" className="text-xl" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{t("menu")}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {/* About */}
                <a
                  href="https://github.com/AndreMiras/edilkamin"
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-foreground hover:bg-muted no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon
                    icon={["fab", "github-alt"]}
                    className="w-5 text-muted-foreground"
                  />
                  <span>{t("about")}</span>
                </a>

                {/* Language */}
                <div className="flex items-center gap-3 px-3 py-3 rounded-md text-foreground hover:bg-muted">
                  <FontAwesomeIcon
                    icon="globe"
                    className="w-5 text-muted-foreground"
                  />
                  <span className="flex-1">{t("language")}</span>
                  <LanguageSwitcher />
                </div>

                {/* Theme */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-foreground hover:bg-muted w-full text-left"
                >
                  <FontAwesomeIcon
                    icon={theme === "light" ? "moon" : "sun"}
                    className="w-5 text-muted-foreground"
                  />
                  <span>
                    {theme === "light" ? t("darkMode") : t("lightMode")}
                  </span>
                </button>

                {/* Logout */}
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-foreground hover:bg-muted w-full text-left"
                  >
                    <FontAwesomeIcon
                      icon="right-from-bracket"
                      className="w-5 text-muted-foreground"
                    />
                    <span>{t("logout")}</span>
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Header;
