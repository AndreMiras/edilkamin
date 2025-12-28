import { Capacitor } from "@capacitor/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { KeyboardEvent, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ErrorContext } from "@/context/error";
import { StoredDevice } from "@/utils/deviceStorage";

import {
  isBluetoothEnabled,
  isBluetoothSupported,
  requestEnableBluetooth,
  scanForDevices,
} from "../utils/bluetooth";
import { isValidFireplace, normalizeFireplace } from "../utils/helpers";

interface DeviceManagementProps {
  devices: StoredDevice[];
  onAdd: (device: StoredDevice) => void;
  onRemove: (index: number) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DeviceManagement = ({
  devices,
  onAdd,
  onRemove,
  open,
  onOpenChange,
}: DeviceManagementProps) => {
  const { t } = useTranslation("home");
  const { addError } = useContext(ErrorContext);
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothSupported, setBluetoothSupported] = useState<boolean | null>(
    null,
  );
  const [fireplace, setFireplace] = useState("");
  const [fireplaceFeedback, setFireplaceFeedback] = useState("");

  // Extract WiFi MACs for duplicate checking
  const wifiMacs = devices.map((d) => d.wifiMac);

  useEffect(() => {
    setBluetoothSupported(isBluetoothSupported());
  }, []);

  useEffect(() => {
    if (fireplace !== "" && !isValidFireplace(fireplace)) {
      setFireplaceFeedback(t("validation.invalidMac"));
    } else if (wifiMacs.includes(normalizeFireplace(fireplace))) {
      setFireplaceFeedback(t("validation.alreadyAdded"));
    } else {
      setFireplaceFeedback("");
    }
  }, [fireplace, wifiMacs, t]);

  const handleAdd = () => {
    const normalizedMac = normalizeFireplace(fireplace);
    onAdd({ wifiMac: normalizedMac });
    setFireplace("");
  };

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.code === "Enter" && !addDisabled) {
      handleAdd();
    }
  };

  const onScan = async () => {
    if (!bluetoothSupported) return;

    // Check if Bluetooth is enabled before scanning
    const enabled = await isBluetoothEnabled();
    if (!enabled) {
      // Close modal so user can see the error
      onOpenChange?.(false);
      const isAndroid = Capacitor.getPlatform() === "android";
      addError({
        title: t("bluetooth.disabled"),
        body: t("bluetooth.enablePrompt"),
        ...(isAndroid && {
          action: {
            label: t("bluetooth.enableButton"),
            onClick: async () => {
              await requestEnableBluetooth();
            },
          },
        }),
      });
      return;
    }

    setIsScanning(true);
    try {
      const scannedDevices = await scanForDevices();

      if (scannedDevices.length === 0) {
        return;
      }

      const { wifiMac, bleMac, name } = scannedDevices[0];
      if (!wifiMac) {
        addError({
          title: t("bluetooth.scanIncomplete"),
          body: t("bluetooth.manualEntryFallback"),
        });
        return;
      }

      if (wifiMacs.includes(wifiMac)) {
        addError({
          title: t("bluetooth.alreadyAdded"),
          body: t("bluetooth.deviceExists", { mac: wifiMac }),
        });
        return;
      }

      onAdd({ wifiMac, bleMac, name });
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
  const scanDisabled = bluetoothSupported !== true || isScanning;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label={t("manageDevices")}
        >
          <FontAwesomeIcon icon={["fas", "cog"]} />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("manageDevices")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("manageDevicesDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Device list with remove buttons */}
          {devices.length > 0 && (
            <ul className="divide-y divide-border">
              {devices.map((device, index) => (
                <li
                  key={device.wifiMac}
                  className="flex justify-between items-center py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-mono">{device.wifiMac}</span>
                    {device.bleMac && (
                      <span className="text-xs text-muted-foreground">
                        BLE: {device.bleMac}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onRemove(index)}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-destructive"
                    aria-label={`Remove ${device.wifiMac}`}
                  >
                    <FontAwesomeIcon icon={["fas", "trash"]} size="sm" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add device form */}
          <div className="flex gap-2 items-start">
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
              onClick={handleAdd}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceManagement;
