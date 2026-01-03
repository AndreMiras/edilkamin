// Schedule slot values: 0=OFF, 1=Economy, 2=Comfort
export type ScheduleValue = 0 | 1 | 2;

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ChronoSettings {
  enabled: boolean;
  comfortTemperature: number;
  economyTemperature: number;
  schedule: ScheduleValue[]; // 336 values (7 days × 48 half-hour slots)
}

export interface EasyTimerSettings {
  active: boolean;
  time: number; // minutes
}

export interface SchedulerProps {
  chronoSettings: ChronoSettings;
  easyTimer: EasyTimerSettings;
  onChronoSettingsChange: (settings: ChronoSettings) => void;
  onEasyTimerChange: (settings: EasyTimerSettings) => void;
  onSave?: () => void;
  onDiscard?: () => void;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  temperatureUnit?: "C" | "F";
}

export interface WeeklyScheduleGridProps {
  schedule: ScheduleValue[];
  onChange: (schedule: ScheduleValue[]) => void;
  disabled?: boolean;
}

export interface EasyTimerSectionProps {
  easyTimer: EasyTimerSettings;
  onChange: (settings: EasyTimerSettings) => void;
  disabled?: boolean;
}

export interface QuickPresetsProps {
  onApply: (schedule: ScheduleValue[]) => void;
  disabled?: boolean;
}
