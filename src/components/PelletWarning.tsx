import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

interface PelletWarningProps {
  autonomyTime: number;
}

const PelletWarning = ({ autonomyTime }: PelletWarningProps) => {
  const { t } = useTranslation("stove");
  const hours = Math.floor(autonomyTime / 60);

  return (
    <div className="w-full bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <FontAwesomeIcon icon="triangle-exclamation" className="text-lg" />
        <span className="font-medium">{t("pellet.lowWarning")}</span>
      </div>
      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
        {t("pellet.autonomyRemaining", { hours })}
      </p>
    </div>
  );
};

export default PelletWarning;
