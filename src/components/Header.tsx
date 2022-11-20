import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useIsLoggedIn } from "../utils/hooks";
import Login from "./Login";
import Logout from "./Logout";

const Header = (): JSX.Element => (
  <Navbar bg="dark" variant="dark" expand="sm">
    <Container>
      <Navbar.Brand href="/">
        <FontAwesomeIcon icon={["fas", "fire-flame-curved"]} /> Edilkamin
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav className="mr-auto">
          <Nav.Link href="https://github.com/AndreMiras/edilkamin">
            <FontAwesomeIcon icon={["fab", "github-alt"]} /> About
          </Nav.Link>
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

export default Header;
