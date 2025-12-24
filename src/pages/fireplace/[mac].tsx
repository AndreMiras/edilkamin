import axios from "axios";
import { configure, DeviceInfoType, NEW_API_URL, OLD_API_URL } from "edilkamin";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import AutoModeToggle from "../../components/AutoModeToggle";
import DebugInfo from "../../components/DebugInfo";
import DeviceDetails from "../../components/DeviceDetails";
import FanSpeedControl from "../../components/FanSpeedControl";
import RequireAuth from "../../components/RequireAuth";
import { Thermostat } from "../../components/thermostat";
import { ErrorContext } from "../../context/error";
import { TokenContext } from "../../context/token";
import { useTokenRefresh } from "../../utils/hooks";
import { isNativePlatform } from "../../utils/platform";

const Fireplace: NextPage = () => {
  const { t } = useTranslation("fireplace");
  const router = useRouter();
  const mac = router.query.mac as string;
  const [info, setInfo] = useState<DeviceInfoType | null>(null);
  const [powerState, setPowerState] = useState(false);
  const [temperature, setTemperature] = useState<number>(0);
  const [powerLevel, setPowerLevelState] = useState<number>(1);
  const [isAuto, setIsAutoState] = useState<boolean>(false);
  const [fan1Speed, setFan1SpeedState] = useState<number>(0);
  const [fan2Speed, setFan2SpeedState] = useState<number>(0);
  const [fan3Speed, setFan3SpeedState] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(TokenContext);
  const { addError } = useContext(ErrorContext);
  const { withRetry } = useTokenRefresh();
  // Native apps don't need proxy (no CORS restrictions in WebView)
  const baseUrl = isNativePlatform()
    ? process.env.NEXT_PUBLIC_USE_LEGACY_API === "true"
      ? OLD_API_URL
      : NEW_API_URL
    : "/api/proxy/";
  const {
    deviceInfo,
    setPower,
    setTargetTemperature,
    setPowerLevel,
    setAuto,
    setFanSpeed,
  } = configure(baseUrl);

  useEffect(() => {
    if (!mac || !token) return;
    const fetch = async () => {
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
        setLoading(false);
      } catch (error: unknown) {
        console.error(error);
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
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mac, token, t]);

  const onPowerChange = async (value: number) => {
    // set the state before hand to avoid the lag feeling
    setPowerState(Boolean(value));
    try {
      await withRetry(token!, (t) => setPower(t, mac!, value));
    } catch (error) {
      console.error(error);
      addError({
        title: t("errors.powerUpdateFailed"),
        body: t("errors.powerUpdateBody"),
      });
      // rollback to the actual/previous value
      setPowerState(powerState);
    }
  };

  const onTemperatureChange = async (newTemperature: number) => {
    // set the state before hand to avoid the lag feeling
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
      // rollback the temperature to the actual/previous value
      setTemperature(temperature);
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
      // rollback to the previous value
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
      // rollback to the previous value
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
      // rollback to the previous value
      setters[fanNumber](previousSpeed);
    }
  };

  return (
    <RequireAuth message={t("auth.loginToControl")}>
      <Thermostat
        temperature={temperature}
        environmentTemperature={info?.status.temperatures.enviroment}
        powerState={powerState}
        loading={loading}
        onTemperatureChange={onTemperatureChange}
        onPowerChange={onPowerChange}
        isPelletInReserve={info?.status.flags.is_pellet_in_reserve}
        pelletAutonomyTime={info?.status.pellet.autonomy_time}
        powerLevel={powerLevel}
        onPowerLevelChange={onPowerLevelChange}
        isAuto={isAuto}
      >
        <Accordion
          type="single"
          collapsible
          className="mt-8 w-full max-w-[340px]"
        >
          <AccordionItem value="device-details">
            <AccordionTrigger>{t("advanced")}</AccordionTrigger>
            <AccordionContent>
              <AutoModeToggle
                isAuto={isAuto}
                onToggle={onAutoModeToggle}
                loading={loading}
                disabled={!powerState}
              />
              {(() => {
                // Extract device capabilities (not exposed in edilkamin.js types)
                // These properties exist in device data but not in the library's type definitions
                type ExtendedNvm = {
                  installer_parameters?: { fans_number?: number };
                  oem_parameters?: {
                    fan_1_max_level?: number;
                    fan_2_max_level?: number;
                    fan_3_max_level?: number;
                  };
                };
                const nvm = info?.nvm as ExtendedNvm | undefined;
                const fansNumber = nvm?.installer_parameters?.fans_number ?? 0;
                const fan1MaxLevel = nvm?.oem_parameters?.fan_1_max_level ?? 5;
                const fan2MaxLevel = nvm?.oem_parameters?.fan_2_max_level ?? 5;
                const fan3MaxLevel = nvm?.oem_parameters?.fan_3_max_level ?? 5;

                if (fansNumber === 0) return null;

                return (
                  <div className="border-t border-border mt-3 pt-3">
                    {fansNumber >= 1 && (
                      <FanSpeedControl
                        fanNumber={1}
                        speed={fan1Speed}
                        onSpeedChange={(speed) => onFanSpeedChange(1, speed)}
                        loading={loading}
                        disabled={!powerState || isAuto}
                        maxSpeed={fan1MaxLevel}
                      />
                    )}
                    {fansNumber >= 2 && (
                      <FanSpeedControl
                        fanNumber={2}
                        speed={fan2Speed}
                        onSpeedChange={(speed) => onFanSpeedChange(2, speed)}
                        loading={loading}
                        disabled={!powerState || isAuto}
                        maxSpeed={fan2MaxLevel}
                      />
                    )}
                    {fansNumber >= 3 && (
                      <FanSpeedControl
                        fanNumber={3}
                        speed={fan3Speed}
                        onSpeedChange={(speed) => onFanSpeedChange(3, speed)}
                        loading={loading}
                        disabled={!powerState || isAuto}
                        maxSpeed={fan3MaxLevel}
                      />
                    )}
                  </div>
                );
              })()}
              {info && <DeviceDetails info={info} />}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="debug-info">
            <AccordionTrigger>{t("debug")}</AccordionTrigger>
            <AccordionContent>
              <DebugInfo info={info} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Thermostat>
    </RequireAuth>
  );
};

export default Fireplace;
