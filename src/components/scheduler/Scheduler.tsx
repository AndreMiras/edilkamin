import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { COLORS } from "../../utils/colors";
import { EasyTimerSection } from "./EasyTimerSection";
import { QuickPresets } from "./QuickPresets";
import { TemperatureCardsSection } from "./TemperatureCardsSection";
import type { SchedulerProps, ScheduleValue } from "./types";
import { WeeklyScheduleGrid } from "./WeeklyScheduleGrid";

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
        ${enabled ? COLORS.accent.primary.bg : COLORS.accent.primary.bgInactive}
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

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg
        font-medium transition-all
        ${
          active
            ? `${COLORS.accent.primary.bg} text-white shadow-lg ${COLORS.accent.primary.shadow}`
            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
        }
      `}
    >
      {icon}
      {children}
    </button>
  );
}

export function Scheduler({
  chronoSettings,
  easyTimer,
  onChronoSettingsChange,
  onEasyTimerChange,
  onSave,
  onDiscard,
  hasUnsavedChanges = false,
  isSaving = false,
  isLoading = false,
  disabled = false,
  temperatureUnit = "C",
}: SchedulerProps) {
  const { t } = useTranslation("scheduler");
  const [activeTab, setActiveTab] = useState<"chrono" | "timer">("chrono");

  const handleChronoEnabledChange = (enabled: boolean) => {
    onChronoSettingsChange({ ...chronoSettings, enabled });
  };

  const handleComfortTemperatureChange = (temp: number) => {
    onChronoSettingsChange({ ...chronoSettings, comfortTemperature: temp });
  };

  const handleEconomyTemperatureChange = (temp: number) => {
    onChronoSettingsChange({ ...chronoSettings, economyTemperature: temp });
  };

  const handleScheduleChange = (schedule: ScheduleValue[]) => {
    onChronoSettingsChange({ ...chronoSettings, schedule });
  };

  const isDisabled = disabled || isLoading;

  return (
    <div className="bg-zinc-900 text-white rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-zinc-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FontAwesomeIcon
            icon="clock"
            className={COLORS.accent.primary.text}
          />
          {t("title")}
        </h2>
        <p className="text-zinc-500 text-sm mt-1">{t("description")}</p>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-4 border-b border-zinc-800">
        <div className="flex gap-2">
          <TabButton
            active={activeTab === "chrono"}
            onClick={() => setActiveTab("chrono")}
            icon={<FontAwesomeIcon icon="calendar-days" className="w-5 h-5" />}
          >
            {t("tabs.weeklySchedule")}
          </TabButton>
          <TabButton
            active={activeTab === "timer"}
            onClick={() => setActiveTab("timer")}
            icon={<FontAwesomeIcon icon="stopwatch" className="w-5 h-5" />}
          >
            {t("tabs.easyTimer")}
          </TabButton>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className={`w-8 h-8 border-2 ${COLORS.accent.primary.border} border-t-transparent rounded-full animate-spin`}
            />
          </div>
        ) : activeTab === "chrono" ? (
          <div className="space-y-6">
            {/* Chrono Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {t("chrono.title")}
                </h3>
                <p className="text-sm text-zinc-400">
                  {t("chrono.description")}
                </p>
              </div>
              <ToggleSwitch
                enabled={chronoSettings.enabled}
                onChange={handleChronoEnabledChange}
                disabled={isDisabled}
              />
            </div>

            {chronoSettings.enabled && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Temperature Settings */}
                <TemperatureCardsSection
                  comfortTemperature={chronoSettings.comfortTemperature}
                  economyTemperature={chronoSettings.economyTemperature}
                  onComfortChange={handleComfortTemperatureChange}
                  onEconomyChange={handleEconomyTemperatureChange}
                  disabled={isDisabled}
                  unit={temperatureUnit}
                />

                {/* Quick Presets */}
                <QuickPresets
                  onApply={handleScheduleChange}
                  disabled={isDisabled}
                />

                {/* Weekly Grid */}
                <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                  <h4 className="text-sm font-medium text-zinc-400 mb-4">
                    {t("chrono.weeklySchedule")}
                  </h4>
                  <p className="text-xs text-zinc-500 mb-4">
                    {t("chrono.slotDescription")}
                  </p>
                  <WeeklyScheduleGrid
                    schedule={chronoSettings.schedule}
                    onChange={handleScheduleChange}
                    disabled={isDisabled}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <EasyTimerSection
            easyTimer={easyTimer}
            onChange={onEasyTimerChange}
            disabled={isDisabled}
          />
        )}
      </div>

      {/* Save/Discard Footer */}
      {onSave && onDiscard && (
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-800/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-400">
              {hasUnsavedChanges ? (
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 ${COLORS.accent.primary.bg} rounded-full animate-pulse`}
                  />
                  {t("actions.unsavedChanges")}
                </span>
              ) : (
                <span className="text-zinc-500">{t("actions.noChanges")}</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onDiscard}
                disabled={!hasUnsavedChanges || isSaving}
                className="px-4 py-2 rounded-lg bg-zinc-700 text-zinc-300
                           hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors font-medium"
              >
                {t("actions.discard")}
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={!hasUnsavedChanges || isSaving}
                className={`px-4 py-2 rounded-lg ${COLORS.accent.primary.bg} text-white
                           ${COLORS.accent.primary.bgHover} disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors font-medium flex items-center gap-2`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("actions.saving")}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon="save" className="w-4 h-4" />
                    {t("actions.save")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scheduler;
