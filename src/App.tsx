import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Container } from "react-bootstrap";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import Errors from "./components/Errors";
import Fireplace from "./components/Fireplace";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./components/Home";
import { ErrorContextProvider } from "./context/error";
import "bootstrap/dist/css/bootstrap.min.css";

library.add(fab, far, fas);

const App = (): JSX.Element => (
  <div className="App d-flex flex-column min-vh-100">
    <Router>
      <Header />
      <ErrorContextProvider>
        <Container className="mt-3">
          <Errors />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="fireplaces/:mac" element={<Fireplace />} />
          </Routes>
        </Container>
      </ErrorContextProvider>
      <Footer />
    </Router>
  </div>
);

export default App;
