import { useTranslation } from "react-i18next";

interface PowerLevelSliderProps {
  level: number;
  onLevelChange: (level: number) => void;
  loading: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

const PowerLevelSlider = ({
  level,
  onLevelChange,
  loading,
  disabled = false,
  readOnly = false,
}: PowerLevelSliderProps) => {
  const { t } = useTranslation("stove");

  return (
    <div className="w-full px-4 py-2">
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        {t("powerLevel.label")}
        {readOnly && (
          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
            {t("powerLevel.auto")}
          </span>
        )}
      </label>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground w-4">1</span>
        <input
          type="range"
          min={1}
          max={5}
          value={level}
          onChange={(e) => onLevelChange(Number(e.target.value))}
          disabled={loading || disabled || readOnly}
          className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed accent-primary"
        />
        <span className="text-sm text-muted-foreground w-4">5</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1 text-center">
        {t("powerLevel.current", { level })}
      </p>
    </div>
  );
};

export default PowerLevelSlider;
