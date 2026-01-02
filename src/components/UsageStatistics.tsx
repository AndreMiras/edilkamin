import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { deriveUsageAnalytics, DeviceInfoType } from "edilkamin";
import { useTranslation } from "react-i18next";

import PowerDistributionChart from "./PowerDistributionChart";

interface UsageStatisticsProps {
  info: DeviceInfoType;
  onAlarmClick?: () => void;
}

const UsageStatistics = ({ info, onAlarmClick }: UsageStatisticsProps) => {
  const { t } = useTranslation("stove");
  const analytics = deriveUsageAnalytics(info);

  return (
    <div className="space-y-4">
      {/* Total Operating Hours - Prominent Display */}
      <div className="text-center py-4 bg-muted rounded-lg">
        <div className="text-3xl font-bold">
          {analytics.totalOperatingHours.toFixed(1)}
        </div>
        <div className="text-sm text-muted-foreground">
          {t("statistics.totalHours")}
        </div>
      </div>

      {/* Service Status Banner */}
      <div
        className={`flex items-center gap-2 p-3 rounded-lg ${
          analytics.serviceStatus.isServiceDue
            ? "bg-destructive/10 text-destructive"
            : "bg-green-500/10 text-green-700 dark:text-green-400"
        }`}
      >
        <FontAwesomeIcon
          icon={
            analytics.serviceStatus.isServiceDue
              ? "exclamation-triangle"
              : "check-circle"
          }
        />
        <div>
          <div className="font-medium">
            {analytics.serviceStatus.isServiceDue
              ? t("statistics.serviceDue")
              : t("statistics.serviceOk")}
          </div>
          <div className="text-sm opacity-80">
            {t("statistics.hoursSinceService", {
              hours: analytics.serviceStatus.hoursSinceService.toFixed(1),
              threshold: analytics.serviceStatus.serviceThresholdHours,
            })}
          </div>
        </div>
      </div>

      {/* Power Distribution Charts */}
      <div>
        <h4 className="text-sm font-medium mb-2">
          {t("statistics.powerDistribution")}
        </h4>
        <PowerDistributionChart distribution={analytics.powerDistribution} />
      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-muted rounded">
          <div className="text-lg font-semibold">{analytics.totalPowerOns}</div>
          <div className="text-xs text-muted-foreground">
            {t("statistics.powerOns")}
          </div>
        </div>
        <div className="p-2 bg-muted rounded">
          <div className="text-lg font-semibold">{analytics.blackoutCount}</div>
          <div className="text-xs text-muted-foreground">
            {t("statistics.blackouts")}
          </div>
        </div>
        <button
          onClick={onAlarmClick}
          className="p-2 bg-muted rounded w-full hover:bg-muted/80 transition-colors cursor-pointer"
        >
          <div className="text-lg font-semibold">{analytics.alarmCount}</div>
          <div className="text-xs text-muted-foreground">
            {t("statistics.alarms")}
          </div>
        </button>
      </div>
    </div>
  );
};

export default UsageStatistics;
