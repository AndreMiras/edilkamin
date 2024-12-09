import {NextPage} from 'next';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {useTranslation} from 'next-i18next';
import axios from 'axios';
import {configure, DeviceInfoType} from 'edilkamin';
import {useCallback, useContext, useEffect, useState} from 'react';
import {Container, Row, Col, Tabs, Tab} from 'react-bootstrap';
import PowerToggle from "../../components/PowerToggle";
import TemperatureAdjuster from "../../components/TemperatureAdjuster";
import {TokenContext} from '../../context/token';
import {ErrorContext, ErrorType} from '../../context/error';
import {useSetDeviceInfosContext} from '../../context/device-infos';
import EnvironmentInfos from '../../components/EnvironmentInfos';
import SoftwareInfos from '../../components/SoftwareInfos';


const Fireplace: NextPage = () => {
    const [t] = useTranslation('common');
    const router = useRouter();
    const mac = router.query.mac as string;
    const [info, setInfo] = useState<DeviceInfoType | null>(null);
    const [powerState, setPowerState] = useState(false);
    const [temperature, setTemperature] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const {token} = useContext(TokenContext);
    const {addError} = useContext(ErrorContext);
    const setDeviceInfos = useSetDeviceInfosContext();
    const baseUrl = `${router.basePath}/api/proxy/`;
    const {deviceInfo, setPower, setTargetTemperature} = configure(baseUrl);

    const addErrorCallback = useCallback(
        (error: ErrorType) => addError(error),

        []
    );

    useEffect(() => {
        if (!mac || !token) return;
        const fetch = async () => {
            try {
                const data = await deviceInfo(token, mac);
                setInfo(data);
                setDeviceInfos(data);
                setPowerState(data.status.commands.power);
                setTemperature(data.nvm.user_parameters.enviroment_1_temperature);
                setLoading(false);
            } catch (error: unknown) {
                console.error(error);
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

    const onPowerChange = async (value: number) => {
        // set the state before hand to avoid the lag feeling
        setPowerState(Boolean(value));
        try {
            await setPower(token!, mac!, value);
        } catch (error) {
            console.error(error);
            addErrorCallback({
                title: "Power State Update Failed",
                body: "Unable to change the power state. Please try again.",
            });
            // rollback to the actual/previous value
            setPowerState(powerState);
        }
    };

  const onTemperatureChange = async (newTemperature: number) => {
    // set the state before hand to avoid the lag feeling
    setTemperature(newTemperature);
    try {
      await setTargetTemperature(token!, mac!, newTemperature);
    } catch (error) {
      console.error(error);
      addErrorCallback({
        title: 'Temperature Update Failed',
        body: 'Unable to update the temperature. Please try again.',
      });
      // rollback the temperature to the actual/previous value
      setTemperature(temperature);
    }
  };

    return (
        <Container>
            <div className="mb-2">
                <div className="mb-2">{t('stove')} : {mac}
                    <Link href={`/fireplace/${mac}/debug`}>Debug</Link>
                </div>
                <Row>
                    <Col xs={12} className="mb-2">
                        <PowerToggle
                            powerState={powerState}
                            onChange={onPowerChange}
                            loading={loading}
                        />
                    </Col>
                    <Col xs={8} sm={5} lg={3}>
                        <TemperatureAdjuster
                            currentTemperature={temperature}
                            onTemperatureChange={onTemperatureChange}
                            loading={loading}
                        />
                    </Col>
                </Row>
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
