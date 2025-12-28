import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { useBluetooth } from "@/context/bluetooth";

const ConnectionModeToggle = () => {
  const { t } = useTranslation("fireplace");
  const {
    connectionMode,
    setConnectionMode,
    isConnected,
    isConnecting,
    connectionError,
    isBleSupported,
    connect,
    disconnect,
    bleDeviceId,
  } = useBluetooth();

  const handleModeChange = async (mode: "cloud" | "ble") => {
    if (mode === connectionMode) return;

    if (mode === "ble") {
      if (!bleDeviceId) {
        // No BLE MAC stored for this device
        return;
      }
      setConnectionMode("ble");
      await connect();
    } else {
      await disconnect();
      setConnectionMode("cloud");
    }
  };

  // Don't render if BLE not supported or no BLE device ID
  if (!isBleSupported || !bleDeviceId) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <button
        onClick={() => handleModeChange("cloud")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          connectionMode === "cloud"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={connectionMode === "cloud"}
      >
        <FontAwesomeIcon icon={["fas", "cloud"]} className="h-3.5 w-3.5" />
        <span>{t("connectionMode.cloud")}</span>
      </button>
      <button
        onClick={() => handleModeChange("ble")}
        disabled={isConnecting}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          connectionMode === "ble"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-pressed={connectionMode === "ble"}
      >
        <FontAwesomeIcon
          icon={["fab", "bluetooth-b"]}
          className="h-3.5 w-3.5"
          spin={isConnecting}
        />
        <span>
          {isConnecting
            ? t("connectionMode.connecting")
            : t("connectionMode.bluetooth")}
        </span>
        {connectionMode === "ble" && isConnected && (
          <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
        {connectionMode === "ble" && connectionError && (
          <span className="ml-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>
    </div>
  );
};

export default ConnectionModeToggle;
