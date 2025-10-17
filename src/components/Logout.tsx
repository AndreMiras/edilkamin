import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { useLogout } from "../utils/hooks";

const Logout = () => {
  const { t } = useTranslation("logout");
  // TODO: ideally hit the backend to invalidate the token too
  const logout = useLogout();
  const onLogoutClick = (): void => logout();

  return (
    <Button variant="primary" type="submit" onClick={onLogoutClick}>
      {t("button")}
    </Button>
  );
};

export default Logout;
