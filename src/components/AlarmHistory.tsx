import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  AlarmCode,
  AlarmDescriptions,
  AlarmsLogType,
  deriveAlarmHistory,
  DeviceInfoType,
} from "edilkamin";
import { useTranslation } from "react-i18next";

interface AlarmHistoryProps {
  info: DeviceInfoType;
}

const formatTimestamp = (timestamp: number, locale: string): string => {
  if (timestamp === 0) return "-";
  const date = new Date(timestamp * 1000);
  return date.toLocaleString(locale, {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const getAlarmDescription = (
  alarmType: number,
  t: (key: string, fallback?: { defaultValue: string }) => string,
): string => {
  const translationKey = `alarmHistory.alarms.${alarmType}`;
  const fallbackDescription =
    AlarmDescriptions[alarmType as AlarmCode] || `Unknown alarm (${alarmType})`;
  return t(translationKey, { defaultValue: fallbackDescription });
};

const AlarmHistory = ({ info }: AlarmHistoryProps) => {
  const { t, i18n } = useTranslation("stove");
  const alarmLog: AlarmsLogType = deriveAlarmHistory(info);

  // Filter out NONE alarms and sort by timestamp (newest first)
  const sortedAlarms = [...alarmLog.alarms]
    .filter((alarm) => alarm.type !== AlarmCode.NONE)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (sortedAlarms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FontAwesomeIcon icon="check-circle" className="text-2xl mb-2" />
        <p>{t("alarmHistory.noAlarms")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground mb-3">
        {t("alarmHistory.totalCount", { count: alarmLog.number })}
      </div>
      <div className="space-y-2">
        {sortedAlarms.map((alarm, index) => (
          <div
            key={`${alarm.timestamp}-${alarm.type}-${index}`}
            className="flex items-start gap-3 p-3 bg-muted rounded-lg"
          >
            <FontAwesomeIcon
              icon="exclamation-triangle"
              className="text-destructive mt-0.5 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">
                {getAlarmDescription(alarm.type, t)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                <span className="mr-2">
                  {t("alarmHistory.code")}: {alarm.type}
                </span>
                <span>{formatTimestamp(alarm.timestamp, i18n.language)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlarmHistory;
