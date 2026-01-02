import { useTranslation } from "react-i18next";

interface AutoModeToggleProps {
  isAuto: boolean;
  onToggle: (enabled: boolean) => void;
  loading: boolean;
  disabled?: boolean;
}

const AutoModeToggle = ({
  isAuto,
  onToggle,
  loading,
  disabled = false,
}: AutoModeToggleProps) => {
  const { t } = useTranslation("stove");

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <label
          htmlFor="auto-mode-switch"
          className="text-sm font-medium cursor-pointer"
        >
          {t("autoMode.label")}
        </label>
        <p className="text-xs text-muted-foreground">
          {t("autoMode.description")}
        </p>
      </div>
      <button
        id="auto-mode-switch"
        role="switch"
        aria-checked={isAuto}
        onClick={() => onToggle(!isAuto)}
        disabled={loading || disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          isAuto ? "bg-primary" : "bg-input"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
            isAuto ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

export default AutoModeToggle;
