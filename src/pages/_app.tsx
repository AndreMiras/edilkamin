import type { AppProps } from "next/app";
import Head from "next/head";
import { Container } from "react-bootstrap";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import Errors from "../components/Errors";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { TokenContextProvider } from "../context/token";
import { ErrorContextProvider } from "../context/error";
import "bootstrap/dist/css/bootstrap.min.css";

library.add(fab, far, fas);

const MyApp = ({ Component, pageProps }: AppProps): React.ReactElement => (
  <div className="App d-flex flex-column min-vh-100">
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Open Edilkamin</title>
    </Head>
    <ErrorContextProvider>
      <TokenContextProvider>
        <Header />
        <Container className="mt-3">
          <Errors />
          <Component {...pageProps} />
        </Container>
      </TokenContextProvider>
    </ErrorContextProvider>
    <Footer />
  </div>
);

export default MyApp;
