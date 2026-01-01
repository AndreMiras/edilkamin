import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PullToRefresh from "react-simple-pull-to-refresh";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBluetooth } from "@/context/bluetooth";
import { useDeviceControl } from "@/hooks/useDeviceControl";
import { getDeviceByWifiMac } from "@/utils/deviceStorage";
import { useIsLoggedIn } from "@/utils/hooks";

import AutoModeToggle from "../../components/AutoModeToggle";
import ConnectionModeToggle from "../../components/ConnectionModeToggle";
import DebugInfo from "../../components/DebugInfo";
import DetailRow from "../../components/DetailRow";
import DeviceDetails from "../../components/DeviceDetails";
import FanSpeedControl from "../../components/FanSpeedControl";
import PowerLevelSlider from "../../components/PowerLevelSlider";
import { Thermostat } from "../../components/thermostat";
import UsageStatistics from "../../components/UsageStatistics";

const Fireplace: NextPage = () => {
  const { t } = useTranslation("fireplace");
  const router = useRouter();
  const mac = router.query.mac as string;
  const { setBleDeviceId, disconnect, connectionMode, isBleSupported } =
    useBluetooth();
  const isLoggedIn = useIsLoggedIn();

  // Determine if the user can actually control the device
  const canUseCloudMode = connectionMode === "cloud" && isLoggedIn === true;
  const canUseBleMode = connectionMode === "ble"; // BLE doesn't need auth
  const canControlDevice = canUseCloudMode || canUseBleMode;

  // Show prominent message when logged out in Cloud mode
  const showCloudAuthBlock = connectionMode === "cloud" && isLoggedIn === false;

  // Set BLE device ID from storage when page loads
  useEffect(() => {
    if (!mac) return;

    const device = getDeviceByWifiMac(mac);
    if (device?.bleMac) {
      setBleDeviceId(device.bleMac);
    }

    // Disconnect BLE when leaving page
    return () => {
      disconnect();
    };
  }, [mac, setBleDeviceId, disconnect]);

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
    phaseKey,
    lastUpdated,
    onPowerChange,
    onTemperatureChange,
    onPowerLevelChange,
    onAutoModeToggle,
    onFanSpeedChange,
    refreshDeviceInfo,
  } = useDeviceControl(mac);

  // Track seconds since last update for display
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(0);

  useEffect(() => {
    if (!lastUpdated) return;

    // Reset seconds when lastUpdated changes
    setSecondsSinceUpdate(0);

    const updateTimer = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      setSecondsSinceUpdate(seconds);
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [lastUpdated]);

  const getLastUpdatedText = () => {
    if (!lastUpdated) return "";
    if (secondsSinceUpdate < 5) return t("justNow");
    return t("lastUpdated", { seconds: secondsSinceUpdate });
  };

  // Pull-to-refresh content components
  const pullingContent = (
    <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
      <FontAwesomeIcon icon="clock" className="text-xs" />
      <span className="text-sm">{getLastUpdatedText()}</span>
    </div>
  );

  const refreshingContent = (
    <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
      <FontAwesomeIcon icon="arrows-rotate" className="animate-spin" />
      <span className="text-sm">{t("refreshing")}</span>
    </div>
  );

  return (
    <>
      {/* Back navigation and connection mode toggle */}
      <div className="mb-4 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <FontAwesomeIcon icon="arrow-left" />
          <span>{t("backToHome")}</span>
        </Link>
        <ConnectionModeToggle />
      </div>

      {/* Show auth block when logged out in Cloud mode - don't show unusable Thermostat */}
      {showCloudAuthBlock ? (
        <div className="flex flex-col items-center justify-center flex-1 p-4">
          <div className="w-full max-w-md space-y-4">
            {isBleSupported ? (
              <Alert>
                <FontAwesomeIcon
                  icon={["fab", "bluetooth-b"]}
                  className="h-4 w-4"
                />
                <AlertTitle>{t("auth.bluetoothAvailable")}</AlertTitle>
                <AlertDescription>{t("auth.bluetoothHint")}</AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <FontAwesomeIcon icon="cloud" className="h-4 w-4" />
                <AlertTitle>{t("auth.loginRequired")}</AlertTitle>
                <AlertDescription>{t("auth.loginToControl")}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      ) : (
        <PullToRefresh
          onRefresh={refreshDeviceInfo}
          pullingContent={pullingContent}
          refreshingContent={refreshingContent}
          pullDownThreshold={120}
          maxPullDownDistance={200}
          resistance={2.5}
          isPullable={!loading}
        >
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
            phaseKey={phaseKey}
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
                    const fansNumber =
                      nvm?.installer_parameters?.fans_number ?? 0;
                    const fan1MaxLevel =
                      nvm?.oem_parameters?.fan_1_max_level ?? 5;
                    const fan2MaxLevel =
                      nvm?.oem_parameters?.fan_2_max_level ?? 5;
                    const fan3MaxLevel =
                      nvm?.oem_parameters?.fan_3_max_level ?? 5;

                    if (fansNumber === 0) return null;

                    return (
                      <div className="border-t border-border mt-3 pt-3">
                        {fansNumber >= 1 && (
                          <FanSpeedControl
                            fanNumber={1}
                            speed={fan1Speed}
                            onSpeedChange={(speed) =>
                              onFanSpeedChange(1, speed)
                            }
                            loading={loading}
                            disabled={isAuto}
                            maxSpeed={fan1MaxLevel}
                          />
                        )}
                        {fansNumber >= 2 && (
                          <FanSpeedControl
                            fanNumber={2}
                            speed={fan2Speed}
                            onSpeedChange={(speed) =>
                              onFanSpeedChange(2, speed)
                            }
                            loading={loading}
                            disabled={isAuto}
                            maxSpeed={fan2MaxLevel}
                          />
                        )}
                        {fansNumber >= 3 && (
                          <FanSpeedControl
                            fanNumber={3}
                            speed={fan3Speed}
                            onSpeedChange={(speed) =>
                              onFanSpeedChange(3, speed)
                            }
                            loading={loading}
                            disabled={isAuto}
                            maxSpeed={fan3MaxLevel}
                          />
                        )}
                      </div>
                    );
                  })()}
                  {pelletAutonomyTime !== undefined && (
                    <div className="border-t border-border mt-3 pt-3">
                      <DetailRow
                        label={t("pellet.levelLabel")}
                        value={t("pellet.hoursRemaining", {
                          hours: Math.floor(pelletAutonomyTime / 60),
                        })}
                      />
                    </div>
                  )}
                  {info && <DeviceDetails info={info} />}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="debug-info">
                <AccordionTrigger>{t("deviceInfo.label")}</AccordionTrigger>
                <AccordionContent>
                  <DebugInfo info={info} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="statistics">
                <AccordionTrigger>{t("statistics.label")}</AccordionTrigger>
                <AccordionContent>
                  {info && <UsageStatistics info={info} />}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Thermostat>
        </PullToRefresh>
      )}
    </>
  );
};

export default Fireplace;
