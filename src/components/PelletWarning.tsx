import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { COLORS } from "@/utils/colors";

interface PelletWarningProps {
  autonomyTime: number;
}

const PelletWarning = ({ autonomyTime }: PelletWarningProps) => {
  const { t } = useTranslation("stove");
  const hours = Math.floor(autonomyTime / 60);

  return (
    <div
      className={`w-full ${COLORS.status.warning.bgLight} ${COLORS.status.warning.bgDark} border ${COLORS.status.warning.border} ${COLORS.status.warning.borderDark} rounded-lg p-3 mb-4`}
    >
      <div
        className={`flex items-center gap-2 ${COLORS.status.warning.textLight} ${COLORS.status.warning.textDark}`}
      >
        <FontAwesomeIcon icon="triangle-exclamation" className="text-lg" />
        <span className="font-medium">{t("pellet.lowWarning")}</span>
      </div>
      <p
        className={`text-sm ${COLORS.status.warning.textLightAlt} ${COLORS.status.warning.textDarkAlt} mt-1`}
      >
        {t("pellet.autonomyRemaining", { hours })}
      </p>
    </div>
  );
};

export default PelletWarning;
