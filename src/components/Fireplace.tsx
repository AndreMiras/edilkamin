import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Accordion, Button, ButtonGroup } from "react-bootstrap";
import { deviceInfo, setPowerOff, setPowerOn } from "edilkamin";

const Fireplace = (): JSX.Element => {
  const { mac } = useParams<"mac">();
  // TODO: export type
  const [info, setInfo] = useState<any | null>(null);

  useEffect(() => {
    const fetch = async () => {
      mac && setInfo(await deviceInfo(mac));
    };
    fetch();
  }, [mac]);

  return (
    <>
      <h2>Fireplace: {mac}</h2>
      <ButtonGroup>
        <Button onClick={() => setPowerOn(mac!)}>On</Button>
        <Button onClick={() => setPowerOff(mac!)}>Off</Button>
      </ButtonGroup>
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
