import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { indexToTime } from "edilkamin";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ScheduleValue, WeeklyScheduleGridProps } from "./types";

const SLOTS_PER_DAY = 48;
const SLOTS_PER_ROW = 12;
const ROWS_PER_DAY = 4;

interface ScheduleValueOption {
  value: ScheduleValue;
  labelKey: string;
  color: string;
}

const SCHEDULE_VALUES: ScheduleValueOption[] = [
  { value: 0, labelKey: "scheduleValues.off", color: "#374151" },
  { value: 1, labelKey: "scheduleValues.eco", color: "#059669" },
  { value: 2, labelKey: "scheduleValues.comfort", color: "#f97316" },
];

const ROW_START_HOURS = [0, 6, 12, 18];

function formatTime(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
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
      {SCHEDULE_VALUES.map(({ value, labelKey, color }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`
            flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all text-xs
            ${selectedValue === value ? "bg-zinc-700 shadow-sm" : "hover:bg-zinc-700/50"}
          `}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full ${selectedValue === value ? "ring-2 ring-offset-1 ring-offset-zinc-800" : ""}`}
            style={{
              backgroundColor: color,
              ...(selectedValue === value
                ? ({ "--tw-ring-color": color } as React.CSSProperties)
                : {}),
            }}
          />
          <span
            className={`font-medium ${selectedValue === value ? "text-white" : "text-zinc-400"}`}
          >
            {t(labelKey)}
          </span>
        </button>
      ))}
    </div>
  );
}

// Compact bar showing schedule preview for a day
function DayPreviewBar({
  schedule,
  dayIndex,
}: {
  schedule: ScheduleValue[];
  dayIndex: number;
}) {
  const daySlots = useMemo(() => {
    const startIndex = dayIndex * SLOTS_PER_DAY;
    return schedule.slice(startIndex, startIndex + SLOTS_PER_DAY);
  }, [schedule, dayIndex]);

  const getSlotColor = (value: ScheduleValue) => {
    return SCHEDULE_VALUES.find((v) => v.value === value)?.color || "#374151";
  };

  // Group consecutive slots with same value for smoother rendering
  const segments = useMemo(() => {
    const result: { value: ScheduleValue; count: number }[] = [];
    let current: { value: ScheduleValue; count: number } | null = null;

    for (const slot of daySlots) {
      if (current && current.value === slot) {
        current.count++;
      } else {
        if (current) result.push(current);
        current = { value: slot, count: 1 };
      }
    }
    if (current) result.push(current);

    return result;
  }, [daySlots]);

  return (
    <div className="flex h-3 rounded-sm overflow-hidden">
      {segments.map((segment, i) => (
        <div
          key={i}
          className="h-full"
          style={{
            backgroundColor: getSlotColor(segment.value),
            flex: segment.count,
          }}
        />
      ))}
    </div>
  );
}

export function MobileGridAccordion({
  schedule,
  onChange,
  disabled = false,
}: WeeklyScheduleGridProps) {
  const { t } = useTranslation("scheduler");
  const [paintValue, setPaintValue] = useState<ScheduleValue>(2);
  const [isPainting, setIsPainting] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
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

  const getSlotIndex = useCallback(
    (dayIndex: number, rowIndex: number, slotInRow: number) => {
      return dayIndex * SLOTS_PER_DAY + rowIndex * SLOTS_PER_ROW + slotInRow;
    },
    [],
  );

  const handleSlotMouseDown = useCallback(
    (dayIndex: number, rowIndex: number, slotInRow: number) => {
      if (disabled) return;
      setIsPainting(true);
      const index = getSlotIndex(dayIndex, rowIndex, slotInRow);
      const newSchedule = [...schedule];
      newSchedule[index] = paintValue;
      onChange(newSchedule);
    },
    [schedule, paintValue, onChange, disabled, getSlotIndex],
  );

  const handleSlotMouseEnter = useCallback(
    (dayIndex: number, rowIndex: number, slotInRow: number) => {
      const index = getSlotIndex(dayIndex, rowIndex, slotInRow);
      setHoveredSlot(index);
      if (isPainting && !disabled) {
        const newSchedule = [...schedule];
        newSchedule[index] = paintValue;
        onChange(newSchedule);
      }
    },
    [isPainting, schedule, paintValue, onChange, disabled, getSlotIndex],
  );

  // Touch event handlers for mobile paint mode
  const handleTouchStart = useCallback(
    (dayIndex: number, rowIndex: number, slotInRow: number) => {
      if (disabled) return;
      setIsPainting(true);
      const index = getSlotIndex(dayIndex, rowIndex, slotInRow);
      const newSchedule = [...schedule];
      newSchedule[index] = paintValue;
      onChange(newSchedule);
    },
    [schedule, paintValue, onChange, disabled, getSlotIndex],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPainting || disabled) return;
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element?.hasAttribute("data-slot-index")) {
        const index = parseInt(
          element.getAttribute("data-slot-index") || "0",
          10,
        );
        if (schedule[index] !== paintValue) {
          const newSchedule = [...schedule];
          newSchedule[index] = paintValue;
          onChange(newSchedule);
        }
      }
    },
    [isPainting, schedule, paintValue, onChange, disabled],
  );

  const handleMouseUp = useCallback(() => {
    setIsPainting(false);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPainting(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseUp, handleTouchEnd]);

  const getSlotColor = (value: ScheduleValue) => {
    return SCHEDULE_VALUES.find((v) => v.value === value)?.color || "#374151";
  };

  const tooltipContent = useMemo(() => {
    if (hoveredSlot === null) return null;
    const { day, hour, minute } = indexToTime(hoveredSlot);
    const value = schedule[hoveredSlot];
    const valueLabel =
      SCHEDULE_VALUES.find((v) => v.value === value)?.labelKey || "unknown";
    return `${daysFull[day]} ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} - ${t(valueLabel)}`;
  }, [hoveredSlot, schedule, daysFull, t]);

  // Expanded day view
  if (expandedDay !== null) {
    return (
      <div className="space-y-4" onTouchMove={handleTouchMove}>
        {/* Back button */}
        <button
          type="button"
          onClick={() => setExpandedDay(null)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon="chevron-left" className="w-3 h-3" />
          {t("chrono.backToWeek")}
        </button>

        {/* Day title */}
        <h4 className="text-lg font-semibold text-white">
          {daysFull[expandedDay]}
        </h4>

        {/* Paint value selector */}
        <div className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">
            {t("chrono.paintMode")}:
          </span>
          <ScheduleValueSelector
            selectedValue={paintValue}
            onChange={setPaintValue}
          />
        </div>

        {/* Tooltip */}
        <div className="h-5 text-center">
          {tooltipContent && (
            <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
              {tooltipContent}
            </span>
          )}
        </div>

        {/* Grid - 4 rows of 12 slots */}
        <div className="space-y-2">
          {Array.from({ length: ROWS_PER_DAY }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-2">
              <div className="w-12 shrink-0 text-xs font-mono text-zinc-500">
                {formatTime(ROW_START_HOURS[rowIndex])}
              </div>
              <div className="flex-1 flex gap-px">
                {Array.from({ length: SLOTS_PER_ROW }).map((_, slotInRow) => {
                  const index = getSlotIndex(expandedDay, rowIndex, slotInRow);
                  const value = schedule[index];
                  const isHourBoundary = slotInRow % 2 === 0;

                  return (
                    <button
                      key={slotInRow}
                      type="button"
                      disabled={disabled}
                      data-slot-index={index}
                      onMouseDown={() =>
                        handleSlotMouseDown(expandedDay, rowIndex, slotInRow)
                      }
                      onMouseEnter={() =>
                        handleSlotMouseEnter(expandedDay, rowIndex, slotInRow)
                      }
                      onMouseLeave={() => setHoveredSlot(null)}
                      onTouchStart={() =>
                        handleTouchStart(expandedDay, rowIndex, slotInRow)
                      }
                      className={`
                        h-8 flex-1 transition-all duration-75
                        ${isHourBoundary ? "rounded-l-sm" : "rounded-r-sm"}
                        ${hoveredSlot === index ? "ring-2 ring-white ring-offset-1 ring-offset-zinc-900 z-10" : ""}
                        ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:brightness-110"}
                      `}
                      style={{ backgroundColor: getSlotColor(value) }}
                      aria-label={`${daysFull[expandedDay]} ${formatTime(ROW_START_HOURS[rowIndex] + Math.floor(slotInRow / 2))}:${(slotInRow % 2) * 30}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 pt-2 border-t border-zinc-800">
          {SCHEDULE_VALUES.map(({ value, labelKey, color }) => (
            <div key={value} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-zinc-400">{t(labelKey)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Week overview
  return (
    <div className="space-y-4">
      {/* Instructions */}
      <p className="text-sm text-zinc-400">{t("chrono.tapToEdit")}</p>

      {/* Week overview */}
      <div className="space-y-2">
        {days.map((dayLabel, dayIndex) => (
          <button
            key={dayLabel}
            type="button"
            onClick={() => setExpandedDay(dayIndex)}
            className="w-full flex items-center gap-3 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-left"
          >
            <div className="w-10 shrink-0 text-sm font-medium text-zinc-300">
              {dayLabel}
            </div>
            <div className="flex-1">
              <DayPreviewBar schedule={schedule} dayIndex={dayIndex} />
            </div>
            <FontAwesomeIcon
              icon="chevron-right"
              className="w-3 h-3 text-zinc-500"
            />
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 pt-2 border-t border-zinc-800">
        {SCHEDULE_VALUES.map(({ value, labelKey, color }) => (
          <div key={value} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-zinc-400">{t(labelKey)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MobileGridAccordion;
