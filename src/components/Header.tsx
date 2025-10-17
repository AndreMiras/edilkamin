import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { useIsLoggedIn } from "../utils/hooks";
import LanguageSwitcher from "./LanguageSwitcher";
import Login from "./Login";
import Logout from "./Logout";

const Header = () => {
  const { t } = useTranslation("header");

  return (
    <Navbar bg="dark" variant="dark" expand="sm">
      <Container>
        <Navbar.Brand href="/">
          <FontAwesomeIcon icon={["fas", "fire-flame-curved"]} /> Edilkamin
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="mr-auto">
            <Nav.Link href="https://github.com/AndreMiras/edilkamin">
              <FontAwesomeIcon icon={["fab", "github-alt"]} /> {t("about")}
            </Nav.Link>
            <LanguageSwitcher />
          </Nav>
        </Navbar.Collapse>
        {useIsLoggedIn() === true ? (
          <div className="ms-auto">
            <Logout />
          </div>
        ) : (
          <Login />
        )}
      </Container>
    </Navbar>
  );
};

export default Header;
