import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { ErrorContext } from "@/context/error";
import {
  connectToDevice,
  disconnectFromDevice,
  isBluetoothSupported,
} from "@/utils/bluetooth";

type ConnectionMode = "cloud" | "ble";

interface BluetoothContextValue {
  // Connection state
  connectionMode: ConnectionMode;
  setConnectionMode: (mode: ConnectionMode) => void;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // BLE device info
  bleDeviceId: string | null;
  setBleDeviceId: (id: string | null) => void;

  // Connection actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;

  // Feature detection
  isBleSupported: boolean;
}

const BluetoothContext = createContext<BluetoothContextValue | null>(null);

export const BluetoothProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation("stove");
  const { addError } = useContext(ErrorContext);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>("cloud");
  const [bleDeviceId, setBleDeviceId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const isBleSupported = isBluetoothSupported();

  const connect = useCallback(async () => {
    if (!bleDeviceId) {
      setConnectionError("No BLE device ID set");
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      await connectToDevice(bleDeviceId, () => {
        // Disconnect callback
        setIsConnected(false);
        setConnectionError("Device disconnected");
      });
      setIsConnected(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Connection failed";
      setConnectionError(errorMessage);
      setIsConnected(false);
      addError({
        title: t("connectionMode.error"),
        body: errorMessage,
      });
    } finally {
      setIsConnecting(false);
    }
  }, [bleDeviceId, addError, t]);

  const disconnect = useCallback(async () => {
    if (bleDeviceId) {
      await disconnectFromDevice(bleDeviceId);
    }
    setIsConnected(false);
    setConnectionError(null);
  }, [bleDeviceId]);

  return (
    <BluetoothContext.Provider
      value={{
        connectionMode,
        setConnectionMode,
        isConnected,
        isConnecting,
        connectionError,
        bleDeviceId,
        setBleDeviceId,
        connect,
        disconnect,
        isBleSupported,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error("useBluetooth must be used within BluetoothProvider");
  }
  return context;
};

export type { BluetoothContextValue, ConnectionMode };
