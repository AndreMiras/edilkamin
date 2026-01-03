import { useTranslation } from "react-i18next";

import { TemperatureCard } from "./TemperatureCard";

interface TemperatureCardsSectionProps {
  comfortTemperature: number;
  economyTemperature: number;
  onComfortChange: (value: number) => void;
  onEconomyChange: (value: number) => void;
  disabled?: boolean;
  unit?: "C" | "F";
}

export function TemperatureCardsSection({
  comfortTemperature,
  economyTemperature,
  onComfortChange,
  onEconomyChange,
  disabled = false,
  unit = "C",
}: TemperatureCardsSectionProps) {
  const { t } = useTranslation("scheduler");

  return (
    <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
      <h4 className="text-sm font-medium text-zinc-400 mb-4">
        {t("chrono.targetTemperatures")}
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <TemperatureCard
          value={economyTemperature}
          onChange={onEconomyChange}
          label={t("chrono.economy")}
          icon="moon"
          color="economy"
          disabled={disabled}
          unit={unit}
        />
        <TemperatureCard
          value={comfortTemperature}
          onChange={onComfortChange}
          label={t("chrono.comfort")}
          icon="sun"
          color="comfort"
          disabled={disabled}
          unit={unit}
        />
      </div>
    </div>
  );
}
