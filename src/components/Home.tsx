import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Form, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// I suspect there's no API for fetching fireplaces.
// Instead bluetooth is used to fetch the MAC addresses on the Android app
// then it gets stored to a local database.
// In our case fireplaces are added by the user and stored to the localStorage.
const localStorageKey = "fireplaces";

const Home = (): JSX.Element => {
  const getFireplacesLocalStorage = (): string[] =>
    JSON.parse(localStorage.getItem(localStorageKey) || "[]");

  const setFireplacesLocalStorage = (newFireplaces: string[]) =>
    localStorage.setItem(localStorageKey, JSON.stringify(newFireplaces));

  const [fireplacesState, setFireplacesState] = useState<string[]>(
    getFireplacesLocalStorage()
  );
  const [fireplace, setFireplace] = useState("");

  /**
   * Sets `newFireplaces` to both state and local storage.
   */
  const setFireplaces = (newFireplaces: string[]) => {
    setFireplacesState(newFireplaces);
    setFireplacesLocalStorage(newFireplaces);
  };

  const onAdd = () => setFireplaces([...fireplacesState, fireplace]);

  const onRemove = (index: number) =>
    setFireplaces(fireplacesState.filter((item, i) => i !== index));

  return (
    <Card>
      <Card.Header>Fireplaces</Card.Header>
      <Card.Body>
        <ListGroup>
          {fireplacesState.map((mac, index) => (
            <ListGroup.Item
              key={mac}
              className="d-flex justify-content-between align-items-center"
              as="div"
              action
            >
              <Link to={`/fireplaces/${mac}`}>{mac}</Link>
              <Button onClick={() => onRemove(index)}>
                <FontAwesomeIcon icon={["fas", "minus"]} />
              </Button>
            </ListGroup.Item>
          ))}
          <ListGroup.Item>
            {fireplacesState.length === 0 && (
              <span>No registered fireplaces saved, add one below</span>
            )}
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between" as="div">
            <Form.Control
              className="me-2"
              placeholder="aabbccddeeff"
              onChange={(e) => setFireplace(e.target.value)}
            />
            <Button onClick={onAdd}>
              <FontAwesomeIcon icon={["fas", "plus"]} />
            </Button>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default Home;
