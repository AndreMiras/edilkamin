import { createEmptySchedule, createWorkWeekSchedule } from "edilkamin";
import { useTranslation } from "react-i18next";

import type { QuickPresetsProps, ScheduleValue } from "./types";

const TOTAL_SLOTS = 336;

export function QuickPresets({ onApply, disabled = false }: QuickPresetsProps) {
  const { t } = useTranslation("scheduler");

  const presets = [
    {
      name: t("presets.clearAll"),
      description: t("presets.clearAllDesc"),
      action: () =>
        onApply(createEmptySchedule() as unknown as ScheduleValue[]),
    },
    {
      name: t("presets.workWeek"),
      description: t("presets.workWeekDesc"),
      action: () =>
        onApply(
          createWorkWeekSchedule({
            morningStart: 6,
            morningEnd: 9,
            eveningStart: 17,
            eveningEnd: 22,
          }) as unknown as ScheduleValue[],
        ),
    },
    {
      name: t("presets.earlyBird"),
      description: t("presets.earlyBirdDesc"),
      action: () =>
        onApply(
          createWorkWeekSchedule({
            morningStart: 5,
            morningEnd: 8,
            eveningStart: 16,
            eveningEnd: 21,
          }) as unknown as ScheduleValue[],
        ),
    },
    {
      name: t("presets.allComfort"),
      description: t("presets.allComfortDesc"),
      action: () =>
        onApply(new Array(TOTAL_SLOTS).fill(2) as unknown as ScheduleValue[]),
    },
  ];

  return (
    <div className="space-y-2">
      <span className="text-sm text-zinc-400">{t("presets.title")}:</span>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={preset.action}
            disabled={disabled}
            className="text-left p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div className="text-sm font-medium text-white">{preset.name}</div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {preset.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickPresets;
