import { ComponentInfoType, ComponentType } from "edilkamin";
import { useTranslation } from "react-i18next";

import DetailRow from "./DetailRow";

interface SoftwareInfoProps {
  componentInfo: ComponentInfoType | undefined;
}

interface ComponentDisplayConfig {
  key: keyof Omit<ComponentInfoType, "timestamp" | "general">;
  labelKey: string;
}

const COMPONENTS_TO_DISPLAY: ComponentDisplayConfig[] = [
  { key: "motherboard", labelKey: "software.motherboard" },
  { key: "emergency_panel", labelKey: "software.emergencyPanel" },
  { key: "radio_control", labelKey: "software.radioControl" },
  { key: "idro_panel", labelKey: "software.idroPanel" },
];

const hasVersionData = (component: ComponentType | undefined): boolean => {
  return !!component?.application_version;
};

const ComponentSection = ({
  component,
  label,
  t,
}: {
  component: ComponentType;
  label: string;
  t: (key: string) => string;
}) => (
  <div className="space-y-1">
    <h4 className="text-sm font-medium text-muted-foreground mb-2">{label}</h4>
    {component.board_name && (
      <DetailRow label={t("software.boardName")} value={component.board_name} />
    )}
    {component.application_name && (
      <DetailRow
        label={t("software.application")}
        value={`${component.application_name} ${component.application_version}`}
      />
    )}
    {component.bootloader_name && (
      <DetailRow
        label={t("software.bootloader")}
        value={`${component.bootloader_name} ${component.bootloader_version}`}
      />
    )}
  </div>
);

const SoftwareInfo = ({ componentInfo }: SoftwareInfoProps) => {
  const { t } = useTranslation("stove");

  if (!componentInfo) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {t("software.notAvailable")}
      </div>
    );
  }

  const componentsWithData = COMPONENTS_TO_DISPLAY.filter(({ key }) =>
    hasVersionData(componentInfo[key] as ComponentType | undefined),
  );

  if (componentsWithData.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {t("software.notAvailable")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {componentsWithData.map(({ key, labelKey }, index) => (
        <div
          key={key}
          className={index > 0 ? "border-t border-border pt-3" : ""}
        >
          <ComponentSection
            component={componentInfo[key] as ComponentType}
            label={t(labelKey)}
            t={t}
          />
        </div>
      ))}
    </div>
  );
};

export default SoftwareInfo;
