import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenContext } from "@/context/token";

import DeviceManagement from "./DeviceManagement";
import DeviceThermostat from "./DeviceThermostat";
import Login from "./Login";

const localStorageKey = "fireplaces";

const Home = () => {
  const { t } = useTranslation("home");
  const { token } = useContext(TokenContext);

  const getFireplacesLocalStorage = (): string[] =>
    JSON.parse(localStorage.getItem(localStorageKey) || "[]");

  const setFireplacesLocalStorage = (newFireplaces: string[]) =>
    localStorage.setItem(localStorageKey, JSON.stringify(newFireplaces));

  const [fireplacesState, setFireplacesState] = useState<string[]>([]);

  useEffect(() => setFireplacesState(getFireplacesLocalStorage()), []);

  const setFireplaces = (newFireplaces: string[]) => {
    setFireplacesState(newFireplaces);
    setFireplacesLocalStorage(newFireplaces);
  };

  const onAdd = (mac: string) => {
    setFireplaces([...fireplacesState, mac]);
  };

  const onRemove = (index: number) =>
    setFireplaces(fireplacesState.filter((_, i) => i !== index));

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
          fireplaces={fireplacesState}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      </div>

      {/* Empty state */}
      {fireplacesState.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("emptyState")}
          </CardContent>
        </Card>
      )}

      {/* Device grid */}
      {fireplacesState.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fireplacesState.map((mac) => (
            <DeviceThermostat key={mac} mac={mac} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
