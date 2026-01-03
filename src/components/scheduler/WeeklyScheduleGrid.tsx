import { indexToTime } from "edilkamin";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { COLORS } from "../../utils/colors";
import { useIsMobile } from "../../utils/hooks";
import { MobileGridAccordion } from "./MobileGridAccordion";
import type { ScheduleValue, WeeklyScheduleGridProps } from "./types";

const SLOTS_PER_DAY = 48;

interface ScheduleValueOption {
  value: ScheduleValue;
  labelKey: string;
  bg: string;
  ring: string;
}

const SCHEDULE_VALUES: ScheduleValueOption[] = [
  {
    value: 0,
    labelKey: "scheduleValues.off",
    bg: COLORS.modes.off.bg,
    ring: COLORS.modes.off.ring,
  },
  {
    value: 1,
    labelKey: "scheduleValues.eco",
    bg: COLORS.modes.economy.bg,
    ring: COLORS.modes.economy.ring,
  },
  {
    value: 2,
    labelKey: "scheduleValues.comfort",
    bg: COLORS.modes.comfort.bg,
    ring: COLORS.modes.comfort.ring,
  },
];

function formatTime(hour: number, minute: number = 0): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function ScheduleValueSelector({
  selectedValue,
  onChange,
}: {
  selectedValue: ScheduleValue;
  onChange: (value: ScheduleValue) => void;
}) {
  const { t } = useTranslation("scheduler");

  return (
    <div className="flex gap-1 p-1 bg-zinc-800 rounded-lg">
      {SCHEDULE_VALUES.map(({ value, labelKey, bg, ring }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md transition-all
            ${selectedValue === value ? "bg-zinc-700 shadow-sm" : "hover:bg-zinc-700/50"}
          `}
        >
          <div
            className={`w-3 h-3 rounded-full ${bg} ${selectedValue === value ? `ring-2 ring-offset-1 ring-offset-zinc-800 ${ring}` : ""}`}
          />
          <span
            className={`text-sm font-medium ${selectedValue === value ? "text-white" : "text-zinc-400"}`}
          >
            {t(labelKey)}
          </span>
        </button>
      ))}
    </div>
  );
}

// Desktop grid component - extracted to avoid conditional hook issues
function DesktopGrid({
  schedule,
  onChange,
  disabled = false,
}: WeeklyScheduleGridProps) {
  const { t } = useTranslation("scheduler");
  const [paintValue, setPaintValue] = useState<ScheduleValue>(2);
  const [isPainting, setIsPainting] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const days = useMemo(
    () => [
      t("days.mon"),
      t("days.tue"),
      t("days.wed"),
      t("days.thu"),
      t("days.fri"),
      t("days.sat"),
      t("days.sun"),
    ],
    [t],
  );

  const daysFull = useMemo(
    () => [
      t("daysFull.monday"),
      t("daysFull.tuesday"),
      t("daysFull.wednesday"),
      t("daysFull.thursday"),
      t("daysFull.friday"),
      t("daysFull.saturday"),
      t("daysFull.sunday"),
    ],
    [t],
  );

  const handleSlotMouseDown = useCallback(
    (index: number) => {
      if (disabled) return;
      setIsPainting(true);
      const newSchedule = [...schedule];
      newSchedule[index] = paintValue;
      onChange(newSchedule);
    },
    [schedule, paintValue, onChange, disabled],
  );

  const handleSlotMouseEnter = useCallback(
    (index: number) => {
      setHoveredSlot(index);
      if (isPainting && !disabled) {
        const newSchedule = [...schedule];
        newSchedule[index] = paintValue;
        onChange(newSchedule);
      }
    },
    [isPainting, schedule, paintValue, onChange, disabled],
  );

  const handleMouseUp = useCallback(() => {
    setIsPainting(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  // Generate hour labels (every 2 hours)
  const hourLabels = useMemo(() => {
    const labels = [];
    for (let h = 0; h < 24; h += 2) {
      labels.push(h);
    }
    return labels;
  }, []);

  // Get background class for schedule value
  const getSlotBgClass = (value: ScheduleValue) => {
    return (
      SCHEDULE_VALUES.find((v) => v.value === value)?.bg || COLORS.modes.off.bg
    );
  };

  // Tooltip content
  const tooltipContent = useMemo(() => {
    if (hoveredSlot === null) return null;
    const { day, hour, minute } = indexToTime(hoveredSlot);
    const value = schedule[hoveredSlot];
    const valueLabel =
      SCHEDULE_VALUES.find((v) => v.value === value)?.labelKey || "unknown";
    return `${daysFull[day]} ${formatTime(hour, minute)} - ${t(valueLabel)}`;
  }, [hoveredSlot, schedule, daysFull, t]);

  return (
    <div className="space-y-4">
      {/* Paint value selector */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{t("chrono.paintMode")}:</span>
        <ScheduleValueSelector
          selectedValue={paintValue}
          onChange={setPaintValue}
        />
      </div>

      {/* Tooltip */}
      <div className="h-6 text-center">
        {tooltipContent && (
          <span className="text-sm text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
            {tooltipContent}
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[640px]">
          {/* Hour labels */}
          <div className="flex mb-1">
            <div className="w-12 shrink-0" />
            <div className="flex-1 flex">
              {hourLabels.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-center text-xs text-zinc-500 font-mono"
                >
                  {formatTime(hour)}
                </div>
              ))}
            </div>
          </div>

          {/* Days and slots */}
          {days.map((dayLabel, dayIndex) => (
            <div key={dayLabel} className="flex items-center mb-0.5">
              <div className="w-12 shrink-0 text-xs font-medium text-zinc-400 pr-2">
                {dayLabel}
              </div>
              <div className="flex-1 flex gap-px">
                {Array.from({ length: SLOTS_PER_DAY }).map((_, slotIndex) => {
                  const index = dayIndex * SLOTS_PER_DAY + slotIndex;
                  const value = schedule[index];
                  const isHourBoundary = slotIndex % 2 === 0;

                  return (
                    <button
                      key={slotIndex}
                      type="button"
                      disabled={disabled}
                      onMouseDown={() => handleSlotMouseDown(index)}
                      onMouseEnter={() => handleSlotMouseEnter(index)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      className={`
                        h-6 flex-1 transition-all duration-75
                        ${isHourBoundary ? "rounded-l-sm" : "rounded-r-sm"}
                        ${hoveredSlot === index ? "ring-2 ring-white ring-offset-1 ring-offset-zinc-900 z-10" : ""}
                        ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:brightness-110"}
                        ${getSlotBgClass(value)}
                      `}
                      aria-label={`${daysFull[dayIndex]} ${formatTime(Math.floor(slotIndex / 2), (slotIndex % 2) * 30)}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 pt-2 border-t border-zinc-800">
        {SCHEDULE_VALUES.map(({ value, labelKey, bg }) => (
          <div key={value} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${bg}`} />
            <span className="text-sm text-zinc-400">{t(labelKey)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeeklyScheduleGrid({
  schedule,
  onChange,
  disabled = false,
}: WeeklyScheduleGridProps) {
  const isMobile = useIsMobile();

  // On mobile, render the accordion layout
  if (isMobile) {
    return (
      <MobileGridAccordion
        schedule={schedule}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  // On desktop, render the desktop grid
  return (
    <DesktopGrid schedule={schedule} onChange={onChange} disabled={disabled} />
  );
}

export default WeeklyScheduleGrid;
