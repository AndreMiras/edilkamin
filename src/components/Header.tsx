import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";

const Header = (): JSX.Element => (
  <Navbar bg="dark" variant="dark" expand="sm">
    <Container>
      <Navbar.Brand href={process.env.PUBLIC_URL}>
        Edilkamin
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav className="mr-auto">
          <Nav.Link href="https://github.com/AndreMiras/edilkamin">
            About
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default Header;
