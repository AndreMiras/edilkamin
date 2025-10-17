import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonEn from "../public/locales/en/common.json";
import headerEn from "../public/locales/en/header.json";
import commonFr from "../public/locales/fr/common.json";
import headerFr from "../public/locales/fr/header.json";

const resources = {
  en: {
    common: commonEn,
    header: headerEn,
  },
  fr: {
    common: commonFr,
    header: headerFr,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
