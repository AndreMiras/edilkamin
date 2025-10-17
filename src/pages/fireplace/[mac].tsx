import axios from "axios";
import { configure, DeviceInfoType } from "edilkamin";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Accordion, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import DebugInfo from "../../components/DebugInfo";
import DeviceDetails from "../../components/DeviceDetails";
import PowerToggle from "../../components/PowerToggle";
import TemperatureAdjuster from "../../components/TemperatureAdjuster";
import { ErrorContext } from "../../context/error";
import { TokenContext } from "../../context/token";

const Fireplace: NextPage = () => {
  const { t } = useTranslation("fireplace");
  const router = useRouter();
  const mac = router.query.mac as string;
  const [info, setInfo] = useState<DeviceInfoType | null>(null);
  const [powerState, setPowerState] = useState(false);
  const [temperature, setTemperature] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(TokenContext);
  const { addError } = useContext(ErrorContext);
  const baseUrl = "/api/proxy/";
  const { deviceInfo, setPower, setTargetTemperature } = configure(baseUrl);

  useEffect(() => {
    if (!mac || !token) return;
    const fetch = async () => {
      try {
        const data = await deviceInfo(token, mac);
        setInfo(data);
        setPowerState(data.status.commands.power);
        setTemperature(data.nvm.user_parameters.enviroment_1_temperature);
        setLoading(false);
      } catch (error: unknown) {
        console.error(error);
        if (axios.isAxiosError(error) && error?.response?.status === 404) {
          addError({
            title: t("errors.deviceNotFound"),
            body: t("errors.deviceNotFoundBody", { mac }),
          });
        } else if (
          axios.isAxiosError(error) &&
          error?.response?.data?.message !== undefined
        ) {
          addError({
            title: t("errors.couldntFetchInfo"),
            body: error.response.data.message,
          });
        } else if (error instanceof Error) {
          addError({
            title: t("errors.couldntFetchInfo"),
            body: error.message,
          });
        } else {
          addError({ body: t("errors.couldntFetchInfo") });
        }
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mac, token, t]);

  const onPowerChange = async (value: number) => {
    // set the state before hand to avoid the lag feeling
    setPowerState(Boolean(value));
    try {
      await setPower(token!, mac!, value);
    } catch (error) {
      console.error(error);
      addError({
        title: t("errors.powerUpdateFailed"),
        body: t("errors.powerUpdateBody"),
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
      addError({
        title: t("errors.temperatureUpdateFailed"),
        body: t("errors.temperatureUpdateBody"),
      });
      // rollback the temperature to the actual/previous value
      setTemperature(temperature);
    }
  };

  return (
    <Accordion defaultActiveKey="0" className="mt-2">
      <Accordion.Item eventKey="0">
        <Accordion.Header>{t("title", { mac })}</Accordion.Header>
        <Accordion.Body>
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
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>{t("advanced")}</Accordion.Header>
        <Accordion.Body>{info && <DeviceDetails info={info} />}</Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Header>{t("debug")}</Accordion.Header>
        <Accordion.Body>
          <DebugInfo info={info} />
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default Fireplace;
