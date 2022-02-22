import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Container } from "react-bootstrap";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import Fireplace from "./components/Fireplace";
import Header from "./components/Header";
import Home from "./components/Home";
import "bootstrap/dist/css/bootstrap.min.css";

library.add(fas, fab);

const App = (): JSX.Element => {
  return (
    <div className="App">
      <Router>
        <Header />
        <Container className="mt-3">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="fireplaces/:mac" element={<Fireplace />} />
          </Routes>
        </Container>
      </Router>
    </div>
  );
};

export default App;
