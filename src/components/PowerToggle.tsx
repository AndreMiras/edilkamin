import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

const PowerToggle = ({
  powerState,
  onChange,
  loading,
}: {
  powerState: boolean;
  onChange: (value: number) => void;
  loading: boolean;
}) => {
  const { t } = useTranslation("power");

  const togglePowerProps = [
    { value: 1, label: t("on"), icon: "sun" },
    { value: 0, label: t("off"), icon: "power-off" },
  ];

  return (
    <div className="inline-flex rounded-lg border border-input overflow-hidden">
      {togglePowerProps.map(({ value, label, icon }) => (
        <button
          key={value}
          id={`set-power-${value}`}
          onClick={() => onChange(value)}
          disabled={loading}
          className={`px-6 py-3 text-lg font-medium transition-colors border-r border-input last:border-r-0 disabled:opacity-50 disabled:cursor-not-allowed ${
            Number(powerState) === value
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground hover:bg-muted"
          }`}
        >
          <FontAwesomeIcon icon={icon as IconProp} className="mr-2" />
          {label}
        </button>
      ))}
    </div>
  );
};

export default PowerToggle;
