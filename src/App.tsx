import { Container } from "react-bootstrap";
import Home from "./components/Home";
import Header from "./components/Header";
import "bootstrap/dist/css/bootstrap.min.css";

const App = (): JSX.Element => {
  return (
    <div className="App">
        <Header />
        <Container className="mt-3">
          <Home />
        </Container>
    </div>
  );
};

export default App;
