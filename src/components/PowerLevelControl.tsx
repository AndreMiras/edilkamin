import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import {
  MAX_POWER_LEVEL,
  MIN_POWER_LEVEL,
  POWER_LEVEL_STEP,
} from "./thermostat/constants";

interface PowerLevelControlProps {
  level: number;
  environmentTemperature?: number;
  onLevelChange: (level: number) => void;
  loading: boolean;
}

const PowerLevelControl = ({
  level,
  environmentTemperature,
  onLevelChange,
  loading,
}: PowerLevelControlProps) => {
  const { t } = useTranslation("fireplace");

  return (
    <>
      <div className="text-center py-8">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          {t("powerLevel.label")}
        </div>
        <div className="text-[5rem] font-extralight leading-none">
          {level}
          <span className="text-[2rem] align-super opacity-50">
            /{MAX_POWER_LEVEL}
          </span>
        </div>
        {environmentTemperature !== undefined && (
          <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
            <FontAwesomeIcon icon="thermometer-half" className="text-lg" />
            <span className="text-base">
              {t("currentTemp")}: {environmentTemperature.toFixed(1)}°C
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
        <button
          className="w-12 h-12 rounded-xl border-0 bg-secondary text-secondary-foreground text-xl cursor-pointer transition-all hover:bg-orange-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onLevelChange(level - POWER_LEVEL_STEP)}
          disabled={loading || level <= MIN_POWER_LEVEL}
          aria-label={t("powerLevel.decrease")}
        >
          <FontAwesomeIcon icon="minus" />
        </button>
        <button
          className="w-12 h-12 rounded-xl border-0 bg-secondary text-secondary-foreground text-xl cursor-pointer transition-all hover:bg-orange-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onLevelChange(level + POWER_LEVEL_STEP)}
          disabled={loading || level >= MAX_POWER_LEVEL}
          aria-label={t("powerLevel.increase")}
        >
          <FontAwesomeIcon icon="plus" />
        </button>
      </div>
    </>
  );
};

export default PowerLevelControl;
