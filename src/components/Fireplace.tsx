import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Accordion, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { DeviceInfoType, deviceInfo, setPower } from "edilkamin";

const Fireplace = (): JSX.Element => {
  const { mac } = useParams<"mac">();
  const [info, setInfo] = useState<DeviceInfoType | null>(null);
  const [powerState, setPowerState] = useState(false);

  useEffect(() => {
    if (!mac) return;
    const fetch = async () => {
      const data = (await deviceInfo(mac)).data;
      setInfo(data);
      setPowerState(Boolean(data.status.commands.power));
    };
    fetch();
  }, [mac]);

  const onPowerChange = (value: number) => {
    setPower(mac!, value);
  };
  const togglePowerProps = [
    { value: 1, label: "On" },
    { value: 0, label: "Off" },
  ];

  return (
    <>
      <h2>Fireplace: {mac}</h2>
      <ToggleButtonGroup
        type="radio"
        name="power"
        defaultValue={Number(powerState)}
        onChange={onPowerChange}
      >
        {togglePowerProps.map(({ value, label }) => (
          <ToggleButton id={`set-power-${value}`} key={value} value={value}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Accordion defaultActiveKey="0" className="mt-2">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Debug</Accordion.Header>
          <Accordion.Body>
            <pre>{JSON.stringify(info, null, 2)}</pre>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
};

export default Fireplace;
