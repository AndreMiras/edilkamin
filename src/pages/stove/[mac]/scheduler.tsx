import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

import { Scheduler } from "@/components/scheduler";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBluetooth } from "@/context/bluetooth";
import { useScheduler } from "@/hooks/useScheduler";
import { useIsLoggedIn } from "@/utils/hooks";

const SchedulerPage: NextPage = () => {
  const { t } = useTranslation("scheduler");
  const router = useRouter();
  const mac = router.query.mac as string;
  const { connectionMode, isBleSupported } = useBluetooth();
  const isLoggedIn = useIsLoggedIn();

  // Scheduler only works in cloud mode
  const isCloudMode = connectionMode === "cloud";
  const canUseScheduler = isCloudMode && isLoggedIn === true;
  const showAuthBlock = isCloudMode && isLoggedIn === false;
  const showBleBlock = connectionMode === "ble";

  const {
    chronoSettings,
    easyTimer,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    setChronoSettings,
    setEasyTimer,
    save,
    discard,
  } = useScheduler({ macAddress: mac });

  const handleChronoSettingsChange = (settings: typeof chronoSettings) => {
    setChronoSettings(settings);
  };

  const handleEasyTimerChange = (settings: typeof easyTimer) => {
    setEasyTimer(settings);
  };

  const backLink = `/stove/${mac}`;

  return (
    <>
      {/* Back navigation */}
      <div className="mb-4 flex justify-between items-center">
        <Link
          href={backLink}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <FontAwesomeIcon icon="arrow-left" />
          <span>{t("navigation.backToStove")}</span>
        </Link>
      </div>

      {/* Show auth block when logged out in Cloud mode */}
      {showAuthBlock && (
        <div className="flex flex-col items-center justify-center flex-1 p-4">
          <div className="w-full max-w-md space-y-4">
            {isBleSupported ? (
              <Alert>
                <FontAwesomeIcon
                  icon={["fab", "bluetooth-b"]}
                  className="h-4 w-4"
                />
                <AlertTitle>{t("auth.loginRequired")}</AlertTitle>
                <AlertDescription>
                  {t("auth.schedulerCloudOnly")}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <FontAwesomeIcon icon="cloud" className="h-4 w-4" />
                <AlertTitle>{t("auth.loginRequired")}</AlertTitle>
                <AlertDescription>{t("auth.loginToSchedule")}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {/* Show BLE block when in Bluetooth mode */}
      {showBleBlock && (
        <div className="flex flex-col items-center justify-center flex-1 p-4">
          <div className="w-full max-w-md space-y-4">
            <Alert>
              <FontAwesomeIcon icon="cloud" className="h-4 w-4" />
              <AlertTitle>{t("auth.cloudRequired")}</AlertTitle>
              <AlertDescription>
                {t("auth.schedulerCloudOnly")}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Show scheduler when authenticated in cloud mode */}
      {canUseScheduler && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <Scheduler
              chronoSettings={chronoSettings}
              easyTimer={easyTimer}
              onChronoSettingsChange={handleChronoSettingsChange}
              onEasyTimerChange={handleEasyTimerChange}
              onSave={save}
              onDiscard={discard}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SchedulerPage;
