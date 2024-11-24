import type {GetStaticProps, NextPage} from 'next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations'
import Home from '../components/Home';

const Index: NextPage = () => <Home />;

export const getStaticProps: GetStaticProps = async ({
    locale,
}) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'en', [
            'common',
        ])),
    },
})

export default Index;
