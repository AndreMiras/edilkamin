import 'bootstrap/dist/css/bootstrap.min.css';

import {fab} from '@fortawesome/free-brands-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
import {fas} from '@fortawesome/free-solid-svg-icons';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import {appWithTranslation} from 'next-i18next';
import {Container} from 'react-bootstrap';

import Errors from '../components/Errors';
import Footer from '../components/Footer';
import Header from '../components/Header';
import {ErrorContextProvider} from '../context/error';
import {TokenContextProvider} from '../context/token';
import DeviceInfosContextProvider from '../context/device-infos';

// workaround SSR issue, refs:
// https://github.com/FortAwesome/Font-Awesome/issues/19348
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {library} = require('@fortawesome/fontawesome-svg-core');
library.add(fab, far, fas);


type MyAppProps = {
    pageProps: {
        _nextI18Next: {
            userConfig: {
                i18n: {
                    defaultLocale: string;
                }
            };
            initialLocale: string;
        }
    }
} & AppProps;

const MyApp = ({Component, pageProps}: MyAppProps): React.ReactElement => {
    const {_nextI18Next} = pageProps;
    const {initialLocale, userConfig} = _nextI18Next;
    const {i18n} = userConfig;
    const {defaultLocale} = i18n;
    let prefixPath = true;

    if (initialLocale === defaultLocale) {
        prefixPath = false;
    }

    return (
        <div className="App d-flex flex-column min-vh-100">
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <title>Open Edilkamin</title>
            </Head>
            <ErrorContextProvider>
                <TokenContextProvider>
                    <DeviceInfosContextProvider>
                        {/*{*/}
                        {/*    useIsLoggedIn() === true ? (*/}
                        {/*        <>*/}
                        <Header locale={initialLocale} prefixPath={prefixPath}/>
                        <Container className="mt-3">
                            <Errors/>
                            <Component {...pageProps} />
                        </Container>
                        {/*</>*/}
                        {/*) : <div>Pouet</div>*/}
                        {/*}*/}
                    </DeviceInfosContextProvider>
                </TokenContextProvider>
            </ErrorContextProvider>
            <Footer/>
        </div>
    )
};

export default appWithTranslation(MyApp);
