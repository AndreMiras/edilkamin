import {FunctionComponent} from 'react';
import {Container} from 'react-bootstrap';

const Footer: FunctionComponent = () => (
    <footer className="footer mt-auto py-3 bg-light">
        <Container className="text-center">
      <span>
        Copyleft &#x1f12f; Andre MIRAS | Florent VIOLLEAU {(new Date()).getFullYear()} - Open Edilkamin
          {process.env.NEXT_PUBLIC_GIT_DESCRIBE ? ` v${process.env.NEXT_PUBLIC_GIT_DESCRIBE}` : ' dev'}
      </span>
        </Container>
    </footer>
);

export default Footer;
