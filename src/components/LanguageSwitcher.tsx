import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOCALE_STORAGE_KEY = "edilkamin-locale";

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation("header");

  const languages = ["en", "fr", "es"];

  const switchLanguage = (locale: string) => {
    i18n.changeLanguage(locale);
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-2 px-3 py-2 border !border-input !bg-background text-foreground !rounded-md hover:bg-muted focus:outline-hidden focus:ring-2 focus:ring-ring">
        {i18n.language.toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={i18n.language === locale ? "bg-muted" : ""}
            data-active={i18n.language === locale}
          >
            {t(`languageSwitcher.languages.${locale}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
