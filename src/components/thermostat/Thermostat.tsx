import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import PelletWarning from "../PelletWarning";
import PowerLevelControl from "../PowerLevelControl";
import { MAX_TEMP, MIN_TEMP, TEMP_STEP } from "./constants";

interface ThermostatProps {
  temperature: number;
  environmentTemperature?: number;
  powerState: boolean;
  loading: boolean;
  onTemperatureChange: (temp: number) => void;
  onPowerChange: (value: number) => void;
  children?: ReactNode;
  isPelletInReserve?: boolean;
  pelletAutonomyTime?: number;
  powerLevel?: number;
  onPowerLevelChange?: (level: number) => void;
  isAuto?: boolean;
}

const Thermostat = ({
  temperature,
  environmentTemperature,
  powerState,
  loading,
  onTemperatureChange,
  onPowerChange,
  children,
  isPelletInReserve,
  pelletAutonomyTime,
  powerLevel,
  onPowerLevelChange,
  isAuto = false,
}: ThermostatProps) => {
  const { t } = useTranslation("fireplace");

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 touch-manipulation ${loading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="w-[340px] bg-card text-card-foreground rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
        {isPelletInReserve && pelletAutonomyTime !== undefined && (
          <PelletWarning autonomyTime={pelletAutonomyTime} />
        )}
        <div className="flex justify-center mb-6">
          <button
            className={`px-8 py-3 rounded-full border-0 text-base font-medium cursor-pointer flex items-center gap-3 transition-all ${
              powerState
                ? "bg-linear-to-br from-orange-500 to-orange-600 text-white shadow-[0_4px_15px_rgba(249,115,22,0.3)]"
                : "bg-secondary text-secondary-foreground"
            }`}
            onClick={() => onPowerChange(powerState ? 0 : 1)}
            disabled={loading}
          >
            <FontAwesomeIcon icon="power-off" />
            {powerState ? t("on") : t("off")}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 font-medium mb-4">
          <FontAwesomeIcon
            icon="fire"
            className={`text-2xl ${
              powerState
                ? "text-orange-500 animate-flicker"
                : "text-muted-foreground"
            }`}
          />
          <span>{powerState ? t("heating") : t("standby")}</span>
        </div>

        {/* Temperature controls when auto mode is ON */}
        {isAuto && (
          <div className="text-center py-8">
            <div className="text-[5rem] font-extralight leading-none">
              {temperature.toFixed(1)}
              <span className="text-[2rem] align-super opacity-50">°C</span>
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
        )}

        {/* Power level controls when auto mode is OFF */}
        {!isAuto && powerLevel !== undefined && onPowerLevelChange && (
          <PowerLevelControl
            level={powerLevel}
            environmentTemperature={environmentTemperature}
            onLevelChange={onPowerLevelChange}
            loading={loading}
          />
        )}

        {isAuto && (
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
            <button
              className="w-12 h-12 rounded-xl border-0 bg-secondary text-secondary-foreground text-xl cursor-pointer transition-all hover:bg-blue-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => onTemperatureChange(temperature - TEMP_STEP)}
              disabled={loading || temperature <= MIN_TEMP}
              aria-label={t("decreaseTemp")}
            >
              <FontAwesomeIcon icon="minus" />
            </button>
            <button
              className="w-12 h-12 rounded-xl border-0 bg-secondary text-secondary-foreground text-xl cursor-pointer transition-all hover:bg-blue-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => onTemperatureChange(temperature + TEMP_STEP)}
              disabled={loading || temperature >= MAX_TEMP}
              aria-label={t("increaseTemp")}
            >
              <FontAwesomeIcon icon="plus" />
            </button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default Thermostat;
