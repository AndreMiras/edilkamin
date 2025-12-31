import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useBluetooth } from "@/context/bluetooth";
import {
  addStoredDevice,
  getStoredDevices,
  removeStoredDevice,
  StoredDevice,
} from "@/utils/deviceStorage";
import { useIsLoggedIn } from "@/utils/hooks";

import DeviceManagement from "./DeviceManagement";
import DeviceThermostat from "./DeviceThermostat";
import Login from "./Login";

const Home = () => {
  const { t } = useTranslation("home");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [devices, setDevices] = useState<StoredDevice[]>([]);
  const isLoggedIn = useIsLoggedIn();
  const { isBleSupported } = useBluetooth();

  useEffect(() => setDevices(getStoredDevices()), []);

  const onAdd = (device: StoredDevice) => {
    const newDevices = addStoredDevice(device);
    setDevices(newDevices);
  };

  const onRemove = (index: number) => {
    const newDevices = removeStoredDevice(index);
    setDevices(newDevices);
  };

  // Show loading while checking auth state
  if (isLoggedIn === undefined) {
    return (
      <Card>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show hint about Bluetooth when not logged in
  const showLoginHint = isLoggedIn === false;

  return (
    <div className="space-y-4">
      {/* Header with manage devices button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <DeviceManagement
          devices={devices}
          onAdd={onAdd}
          onRemove={onRemove}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>

      {/* Login section when not authenticated */}
      {showLoginHint && (
        <div className="space-y-4">
          {/* Bluetooth hint if supported */}
          {isBleSupported && (
            <Alert>
              <FontAwesomeIcon
                icon={["fab", "bluetooth-b"]}
                className="h-4 w-4"
              />
              <AlertTitle>{t("bluetoothAvailable")}</AlertTitle>
              <AlertDescription>{t("bluetoothHint")}</AlertDescription>
            </Alert>
          )}
          {/* Login form - always show when not logged in */}
          <Card>
            <CardContent className="pt-6">
              <Login />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {devices.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("emptyState")}{" "}
            <button
              onClick={() => setDialogOpen(true)}
              className="text-primary hover:underline font-medium"
            >
              {t("addFirstDevice")}
            </button>
          </CardContent>
        </Card>
      )}

      {/* Device grid */}
      {devices.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4">
          {devices.map((device) => (
            <DeviceThermostat key={device.wifiMac} mac={device.wifiMac} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
