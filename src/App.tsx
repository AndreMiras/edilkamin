import { Container } from "react-bootstrap";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import Home from "./components/Home";
import Header from "./components/Header";
import "bootstrap/dist/css/bootstrap.min.css";

library.add(fas, fab);

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
