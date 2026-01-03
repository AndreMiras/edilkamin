import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import authEn from "../public/locales/en/auth.json";
import commonEn from "../public/locales/en/common.json";
import errorEn from "../public/locales/en/error.json";
import footerEn from "../public/locales/en/footer.json";
import headerEn from "../public/locales/en/header.json";
import homeEn from "../public/locales/en/home.json";
import loginEn from "../public/locales/en/login.json";
import logoutEn from "../public/locales/en/logout.json";
import powerEn from "../public/locales/en/power.json";
import schedulerEn from "../public/locales/en/scheduler.json";
import stoveEn from "../public/locales/en/stove.json";
import authEs from "../public/locales/es/auth.json";
import commonEs from "../public/locales/es/common.json";
import errorEs from "../public/locales/es/error.json";
import footerEs from "../public/locales/es/footer.json";
import headerEs from "../public/locales/es/header.json";
import homeEs from "../public/locales/es/home.json";
import loginEs from "../public/locales/es/login.json";
import logoutEs from "../public/locales/es/logout.json";
import powerEs from "../public/locales/es/power.json";
import schedulerEs from "../public/locales/es/scheduler.json";
import stoveEs from "../public/locales/es/stove.json";
import authFr from "../public/locales/fr/auth.json";
import commonFr from "../public/locales/fr/common.json";
import errorFr from "../public/locales/fr/error.json";
import footerFr from "../public/locales/fr/footer.json";
import headerFr from "../public/locales/fr/header.json";
import homeFr from "../public/locales/fr/home.json";
import loginFr from "../public/locales/fr/login.json";
import logoutFr from "../public/locales/fr/logout.json";
import powerFr from "../public/locales/fr/power.json";
import schedulerFr from "../public/locales/fr/scheduler.json";
import stoveFr from "../public/locales/fr/stove.json";

const resources = {
  en: {
    auth: authEn,
    common: commonEn,
    error: errorEn,
    stove: stoveEn,
    footer: footerEn,
    header: headerEn,
    home: homeEn,
    login: loginEn,
    logout: logoutEn,
    power: powerEn,
    scheduler: schedulerEn,
  },
  fr: {
    auth: authFr,
    common: commonFr,
    error: errorFr,
    stove: stoveFr,
    footer: footerFr,
    header: headerFr,
    home: homeFr,
    login: loginFr,
    logout: logoutFr,
    power: powerFr,
    scheduler: schedulerFr,
  },
  es: {
    auth: authEs,
    common: commonEs,
    error: errorEs,
    stove: stoveEs,
    footer: footerEs,
    header: headerEs,
    home: homeEs,
    login: loginEs,
    logout: logoutEs,
    power: powerEs,
    scheduler: schedulerEs,
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
