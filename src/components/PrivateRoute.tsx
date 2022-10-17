import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useIsLoggedIn } from "../utils/hooks";

const PrivateRoute = ({ redirectPath = "/" }): JSX.Element => {
  const isLoggedIn = useIsLoggedIn();

  // application is still loading, let's not redirect until the token is set
  if (isLoggedIn === undefined) {
    return <></>;
  } else if (!isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
