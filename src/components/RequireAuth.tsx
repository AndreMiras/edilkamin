import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useIsLoggedIn } from "../utils/hooks";

interface RequireAuthProps {
  children: ReactNode;
  message?: string;
}

const RequireAuth = ({ children, message }: RequireAuthProps) => {
  const { t } = useTranslation("auth");
  const isLoggedIn = useIsLoggedIn();

  // Loading state - show spinner while checking auth
  if (isLoggedIn === undefined) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Not authenticated - show login prompt
  if (isLoggedIn === false) {
    return (
      <div className="flex items-center justify-center flex-1 p-4">
        <Alert className="max-w-md">
          <AlertTitle>{t("loginRequired")}</AlertTitle>
          <AlertDescription>
            {message || t("loginRequiredMessage")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
};

export default RequireAuth;
