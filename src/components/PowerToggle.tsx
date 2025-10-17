import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
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
    <ToggleButtonGroup
      type="radio"
      name="power"
      size="lg"
      value={Number(powerState)}
      onChange={onChange}
    >
      {togglePowerProps.map(({ value, label, icon }) => (
        <ToggleButton
          variant="primary"
          id={`set-power-${value}`}
          key={value}
          value={value}
          disabled={loading}
        >
          <FontAwesomeIcon icon={icon as IconProp} /> {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default PowerToggle;
