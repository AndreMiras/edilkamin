import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, FormControl, InputGroup } from "react-bootstrap";

const TemperatureAdjuster = ({
  currentTemperature,
  onTemperatureChange,
  loading,
}: {
  currentTemperature: number;
  onTemperatureChange: (newTemperature: number) => void;
  loading: boolean;
}) => (
  <InputGroup size="lg">
    <Button
      variant="primary"
      onClick={() => onTemperatureChange(currentTemperature - 0.5)}
      disabled={loading}
    >
      <FontAwesomeIcon icon={"minus"} />
    </Button>
    <FormControl
      type="number"
      value={currentTemperature}
      onChange={(e) => onTemperatureChange(Number(e.target.value))}
      disabled={loading}
    />
    <Button
      variant="primary"
      onClick={() => onTemperatureChange(currentTemperature + 0.5)}
      disabled={loading}
    >
      <FontAwesomeIcon icon={"plus"} />
    </Button>
  </InputGroup>
);

export default TemperatureAdjuster;
