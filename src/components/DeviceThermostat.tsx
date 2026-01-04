import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { useBluetooth } from "@/context/bluetooth";
import { useDeviceControl } from "@/hooks/useDeviceControl";
import { useIsLoggedIn } from "@/utils/hooks";

import { Thermostat } from "./thermostat";
import { ThermostatSkeleton } from "./thermostat/ThermostatSkeleton";

interface DeviceThermostatProps {
  mac: string;
}

const DeviceThermostat = ({ mac }: DeviceThermostatProps) => {
  const { t } = useTranslation("home");
  const isLoggedIn = useIsLoggedIn();
  const { connectionMode } = useBluetooth();

  const {
    powerState,
    temperature,
    powerLevel,
    isAuto,
    loading,
    environmentTemperature,
    isPelletInReserve,
    pelletAutonomyTime,
    onPowerChange,
    onTemperatureChange,
    onPowerLevelChange,
  } = useDeviceControl(mac);

  // Can't show data in cloud mode without authentication
  const cannotLoadData =
    connectionMode === "cloud" && isLoggedIn === false && loading;

  // Show a placeholder card when we can't load data
  if (cannotLoadData) {
    return (
      <div className="flex flex-col">
        <Link href={`/stove/${mac}`} className="block">
          <div className="w-full max-w-[340px] bg-card text-card-foreground rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_50px_rgba(0,0,0,0.15)] transition-shadow cursor-pointer">
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FontAwesomeIcon
                icon={["fas", "fire-flame-curved"]}
                className="text-4xl mb-4 opacity-50"
              />
              <p className="text-sm text-center">{t("tapToControl")}</p>
            </div>
          </div>
        </Link>
        <div className="text-center mt-2">
          <span className="text-sm text-muted-foreground">{mac}</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return <ThermostatSkeleton />;
  }

  return (
    <div className="flex flex-col">
      <Thermostat
        temperature={temperature}
        environmentTemperature={environmentTemperature}
        powerState={powerState}
        loading={loading}
        onTemperatureChange={onTemperatureChange}
        onPowerChange={onPowerChange}
        isPelletInReserve={isPelletInReserve}
        pelletAutonomyTime={pelletAutonomyTime}
        powerLevel={powerLevel}
        onPowerLevelChange={onPowerLevelChange}
        isAuto={isAuto}
      />
      <div className="text-center mt-2">
        <Link
          href={`/stove/${mac}`}
          className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
        >
          {mac}
        </Link>
      </div>
    </div>
  );
};

export default DeviceThermostat;
