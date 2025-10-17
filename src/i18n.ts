import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonEn from "../public/locales/en/common.json";
import headerEn from "../public/locales/en/header.json";
import logoutEn from "../public/locales/en/logout.json";
import powerEn from "../public/locales/en/power.json";
import commonFr from "../public/locales/fr/common.json";
import headerFr from "../public/locales/fr/header.json";
import logoutFr from "../public/locales/fr/logout.json";
import powerFr from "../public/locales/fr/power.json";

const resources = {
  en: {
    common: commonEn,
    header: headerEn,
    logout: logoutEn,
    power: powerEn,
  },
  fr: {
    common: commonFr,
    header: headerFr,
    logout: logoutFr,
    power: powerFr,
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
