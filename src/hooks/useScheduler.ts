import {
  configure,
  createEmptySchedule,
  deriveChronoMode,
  deriveEasyTimer,
  DeviceInfoType,
  NEW_API_URL,
  OLD_API_URL,
} from "edilkamin";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type {
  ChronoSettings,
  EasyTimerSettings,
  ScheduleValue,
} from "@/components/scheduler/types";
import { ErrorContext } from "@/context/error";
import { TokenContext } from "@/context/token";
import { useTokenRefresh } from "@/utils/hooks";
import { isNativePlatform } from "@/utils/platform";

interface UseSchedulerOptions {
  macAddress: string;
  refreshInterval?: number; // ms, default 30000
}

interface UseSchedulerReturn {
  // Server state (last saved values)
  serverChronoSettings: ChronoSettings;
  serverEasyTimer: EasyTimerSettings;

  // Pending state (current edited values)
  chronoSettings: ChronoSettings;
  easyTimer: EasyTimerSettings;

  // State flags
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  // Local state updates (no API call)
  setChronoSettings: (settings: ChronoSettings) => void;
  setEasyTimer: (settings: EasyTimerSettings) => void;

  // Actions
  save: () => Promise<void>;
  discard: () => void;
  refresh: () => Promise<void>;
}

// Extended nvm type with chrono fields
interface ExtendedNvm {
  chrono?: {
    economy_temperature?: number;
    comfort_temperature?: number;
    temperature_ranges?: number[];
  };
}

const defaultChronoSettings: ChronoSettings = {
  enabled: false,
  comfortTemperature: 22,
  economyTemperature: 18,
  schedule: createEmptySchedule() as unknown as ScheduleValue[],
};

const defaultEasyTimer: EasyTimerSettings = {
  active: false,
  time: 0,
};

/**
 * Extract chrono settings from device info response
 */
function extractChronoSettings(info: DeviceInfoType): ChronoSettings {
  const isEnabled = deriveChronoMode(info);
  const nvm = info.nvm as unknown as ExtendedNvm;
  const chronoData = nvm?.chrono ?? {};

  return {
    enabled: isEnabled,
    comfortTemperature: chronoData?.comfort_temperature ?? 22,
    economyTemperature: chronoData?.economy_temperature ?? 18,
    schedule: (chronoData?.temperature_ranges ??
      createEmptySchedule()) as unknown as ScheduleValue[],
  };
}

/**
 * Extract easy timer settings from device info response
 */
function extractEasyTimerSettings(info: DeviceInfoType): EasyTimerSettings {
  const timerState = deriveEasyTimer(info);
  return {
    active: timerState.active,
    time: timerState.time,
  };
}

/**
 * Check if two chrono settings are equal
 */
function chronoSettingsEqual(a: ChronoSettings, b: ChronoSettings): boolean {
  if (a.enabled !== b.enabled) return false;
  if (a.comfortTemperature !== b.comfortTemperature) return false;
  if (a.economyTemperature !== b.economyTemperature) return false;
  if (a.schedule.length !== b.schedule.length) return false;
  for (let i = 0; i < a.schedule.length; i++) {
    if (a.schedule[i] !== b.schedule[i]) return false;
  }
  return true;
}

/**
 * Check if two easy timer settings are equal
 */
function easyTimerEqual(a: EasyTimerSettings, b: EasyTimerSettings): boolean {
  return a.active === b.active && a.time === b.time;
}

