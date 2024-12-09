import { Button } from "react-bootstrap";

import { useLogout } from "../utils/hooks";

const Logout = () => {
  // TODO: ideally hit the backend to invalidate the token too
  const logout = useLogout();
  const onLogoutClick = (): void => logout();

  return (
    <Button variant="primary" type="submit" onClick={onLogoutClick}>
      Logout
    </Button>
  );
};

export default Logout;
