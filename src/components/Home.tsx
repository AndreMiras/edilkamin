import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { KeyboardEvent, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ErrorContext } from "@/context/error";

import { isBluetoothSupported, scanForDevices } from "../utils/bluetooth";
import { isValidFireplace, normalizeFireplace } from "../utils/helpers";

// I suspect there's no API for fetching fireplaces.
// Instead bluetooth is used to fetch the MAC addresses on the Android app
// then it gets stored to a local database.
// In our case fireplaces are added by the user and stored to the localStorage.
const localStorageKey = "fireplaces";

const Home = () => {
  const { t } = useTranslation("home");
  const { addError } = useContext(ErrorContext);
  const [isScanning, setIsScanning] = useState(false);
  // Start with null to indicate "not yet checked" - avoids hydration mismatch
  const [bluetoothSupported, setBluetoothSupported] = useState<boolean | null>(
    null,
  );

  // Check bluetooth support on client-side only (after hydration)
  useEffect(() => {
    setBluetoothSupported(isBluetoothSupported());
  }, []);

  const getFireplacesLocalStorage = (): string[] =>
    JSON.parse(localStorage.getItem(localStorageKey) || "[]");

  const setFireplacesLocalStorage = (newFireplaces: string[]) =>
    localStorage.setItem(localStorageKey, JSON.stringify(newFireplaces));

  const [fireplacesState, setFireplacesState] = useState<string[]>([]);
  const [fireplace, setFireplace] = useState("");
  const [fireplaceFeedback, setFireplaceFeedback] = useState("");

  useEffect(() => setFireplacesState(getFireplacesLocalStorage()), []);

  useEffect(() => {
    if (fireplace !== "" && !isValidFireplace(fireplace)) {
      setFireplaceFeedback(t("validation.invalidMac"));
    } else if (fireplacesState.includes(normalizeFireplace(fireplace))) {
      setFireplaceFeedback(t("validation.alreadyAdded"));
    } else {
      setFireplaceFeedback("");
    }
  }, [fireplace, fireplacesState, t]);

  /**
   * Sets `newFireplaces` to both state and local storage.
   */
  const setFireplaces = (newFireplaces: string[]) => {
    setFireplacesState(newFireplaces);
    setFireplacesLocalStorage(newFireplaces);
  };

  const onAdd = () => {
    const normalizedMac = normalizeFireplace(fireplace);
    setFireplaces([...fireplacesState, normalizedMac]);
    setFireplace("");
  };

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.code === "Enter") {
      onAdd();
    }
  };

  const onRemove = (index: number) =>
    setFireplaces(fireplacesState.filter((item, i) => i !== index));

  const onScan = async () => {
    if (!bluetoothSupported) return;

    setIsScanning(true);
    try {
      // Use platform-conditional scanning from utility
      const devices = await scanForDevices();

      if (devices.length === 0) {
        // User cancelled - no action needed
        return;
      }

      const { wifiMac } = devices[0];
      if (!wifiMac) {
        addError({
          title: t("bluetooth.scanIncomplete"),
          body: t("bluetooth.manualEntryFallback"),
        });
        return;
      }

      // Check if already added
      if (fireplacesState.includes(wifiMac)) {
        addError({
          title: t("bluetooth.alreadyAdded"),
          body: t("bluetooth.deviceExists", { mac: wifiMac }),
        });
        return;
      }

      // Add to device list
      setFireplaces([...fireplacesState, wifiMac]);
    } catch (error) {
      console.error(error);
      addError({
        title: t("bluetooth.scanFailed"),
        body:
          error instanceof Error ? error.message : t("bluetooth.unknownError"),
      });
    } finally {
      setIsScanning(false);
    }
  };

  const addDisabled = fireplace === "" || fireplaceFeedback !== "";
  // Button is disabled while checking support (null) or if not supported
  const scanDisabled = bluetoothSupported !== true || isScanning;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Device list */}
        <ul className="divide-y divide-border">
          {fireplacesState.map((mac, index) => (
            <li
              key={mac}
              className="flex justify-between items-center py-3 hover:bg-muted/50 transition-colors"
            >
              <Link
                href={`/fireplace/${mac}`}
                className="text-primary hover:text-primary/80 underline-offset-4 hover:underline"
              >
                {mac}
              </Link>
              <button
                onClick={() => onRemove(index)}
                className="p-2 rounded-md hover:bg-muted transition-colors bg-primary text-primary-foreground"
                aria-label={`Remove ${mac}`}
              >
                <FontAwesomeIcon icon={["fas", "minus"]} />
              </button>
            </li>
          ))}

          {/* Empty state */}
          {fireplacesState.length === 0 && (
            <li className="py-3 text-muted-foreground text-center">
              {t("emptyState")}
            </li>
          )}

          {/* Add new device form */}
          <li className="pt-3">
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t("macPlaceholder")}
                  value={fireplace}
                  onChange={(e) => setFireplace(e.target.value)}
                  onKeyPress={onKeyPress}
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    fireplaceFeedback !== ""
                      ? "border-destructive"
                      : "border-input"
                  }`}
                />
                {fireplaceFeedback !== "" && (
                  <p className="mt-1 text-sm text-destructive">
                    {fireplaceFeedback}
                  </p>
                )}
              </div>
              <button
                onClick={onAdd}
                disabled={addDisabled}
                className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Add fireplace"
              >
                <FontAwesomeIcon icon={["fas", "plus"]} />
              </button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={scanDisabled ? undefined : onScan}
                      disabled={scanDisabled}
                      className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label={t("bluetooth.scanButton")}
                    >
                      <FontAwesomeIcon
                        icon={["fab", "bluetooth-b"]}
                        spin={isScanning}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {bluetoothSupported === false
                      ? t("bluetooth.notSupported")
                      : isScanning
                        ? t("bluetooth.scanning")
                        : t("bluetooth.scanTooltip")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default Home;
