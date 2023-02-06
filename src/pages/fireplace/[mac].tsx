import {GetStaticProps, NextPage} from "next";
import dynamic from "next/dynamic";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import axios from "axios";
import React, {useCallback, useContext, useEffect, useState} from "react";
import loadable from '@loadable/component';
import {useRouter} from "next/router";
import {Accordion, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import {configure, DeviceInfoType} from "edilkamin";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {TokenContext} from "../../context/token";
import {ErrorContext, ErrorType} from "../../context/error";

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

const Fireplace: NextPage<{}> = () => {
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
                        title: "Device not found",
                        body: `The address provided ("${mac}") is invalid or the device is not registered.`,
                    });
                } else if (
                    axios.isAxiosError(error) &&
                    error?.response?.data?.message !== undefined
                ) {
                    addErrorCallback({
                        title: "Couldn't fetch device info.",
                        body: error.response.data.message,
                    });
                } else if (error instanceof Error) {
                    addErrorCallback({
                        title: "Couldn't fetch device info.",
                        body: error.message,
                    });
                } else {
                    addErrorCallback({body: "Couldn't fetch device info."});
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
        {value: 1, label: "On", icon: "sun"},
        {value: 0, label: "Off", icon: "power-off"},
    ];

    return (
        <>
            <div>
                <div>Fireplace: {mac}</div>
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
            <div>
                <div>Advanced</div>
                {info && (
                    <ul>
                        <li>
                            board: {info.status.temperatures.board}
                            &deg;
                        </li>
                        <li>enviroment: {info.status.temperatures.enviroment}&deg;</li>
                        <li>
                            enviroment_1_temperature:{" "}
                            {info.nvm.user_parameters.enviroment_1_temperature}&deg;
                        </li>
                        <li>
                            enviroment_2_temperature:{" "}
                            {info.nvm.user_parameters.enviroment_2_temperature}&deg;
                        </li>
                        <li>
                            enviroment_3_temperature:{" "}
                            {info.nvm.user_parameters.enviroment_3_temperature}&deg;
                        </li>
                        <li>is_auto: {String(info.nvm.user_parameters.is_auto)}</li>
                        <li>
                            is_sound_active:{" "}
                            {String(info.nvm.user_parameters.is_sound_active)}
                        </li>
                    </ul>
                )}
            </div>
            <Accordion defaultActiveKey="0" className="mt-2">
                <Accordion.Item eventKey="2">
                    <Accordion.Header>Debug</Accordion.Header>
                    <Accordion.Body>
                        <DynamicReactJson src={JSON.parse(JSON.stringify(info ? info : {}))}/>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </>
    );
};

export const getServerSideProps: GetStaticProps = async ({
    locale,
}) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'en', [
            'common',
            // 'footer',
        ])),
    },
})

export default Fireplace;
