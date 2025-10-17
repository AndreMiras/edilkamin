import { Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const LOCALE_STORAGE_KEY = "edilkamin-locale";

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation("header");

  const languages = ["en", "fr"];

  const switchLanguage = (locale: string) => {
    i18n.changeLanguage(locale);
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  };

  return (
    <Dropdown className="ms-2">
      <Dropdown.Toggle variant="outline-secondary">
        {i18n.language.toUpperCase()}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {languages.map((locale) => (
          <Dropdown.Item
            key={locale}
            active={i18n.language === locale}
            onClick={() => switchLanguage(locale)}
          >
            {t(`languageSwitcher.languages.${locale}`)}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;
