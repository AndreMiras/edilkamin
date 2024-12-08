import { InputGroup, FormControl } from "react-bootstrap";

const TemperatureAdjuster = ({
  currentTemperature,
  onTemperatureChange,
  loading,
}: {
  currentTemperature: number;
  onTemperatureChange: (newTemperature: number) => void;
  loading: boolean;
}) => (
  <InputGroup className="mb-3">
    <FormControl
      type="number"
      value={currentTemperature}
      onChange={(e) => onTemperatureChange(Number(e.target.value))}
      disabled={loading}
    />
  </InputGroup>
);

export default TemperatureAdjuster;