export function useScheduler({
  macAddress,
  refreshInterval = 30000,
}: UseSchedulerOptions): UseSchedulerReturn {
  const { t } = useTranslation("scheduler");
  const { token } = useContext(TokenContext);
  const { addError } = useContext(ErrorContext);
  const { withRetry } = useTokenRefresh();

  // Server state (what's actually on the device)
  const [serverChronoSettings, setServerChronoSettings] =
    useState<ChronoSettings>(defaultChronoSettings);
  const [serverEasyTimer, setServerEasyTimer] =
    useState<EasyTimerSettings>(defaultEasyTimer);

  // Pending state (what the user is editing)
  const [chronoSettings, setChronoSettings] = useState<ChronoSettings>(
    defaultChronoSettings,
  );
  const [easyTimer, setEasyTimer] =
    useState<EasyTimerSettings>(defaultEasyTimer);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return (
      !chronoSettingsEqual(chronoSettings, serverChronoSettings) ||
      !easyTimerEqual(easyTimer, serverEasyTimer)
    );
  }, [chronoSettings, serverChronoSettings, easyTimer, serverEasyTimer]);

  const baseUrl = isNativePlatform()
    ? process.env.NEXT_PUBLIC_USE_LEGACY_API === "true"
      ? OLD_API_URL
      : NEW_API_URL
    : "/api/proxy/";

  // Memoize the API functions
  const api = useMemo(() => configure(baseUrl), [baseUrl]);
  const {
    deviceInfo,
    setChronoMode,
    setChronoComfortTemperature,
    setChronoEconomyTemperature,
    setChronoTemperatureRanges,
    setEasyTimer: setEasyTimerApi,
  } = api;

  /**
   * Fetch current settings from device
   */
  const refresh = useCallback(async () => {
    if (!token || !macAddress) return;

    try {
      const info = await withRetry(token, (t) => deviceInfo(t, macAddress));
      const chrono = extractChronoSettings(info);
      const timer = extractEasyTimerSettings(info);

      setServerChronoSettings(chrono);
      setServerEasyTimer(timer);
      setChronoSettings(chrono);
      setEasyTimer(timer);
    } catch (err) {
      console.error("Failed to fetch scheduler settings:", err);
      addError({
        title: t("errors.fetchFailed"),
        body: err instanceof Error ? err.message : t("errors.fetchFailed"),
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, macAddress, withRetry, deviceInfo, t, addError]);

  /**
   * Discard pending changes and revert to server state
   */
  const discard = useCallback(() => {
    setChronoSettings(serverChronoSettings);
    setEasyTimer(serverEasyTimer);
  }, [serverChronoSettings, serverEasyTimer]);

  /**
   * Save pending changes to the device
   */
  const save = useCallback(async () => {
    if (!token || !macAddress) return;

    setIsSaving(true);

    try {
      // Save chrono settings if changed
      if (!chronoSettingsEqual(chronoSettings, serverChronoSettings)) {
        // Update enabled state
        if (chronoSettings.enabled !== serverChronoSettings.enabled) {
          await withRetry(token, (t) =>
            setChronoMode(t, macAddress, chronoSettings.enabled),
          );
        }

        // Update comfort temperature
        if (
          chronoSettings.comfortTemperature !==
          serverChronoSettings.comfortTemperature
        ) {
          await withRetry(token, (t) =>
            setChronoComfortTemperature(
              t,
              macAddress,
              chronoSettings.comfortTemperature,
            ),
          );
        }

        // Update economy temperature
        if (
          chronoSettings.economyTemperature !==
          serverChronoSettings.economyTemperature
        ) {
          await withRetry(token, (t) =>
            setChronoEconomyTemperature(
              t,
              macAddress,
              chronoSettings.economyTemperature,
            ),
          );
        }

        // Update schedule if changed
        let scheduleChanged = false;
        if (
          chronoSettings.schedule.length !==
          serverChronoSettings.schedule.length
        ) {
          scheduleChanged = true;
        } else {
          for (let i = 0; i < chronoSettings.schedule.length; i++) {
            if (
              chronoSettings.schedule[i] !== serverChronoSettings.schedule[i]
            ) {
              scheduleChanged = true;
              break;
            }
          }
        }

        if (scheduleChanged) {
          await withRetry(token, (t) =>
            setChronoTemperatureRanges(
              t,
              macAddress,
              chronoSettings.schedule as number[],
            ),
          );
        }
      }

      // Save easy timer if changed
      if (!easyTimerEqual(easyTimer, serverEasyTimer)) {
        const newTime = easyTimer.active ? easyTimer.time : 0;
        await withRetry(token, (t) => setEasyTimerApi(t, macAddress, newTime));
      }

      // Update server state to match what we just saved
      setServerChronoSettings(chronoSettings);
      setServerEasyTimer(easyTimer);
    } catch (err) {
      console.error("Failed to save scheduler settings:", err);
      addError({
        title: t("errors.saveFailed"),
        body: t("errors.saveFailedBody"),
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    token,
    macAddress,
    chronoSettings,
    serverChronoSettings,
    easyTimer,
    serverEasyTimer,
    withRetry,
    setChronoMode,
    setChronoComfortTemperature,
    setChronoEconomyTemperature,
    setChronoTemperatureRanges,
    setEasyTimerApi,
    t,
    addError,
  ]);

  // Initial fetch
  useEffect(() => {
    if (token && macAddress) {
      refresh();
    }
  }, [token, macAddress, refresh]);

  // Periodic refresh (only if no unsaved changes)
  useEffect(() => {
    if (refreshInterval <= 0 || !token || !macAddress) return;

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible" && !hasUnsavedChanges) {
        refresh();
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refresh, refreshInterval, token, macAddress, hasUnsavedChanges]);

  return {
    serverChronoSettings,
    serverEasyTimer,
    chronoSettings,
    easyTimer,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    setChronoSettings,
    setEasyTimer,
    save,
    discard,
    refresh,
  };
}

export default useScheduler;
