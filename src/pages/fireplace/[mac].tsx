import { NextPage } from "next";
import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Accordion, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { DeviceInfoType, configure } from "edilkamin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TokenContext } from "../../context/token";
import PowerToggle from "../../components/PowerToggle";
import DeviceDetails from "../../components/DeviceDetails";
import DebugInfo from "../../components/DebugInfo";
import { ErrorContext, ErrorType } from "../../context/error";

const Fireplace: NextPage<{}> = () => {
  const router = useRouter();
  const mac = router.query.mac as string;
  const [info, setInfo] = useState<DeviceInfoType | null>(null);
  const [powerState, setPowerState] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(TokenContext);
  const { addError } = useContext(ErrorContext);
  const baseUrl = "/api/proxy/";
  const { deviceInfo, setPower } = configure(baseUrl);

  const addErrorCallback = useCallback(
    (error: ErrorType) => addError(error),
    // eslint-disable-next-line
    []
  );

  useEffect(() => {
    if (!mac || !token) return;
    const fetch = async () => {
      try {
        const data = await deviceInfo(token, mac);
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
          addErrorCallback({ body: "Couldn't fetch device info." });
        }
      }
    };
    fetch();
  }, [addErrorCallback, mac, token]);

  const onPowerChange = (value: number) => {
    setPower(token!, mac!, value);
    setPowerState(Boolean(value));
  };

  return (
    <Accordion defaultActiveKey="0" className="mt-2">
      <Accordion.Item eventKey="0">
        <Accordion.Header>Fireplace: {mac}</Accordion.Header>
        <Accordion.Body>
          <PowerToggle
            powerState={powerState}
            onChange={onPowerChange}
            loading={loading}
          />
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>Advanced</Accordion.Header>
        <Accordion.Body>{info && <DeviceDetails info={info} />}</Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Header>Debug</Accordion.Header>
        <Accordion.Body>
          <DebugInfo info={info} />
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default Fireplace;
