import { useTranslation } from "react-i18next";

import { useLogout } from "../utils/hooks";

const Logout = () => {
  const { t } = useTranslation("logout");
  // TODO: ideally hit the backend to invalidate the token too
  const logout = useLogout();
  const onLogoutClick = (): void => logout();

  return (
    <button
      type="submit"
      onClick={onLogoutClick}
      className="px-4 py-2 !bg-primary text-primary-foreground !rounded-md hover:!bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {t("button")}
    </button>
  );
};

export default Logout;
