import { useTranslation } from "react-i18next";

interface FanSpeedControlProps {
  fanNumber: 1 | 2 | 3;
  speed: number;
  onSpeedChange: (speed: number) => void;
  loading: boolean;
  disabled?: boolean;
  maxSpeed?: number;
}

const FanSpeedControl = ({
  fanNumber,
  speed,
  onSpeedChange,
  loading,
  disabled = false,
  maxSpeed = 5,
}: FanSpeedControlProps) => {
  const { t } = useTranslation("fireplace");

  return (
    <div className="py-2">
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        {t("fanSpeed.label", { number: fanNumber })}
      </label>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground w-4">0</span>
        <input
          type="range"
          min={0}
          max={maxSpeed}
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          disabled={loading || disabled}
          className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed accent-primary"
        />
        <span className="text-sm text-muted-foreground w-4">{maxSpeed}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1 text-center">
        {speed === 0 ? t("fanSpeed.off") : t("fanSpeed.current", { speed })}
      </p>
    </div>
  );
};

export default FanSpeedControl;
