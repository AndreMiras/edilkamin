import "@fortawesome/fontawesome-svg-core/styles.css";
import "../styles/globals.css";

import { config, library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import type { AppProps } from "next/app";
import Head from "next/head";
import { I18nextProvider } from "react-i18next";

import Errors from "../components/Errors";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LanguageInitializer from "../components/LanguageInitializer";
import ThemeInitializer from "../components/ThemeInitializer";
import { BluetoothProvider } from "../context/bluetooth";
import { ErrorContextProvider } from "../context/error";
import { ThemeContextProvider } from "../context/theme";
import { TokenContextProvider } from "../context/token";
import i18n from "../i18n";

// Prevent FontAwesome from adding CSS automatically since we import it above
// This fixes hydration mismatch issues with SSR
config.autoAddCss = false;
library.add(fab, far, fas);

const MyApp = ({ Component, pageProps }: AppProps): React.ReactElement => (
  <I18nextProvider i18n={i18n}>
    <div className="App flex flex-col min-h-screen pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <title>Open Edilkamin</title>
      </Head>
      <LanguageInitializer />
      <ErrorContextProvider>
        <TokenContextProvider>
          <BluetoothProvider>
            <ThemeContextProvider>
              <ThemeInitializer />
              <Header />
              <div className="flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 w-full">
                <Errors />
                <Component {...pageProps} />
              </div>
            </ThemeContextProvider>
          </BluetoothProvider>
        </TokenContextProvider>
      </ErrorContextProvider>
      <Footer />
    </div>
  </I18nextProvider>
);

export default MyApp;
