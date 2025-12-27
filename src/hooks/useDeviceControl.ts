import axios from "axios";
import { configure, DeviceInfoType, NEW_API_URL, OLD_API_URL } from "edilkamin";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ErrorContext } from "@/context/error";
import { TokenContext } from "@/context/token";
import { useTokenRefresh } from "@/utils/hooks";
import { isNativePlatform } from "@/utils/platform";

export interface DeviceControlState {
  info: DeviceInfoType | null;
  powerState: boolean;
  temperature: number;
  powerLevel: number;
  isAuto: boolean;
  fan1Speed: number;
  fan2Speed: number;
  fan3Speed: number;
  loading: boolean;
  environmentTemperature: number | undefined;
  isPelletInReserve: boolean | undefined;
  pelletAutonomyTime: number | undefined;
  lastUpdated: Date | null;
}

export interface DeviceControlHandlers {
  onPowerChange: (value: number) => Promise<void>;
  onTemperatureChange: (newTemperature: number) => Promise<void>;
  onPowerLevelChange: (level: number) => Promise<void>;
  onAutoModeToggle: (enabled: boolean) => Promise<void>;
  onFanSpeedChange: (fanNumber: 1 | 2 | 3, speed: number) => Promise<void>;
  refreshDeviceInfo: () => Promise<void>;
}

