import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenContext } from "@/context/token";
import {
  addStoredDevice,
  getStoredDevices,
  removeStoredDevice,
  StoredDevice,
} from "@/utils/deviceStorage";

import DeviceManagement from "./DeviceManagement";
import DeviceThermostat from "./DeviceThermostat";
import Login from "./Login";

const Home = () => {
  const { t } = useTranslation("home");
  const { token } = useContext(TokenContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [devices, setDevices] = useState<StoredDevice[]>([]);

  useEffect(() => setDevices(getStoredDevices()), []);

  const onAdd = (device: StoredDevice) => {
    const newDevices = addStoredDevice(device);
    setDevices(newDevices);
  };

  const onRemove = (index: number) => {
    const newDevices = removeStoredDevice(index);
    setDevices(newDevices);
  };

  // Show login prompt if not authenticated
  if (token === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{t("loginRequired")}</p>
          <Login />
        </CardContent>
      </Card>
    );
  }

  // Show loading while checking token
  if (token === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

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
