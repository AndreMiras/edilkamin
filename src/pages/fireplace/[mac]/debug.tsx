import {GetStaticProps, NextPage} from 'next';
import dynamic from 'next/dynamic';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import React from 'react';
import {Accordion} from 'react-bootstrap';
import {useDeviceInfosContext} from '../../../context/device-infos';

const DynamicReactJson = dynamic(import('react-json-view'), {ssr: false});

const Debug: NextPage<{}> = () => {
    const deviceInfos = useDeviceInfosContext();

    return (
        <Accordion defaultActiveKey="0" alwaysOpen={false} className="mt-2">
            <Accordion.Item eventKey="2">
                <Accordion.Header>Debug</Accordion.Header>
                <Accordion.Body>
                    <DynamicReactJson src={deviceInfos ?? {}} />
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

export const getServerSideProps: GetStaticProps = async ({
    locale,
}) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'en', [
            'common',
        ])),
    },
})

export default Debug;