export function useDeviceControl(
  mac: string | undefined,
): DeviceControlState & DeviceControlHandlers {
  const { t } = useTranslation("fireplace");
  const [info, setInfo] = useState<DeviceInfoType | null>(null);
  const [powerState, setPowerState] = useState(false);
  const [temperature, setTemperature] = useState<number>(0);
  const [powerLevel, setPowerLevelState] = useState<number>(1);
  const [isAuto, setIsAutoState] = useState<boolean>(false);
  const [fan1Speed, setFan1SpeedState] = useState<number>(0);
  const [fan2Speed, setFan2SpeedState] = useState<number>(0);
  const [fan3Speed, setFan3SpeedState] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { token } = useContext(TokenContext);
  const { addError } = useContext(ErrorContext);
  const { withRetry } = useTokenRefresh();

  const baseUrl = isNativePlatform()
    ? process.env.NEXT_PUBLIC_USE_LEGACY_API === "true"
      ? OLD_API_URL
      : NEW_API_URL
    : "/api/proxy/";

  // Memoize the API functions to prevent infinite re-renders
  // baseUrl is derived from environment variables and won't change during component lifecycle
  const api = useMemo(() => configure(baseUrl), [baseUrl]);
  const {
    deviceInfo,
    setPower,
    setTargetTemperature,
    setPowerLevel,
    setAuto,
    setFanSpeed,
  } = api;

  const fetchDeviceInfo = useCallback(async () => {
    if (!mac || !token) return;

    try {
      const data = await withRetry(token, (t) => deviceInfo(t, mac));
      setInfo(data);
      setPowerState(data.status.commands.power);
      setTemperature(data.nvm.user_parameters.enviroment_1_temperature);
      setPowerLevelState(data.nvm.user_parameters.manual_power);
      setIsAutoState(data.nvm.user_parameters.is_auto);
      setFan1SpeedState(data.nvm.user_parameters.fan_1_ventilation);
      setFan2SpeedState(data.nvm.user_parameters.fan_2_ventilation);
      setFan3SpeedState(data.nvm.user_parameters.fan_3_ventilation);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error: unknown) {
      console.error(error);
      setLoading(false);
      if (axios.isAxiosError(error) && error?.response?.status === 404) {
        addError({
          title: t("errors.deviceNotFound"),
          body: t("errors.deviceNotFoundBody", { mac }),
        });
      } else if (
        axios.isAxiosError(error) &&
        error?.response?.data?.message !== undefined
      ) {
        addError({
          title: t("errors.couldntFetchInfo"),
          body: error.response.data.message,
        });
      } else if (error instanceof Error) {
        addError({
          title: t("errors.couldntFetchInfo"),
          body: error.message,
        });
      } else {
        addError({ body: t("errors.couldntFetchInfo") });
      }
    }
  }, [mac, token, withRetry, deviceInfo, t, addError]);

  useEffect(() => {
    if (!mac || !token) return;

    // Initial fetch
    fetchDeviceInfo();

    // Set up polling interval
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchDeviceInfo();
      }
    }, 10 * 1000);

    // Handle visibility changes - refresh immediately when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDeviceInfo();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mac, token, fetchDeviceInfo]);

  const refreshDeviceInfo = useCallback(async () => {
    await fetchDeviceInfo();
  }, [fetchDeviceInfo]);

  const onPowerChange = async (value: number) => {
    const previousState = powerState;
    setPowerState(Boolean(value));
    try {
      await withRetry(token!, (t) => setPower(t, mac!, value));
    } catch (error) {
      console.error(error);
      addError({
        title: t("errors.powerUpdateFailed"),
        body: t("errors.powerUpdateBody"),
      });
      setPowerState(previousState);
    }
  };

  const onTemperatureChange = async (newTemperature: number) => {
    const previousTemperature = temperature;
    setTemperature(newTemperature);
    try {
      await withRetry(token!, (t) =>
        setTargetTemperature(t, mac!, 1, newTemperature),
      );
    } catch (error) {
      console.error(error);
      addError({
        title: t("errors.temperatureUpdateFailed"),
        body: t("errors.temperatureUpdateBody"),
      });
      setTemperature(previousTemperature);
    }
  };

  const onPowerLevelChange = async (level: number) => {
    const previousLevel = powerLevel;
    setPowerLevelState(level);
    try {
      await withRetry(token!, (t) => setPowerLevel(t, mac!, level));
    } catch (error) {
      console.error(error);
      addError({
        title: t("errors.powerLevelUpdateFailed"),
        body: t("errors.powerLevelUpdateBody"),
      });
      setPowerLevelState(previousLevel);
    }
  };

  const onAutoModeToggle = async (enabled: boolean) => {
    const previousAuto = isAuto;
    setIsAutoState(enabled);
    try {
      await withRetry(token!, (t) => setAuto(t, mac!, enabled));
    } catch (error) {
      console.error(error);
      addError({
        title: t("errors.autoModeUpdateFailed"),
        body: t("errors.autoModeUpdateBody"),
      });
      setIsAutoState(previousAuto);
    }
  };

  const onFanSpeedChange = async (fanNumber: 1 | 2 | 3, speed: number) => {
    const setters = {
      1: setFan1SpeedState,
      2: setFan2SpeedState,
      3: setFan3SpeedState,
    };
    const previousSpeeds = { 1: fan1Speed, 2: fan2Speed, 3: fan3Speed };
    const previousSpeed = previousSpeeds[fanNumber];

    setters[fanNumber](speed);
    try {
      await withRetry(token!, (t) => setFanSpeed(t, mac!, fanNumber, speed));
    } catch (error) {
      console.error(error);
      addError({
        title: t("errors.fanSpeedUpdateFailed"),
        body: t("errors.fanSpeedUpdateBody"),
      });
      setters[fanNumber](previousSpeed);
    }
  };

  return {
    info,
    powerState,
    temperature,
    powerLevel,
    isAuto,
    fan1Speed,
    fan2Speed,
    fan3Speed,
    loading,
    environmentTemperature: info?.status.temperatures.enviroment,
    isPelletInReserve: info?.status.flags.is_pellet_in_reserve,
    pelletAutonomyTime: info?.status.pellet.autonomy_time,
    lastUpdated,
    onPowerChange,
    onTemperatureChange,
    onPowerLevelChange,
    onAutoModeToggle,
    onFanSpeedChange,
    refreshDeviceInfo,
  };
}
