import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useIsLoggedIn } from "../utils/hooks";
import LanguageSwitcher from "./LanguageSwitcher";
import Login from "./Login";
import Logout from "./Logout";
import ThemeSwitcher from "./ThemeSwitcher";

const Header = () => {
  const { t } = useTranslation("header");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = useIsLoggedIn();

  return (
    <nav className="bg-card border-b border-border">
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
            {isLoggedIn === true ? <Logout /> : <Login />}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <FontAwesomeIcon
              icon={mobileMenuOpen ? "times" : "bars"}
              className="text-xl"
            />
          </button>
        </div>
      </div>

      {/* Mobile menu with slide animation */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-3">
            <a
              href="https://github.com/AndreMiras/edilkamin"
              className="block text-muted-foreground hover:text-foreground no-underline"
            >
              <FontAwesomeIcon icon={["fab", "github-alt"]} className="mr-2" />
              {t("about")}
            </a>
            <div>
              <LanguageSwitcher />
            </div>
            <div>
              <ThemeSwitcher />
            </div>
            <div>{isLoggedIn === true ? <Logout /> : <Login />}</div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
