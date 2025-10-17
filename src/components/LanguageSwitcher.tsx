import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const LOCALE_STORAGE_KEY = "edilkamin-locale";

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation("header");

  const switchLanguage = () => {
    const newLocale = i18n.language === "en" ? "fr" : "en";
    i18n.changeLanguage(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  };

  return (
    <Button
      variant="outline-light"
      size="sm"
      onClick={switchLanguage}
      className="ms-2"
    >
      {t("languageSwitcher.switchTo")}
    </Button>
  );
};

export default LanguageSwitcher;
