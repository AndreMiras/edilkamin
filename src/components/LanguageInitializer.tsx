import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const LOCALE_STORAGE_KEY = "edilkamin-locale";

const LanguageInitializer = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    const validLocales = ["en", "fr", "es"];
    if (savedLocale && validLocales.includes(savedLocale)) {
      i18n.changeLanguage(savedLocale);
    }
  }, [i18n]);

  return null;
};

export default LanguageInitializer;
