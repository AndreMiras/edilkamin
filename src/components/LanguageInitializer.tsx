import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const LOCALE_STORAGE_KEY = "edilkamin-locale";

const LanguageInitializer = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (savedLocale && (savedLocale === "en" || savedLocale === "fr")) {
      i18n.changeLanguage(savedLocale);
    }
  }, [i18n]);

  return null;
};

export default LanguageInitializer;
