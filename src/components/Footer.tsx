import { FunctionComponent } from "react";
import { Container } from "react-bootstrap";

const Footer: FunctionComponent = () => (
  <footer className="footer mt-auto py-3 bg-light">
    <Container className="text-center">
      <span>
        Copyleft &#x1f12f; Andre Miras 2022 - Open Edilkamin v
        {process.env.REACT_APP_GIT_DESCRIBE || "dev"}
      </span>
    </Container>
  </footer>
);

export default Footer;
