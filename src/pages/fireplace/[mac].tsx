import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDeviceControl } from "@/hooks/useDeviceControl";

import AutoModeToggle from "../../components/AutoModeToggle";
import DebugInfo from "../../components/DebugInfo";
import DeviceDetails from "../../components/DeviceDetails";
import FanSpeedControl from "../../components/FanSpeedControl";
import PowerLevelSlider from "../../components/PowerLevelSlider";
import RequireAuth from "../../components/RequireAuth";
import { Thermostat } from "../../components/thermostat";

const Fireplace: NextPage = () => {
  const { t } = useTranslation("fireplace");
  const router = useRouter();
  const mac = router.query.mac as string;

  const {
    info,
    powerState,
    temperature,
    powerLevel,
    isAuto,
    fan1Speed,
    fan2Speed,
    fan3Speed,
    loading,
    environmentTemperature,
    isPelletInReserve,
    pelletAutonomyTime,
    onPowerChange,
    onTemperatureChange,
    onPowerLevelChange,
    onAutoModeToggle,
    onFanSpeedChange,
  } = useDeviceControl(mac);

  return (
    <RequireAuth message={t("auth.loginToControl")}>
      {/* Back navigation */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <FontAwesomeIcon icon="arrow-left" />
          <span>{t("backToHome")}</span>
        </Link>
      </div>

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
      >
        <Accordion type="single" collapsible className="mt-8 w-[340px]">
          <AccordionItem value="device-details">
            <AccordionTrigger>{t("advanced")}</AccordionTrigger>
            <AccordionContent>
              <AutoModeToggle
                isAuto={isAuto}
                onToggle={onAutoModeToggle}
                loading={loading}
              />
              {powerLevel !== undefined && (
                <div className="border-t border-border mt-3 pt-3">
                  <PowerLevelSlider
                    level={powerLevel}
                    onLevelChange={onPowerLevelChange}
                    loading={loading}
                    readOnly={isAuto}
                  />
                </div>
              )}
              {(() => {
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
                        disabled={isAuto}
                        maxSpeed={fan1MaxLevel}
                      />
                    )}
                    {fansNumber >= 2 && (
                      <FanSpeedControl
                        fanNumber={2}
                        speed={fan2Speed}
                        onSpeedChange={(speed) => onFanSpeedChange(2, speed)}
                        loading={loading}
                        disabled={isAuto}
                        maxSpeed={fan2MaxLevel}
                      />
                    )}
                    {fansNumber >= 3 && (
                      <FanSpeedControl
                        fanNumber={3}
                        speed={fan3Speed}
                        onSpeedChange={(speed) => onFanSpeedChange(3, speed)}
                        loading={loading}
                        disabled={isAuto}
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
