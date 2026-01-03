import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { COLORS, type ScheduleMode } from "../../utils/colors";

interface TemperatureCardProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  icon: IconProp;
  color: "economy" | "comfort";
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  unit?: "C" | "F";
}

const getColorConfig = (color: ScheduleMode) => {
  const modeColors = COLORS.modes[color];
  return {
    bg: modeColors.bg,
    bgHover: modeColors.bgHover,
    text: modeColors.text,
    bar: modeColors.bg,
  };
};

export function TemperatureCard({
  value,
  onChange,
  label,
  icon,
  color,
  min = 10,
  max = 30,
  step = 0.5,
  disabled = false,
  unit = "C",
}: TemperatureCardProps) {
  const colors = getColorConfig(color);

  const decrease = () => {
    if (value > min) onChange(Math.max(min, value - step));
  };

  const increase = () => {
    if (value < max) onChange(Math.min(max, value + step));
  };

  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div className="flex-1 flex flex-col rounded-xl overflow-hidden bg-zinc-800">
      <div className={`h-1 ${colors.bar}`} />
      <div className="flex items-center gap-2 px-4 pt-3">
        <FontAwesomeIcon icon={icon} className={`text-lg ${colors.text}`} />
        <span className="text-sm font-medium text-zinc-300">{label}</span>
      </div>
      <div className="flex-1 flex items-center justify-center py-4">
        <span className="text-4xl font-light text-white">
          {value.toFixed(1)}&deg;{unit}
        </span>
      </div>
      <div className="p-3 flex justify-center gap-3">
        <button
          type="button"
          onClick={decrease}
          disabled={disabled || atMin}
          className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.bgHover} disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-white`}
          aria-label={`Decrease ${label}`}
        >
          <FontAwesomeIcon icon="minus" className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={increase}
          disabled={disabled || atMax}
          className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.bgHover} disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-white`}
          aria-label={`Increase ${label}`}
        >
          <FontAwesomeIcon icon="plus" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
