import {GetStaticProps, NextPage} from "next";
import dynamic from "next/dynamic";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import axios from "axios";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {useRouter} from "next/router";
import {Accordion, Container, Card, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import {configure, DeviceInfoType} from "edilkamin";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {TokenContext} from "../../context/token";
import {ErrorContext, ErrorType} from "../../context/error";

const DynamicReactJson = dynamic(import('react-json-view'), {ssr: false});

const Fireplace: NextPage<{}> = () => {
    const [t] = useTranslation('common');
    const router = useRouter();
    const mac = router.query.mac as string;
    const [info, setInfo] = useState<DeviceInfoType | null>(null);
    const [powerState, setPowerState] = useState(false);
    const [loading, setLoading] = useState(true);
    const {token} = useContext(TokenContext);
    const {addError} = useContext(ErrorContext);
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
                <div className="mb-2">{t('stove')} : {mac}</div>
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
            <Card>
                <Card.Header>
                    {t('advanced')}
                </Card.Header>
                <Card.Body>
                    {info && (
                        <ul>
                            <li>
                                {t('board_temperature')} {info.status.temperatures.board}
                                &deg;
                            </li>
                            <li>{t('environment_temperature')} {info.status.temperatures.enviroment}&deg;</li>
                            <li>
                                {t('environment_1_temperature')} {info.nvm.user_parameters.enviroment_1_temperature}&deg;
                            </li>
                            <li>
                                {t('environment_2_temperature')} {info.nvm.user_parameters.enviroment_2_temperature}&deg;
                            </li>
                            <li>
                                {t('environment_3_temperature')} {info.nvm.user_parameters.enviroment_3_temperature}&deg;
                            </li>
                            <li>{t('is_auto')} {t(String(info.nvm.user_parameters.is_auto))}</li>
                            <li>
                                {t('is_sound_active')} {t(String(info.nvm.user_parameters.is_sound_active))}
                            </li>
                        </ul>
                    )}
                </Card.Body>
            </Card>
            <Accordion defaultActiveKey="0" className="mt-2">
                <Accordion.Item eventKey="2">
                    <Accordion.Header>Debug</Accordion.Header>
                    <Accordion.Body>
                        <DynamicReactJson src={JSON.parse(JSON.stringify(info ? info : {}))}/>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
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
