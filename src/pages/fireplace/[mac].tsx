import {GetStaticProps, NextPage} from 'next';
import Link from 'next/link';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import axios from 'axios';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {Container, ToggleButton, ToggleButtonGroup, Tabs, Tab} from 'react-bootstrap';
import {configure, DeviceInfoType} from 'edilkamin';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {IconProp} from '@fortawesome/fontawesome-svg-core';
import {TokenContext} from '../../context/token';
import {ErrorContext, ErrorType} from '../../context/error';
import {useSetDeviceInfosContext} from '../../context/device-infos';
import EnvironmentInfos from '../../components/EnvironmentInfos';
import SoftwareInfos from '../../components/SoftwareInfos';

const Fireplace: NextPage<{}> = () => {
    const [t] = useTranslation('common');
    const router = useRouter();
    const mac = router.query.mac as string;
    const [info, setInfo] = useState<DeviceInfoType | null>(null);
    const [powerState, setPowerState] = useState(false);
    const [loading, setLoading] = useState(true);
    const {token} = useContext(TokenContext);
    const {addError} = useContext(ErrorContext);
    const setDeviceInfos = useSetDeviceInfosContext();
    const baseUrl = `${router.basePath}/api/proxy/`;
    const {deviceInfo, setPower} = configure(baseUrl);

    const addErrorCallback = useCallback(
        (error: ErrorType) => addError(error),
        // eslint-disable-next-line
        []
    );

    useEffect(() => {
        if (!mac || !token) return;
        const fetch = async () => {
            try {
                const data = (await deviceInfo(token, mac)).data;
                setInfo(data);
                setDeviceInfos(data);
                setPowerState(data.status.commands.power);
                setLoading(false);
            } catch (error: unknown) {
                if (axios.isAxiosError(error) && error?.response?.status === 404) {
                    addErrorCallback({
                        title: t('device_not_found'),
                        // todo
                        body: t('device_not_found_message', {mac}),
                    });
                } else if (
                    axios.isAxiosError(error) &&
                    error?.response?.data?.message !== undefined
                ) {
                    addErrorCallback({
                        title: t('unable_fetch_device_info'),
                        body: error.response.data.message,
                    });
                } else if (error instanceof Error) {
                    addErrorCallback({
                        title: t('unable_fetch_device_info'),
                        body: error.message,
                    });
                } else {
                    addErrorCallback({body: t('unable_fetch_device_info')});
                }
            }
        };
        fetch();
        // eslint-disable-next-line
    }, [addErrorCallback, mac, token]);

    const onPowerChange = (value: number) => {
        setPower(token!, mac!, value);
        setPowerState(Boolean(value));
    };

    const togglePowerProps = [
        {value: 1, label: t('on'), icon: "sun"},
        {value: 0, label: t('off'), icon: "power-off"},
    ];

    return (
        <Container>
            <div className="mb-2">
                <div className="mb-2">{t('stove')} : {mac}
                    <Link href={`/fireplace/${mac}/debug`}>Debug</Link>
                </div>
                <ToggleButtonGroup
                    type="radio"
                    name="power"
                    value={Number(powerState)}
                    onChange={onPowerChange}
                >
                    {togglePowerProps.map(({value, label, icon}) => (
                        <ToggleButton
                            id={`set-power-${value}`}
                            key={value}
                            value={value}
                            disabled={loading}
                        >
                            <FontAwesomeIcon icon={icon as IconProp}/> {label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </div>
            <Tabs
                defaultActiveKey="environment-infos"
                id="tab"
                className="mb-3"
            >
                <Tab eventKey="environment-infos" title={t('enviroment_infos')}>
                    <EnvironmentInfos />
                </Tab>
                <Tab eventKey="software-infos" title={t('software_infos')}>
                    <SoftwareInfos />
                </Tab>
            </Tabs>
        </Container>
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

export default Fireplace;
