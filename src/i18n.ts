import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonEn from "../public/locales/en/common.json";
import errorEn from "../public/locales/en/error.json";
import fireplaceEn from "../public/locales/en/fireplace.json";
import footerEn from "../public/locales/en/footer.json";
import headerEn from "../public/locales/en/header.json";
import homeEn from "../public/locales/en/home.json";
import loginEn from "../public/locales/en/login.json";
import logoutEn from "../public/locales/en/logout.json";
import powerEn from "../public/locales/en/power.json";
import commonFr from "../public/locales/fr/common.json";
import errorFr from "../public/locales/fr/error.json";
import fireplaceFr from "../public/locales/fr/fireplace.json";
import footerFr from "../public/locales/fr/footer.json";
import headerFr from "../public/locales/fr/header.json";
import homeFr from "../public/locales/fr/home.json";
import loginFr from "../public/locales/fr/login.json";
import logoutFr from "../public/locales/fr/logout.json";
import powerFr from "../public/locales/fr/power.json";

const resources = {
  en: {
    common: commonEn,
    error: errorEn,
    fireplace: fireplaceEn,
    footer: footerEn,
    header: headerEn,
    home: homeEn,
    login: loginEn,
    logout: logoutEn,
    power: powerEn,
  },
  fr: {
    common: commonFr,
    error: errorFr,
    fireplace: fireplaceFr,
    footer: footerFr,
    header: headerFr,
    home: homeFr,
    login: loginFr,
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
