import { useTranslation } from "react-i18next";

import type { EasyTimerSectionProps } from "./types";

const TIMER_PRESETS = [30, 60, 90, 120, 180, 240];

function ToggleSwitch({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2
        ${enabled ? "bg-orange-500" : "bg-zinc-600"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-6 w-6 transform rounded-full
          bg-white shadow-lg ring-0 transition duration-200 ease-in-out
          ${enabled ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}

function formatDuration(
  minutes: number,
  tMinutes: string,
  tHours: string,
  tHour: string,
): string {
  if (minutes < 60) return `${minutes} ${tMinutes}`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins > 0) return `${hours}h ${mins}m`;
  return `${hours} ${hours > 1 ? tHours : tHour}`;
}

export function EasyTimerSection({
  easyTimer,
  onChange,
  disabled = false,
}: EasyTimerSectionProps) {
  const { t } = useTranslation("scheduler");

  const tMinutes = t("easyTimer.minutes");
  const tHours = t("easyTimer.hours");
  const tHour = t("easyTimer.hour");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {t("easyTimer.title")}
          </h3>
          <p className="text-sm text-zinc-400">{t("easyTimer.description")}</p>
        </div>
        <ToggleSwitch
          enabled={easyTimer.active}
          onChange={(active) => onChange({ ...easyTimer, active })}
          disabled={disabled}
        />
      </div>

      {easyTimer.active && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Current timer display */}
          <div className="text-center py-4 bg-zinc-800 rounded-xl">
            <div className="text-4xl font-mono text-orange-500 font-bold">
              {formatDuration(easyTimer.time, tMinutes, tHours, tHour)}
            </div>
            <div className="text-sm text-zinc-500 mt-1">
              {t("easyTimer.untilShutoff")}
            </div>
          </div>

          {/* Preset buttons */}
          <div className="grid grid-cols-3 gap-2">
            {TIMER_PRESETS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => onChange({ ...easyTimer, time: minutes })}
                disabled={disabled}
                className={`
                  py-2 px-3 rounded-lg text-sm font-medium transition-all
                  ${
                    easyTimer.time === minutes
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {formatDuration(minutes, tMinutes, tHours, tHour)}
              </button>
            ))}
          </div>

          {/* Custom time slider */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">
              {t("easyTimer.customDuration")}:{" "}
              {formatDuration(easyTimer.time, tMinutes, tHours, tHour)}
            </label>
            <input
              type="range"
              min={15}
              max={480}
              step={15}
              value={easyTimer.time}
              onChange={(e) =>
                onChange({ ...easyTimer, time: parseInt(e.target.value) })
              }
              disabled={disabled}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform
                         [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>15 {tMinutes}</span>
              <span>8 {tHours}</span>
            </div>
          </div>

          {/* Cancel button */}
          <button
            type="button"
            onClick={() => onChange({ active: false, time: 0 })}
            disabled={disabled}
            className="w-full py-2 px-4 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t("easyTimer.cancelTimer")}
          </button>
        </div>
      )}
    </div>
  );
}

export default EasyTimerSection;
