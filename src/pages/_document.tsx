import type {DocumentProps} from 'next/document'
import Document, {Head, Html, Main, NextScript} from 'next/document';
import i18nextConfig from '../../next-i18next.config'
import config from '../../next.config';

class MyDocument extends Document<DocumentProps> {
    render() {
        const currentLocale =
            this.props.__NEXT_DATA__.locale ??
            i18nextConfig.i18n.defaultLocale;

        return (
            <Html lang={currentLocale}>
                <Head>
                    <meta charSet="utf-8" />
                    <link rel="icon" href={config.basePath ? `${config.basePath}/favicon.ico` : '/favicon.ico'} />
                    <meta name="theme-color" content="#000000" />
                    <meta
                        name="description"
                        content="Open Edilkamin for controlling pellets stoves"
                    />
                    <link rel="apple-touch-icon"
                          href={config.basePath ? `${config.basePath}/logo192.png` : '/logo192.png'} />
                    {/*
                      manifest.json provides metadata used when your web app is installed on a
                      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
                    */}
                    <link rel="manifest"
                          href={config.basePath ? `${config.basePath}/manifest.json` : '/manifest.json'} />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
