import Link from "next/link";

import { useDeviceControl } from "@/hooks/useDeviceControl";

import { Thermostat } from "./thermostat";
import { ThermostatSkeleton } from "./thermostat/ThermostatSkeleton";

interface DeviceThermostatProps {
  mac: string;
}

const DeviceThermostat = ({ mac }: DeviceThermostatProps) => {
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
          href={`/fireplace/${mac}`}
          className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
        >
          {mac}
        </Link>
      </div>
    </div>
  );
};

export default DeviceThermostat;
