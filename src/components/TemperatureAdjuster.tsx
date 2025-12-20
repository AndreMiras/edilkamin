import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TemperatureAdjuster = ({
  currentTemperature,
  onTemperatureChange,
  loading,
}: {
  currentTemperature: number;
  onTemperatureChange: (newTemperature: number) => void;
  loading: boolean;
}) => (
  <div className="inline-flex items-center">
    <button
      onClick={() => onTemperatureChange(currentTemperature - 0.5)}
      disabled={loading}
      className="px-4 py-3 text-lg bg-primary text-primary-foreground rounded-l-lg hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="Decrease temperature"
    >
      <FontAwesomeIcon icon="minus" />
    </button>
    <input
      type="number"
      value={currentTemperature}
      onChange={(e) => onTemperatureChange(Number(e.target.value))}
      disabled={loading}
      className="w-24 px-4 py-3 text-lg text-center border-y border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed"
    />
    <button
      onClick={() => onTemperatureChange(currentTemperature + 0.5)}
      disabled={loading}
      className="px-4 py-3 text-lg bg-primary text-primary-foreground rounded-r-lg hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="Increase temperature"
    >
      <FontAwesomeIcon icon="plus" />
    </button>
  </div>
);

export default TemperatureAdjuster;
