import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { KeyboardEvent, useEffect, useState } from "react";
import { Button, Card, Form, ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { isValidFireplace, normalizeFireplace } from "../utils/helpers";

// I suspect there's no API for fetching fireplaces.
// Instead bluetooth is used to fetch the MAC addresses on the Android app
// then it gets stored to a local database.
// In our case fireplaces are added by the user and stored to the localStorage.
const localStorageKey = "fireplaces";

const Home = () => {
  const { t } = useTranslation("home");

  const getFireplacesLocalStorage = (): string[] =>
    JSON.parse(localStorage.getItem(localStorageKey) || "[]");

  const setFireplacesLocalStorage = (newFireplaces: string[]) =>
    localStorage.setItem(localStorageKey, JSON.stringify(newFireplaces));

  const [fireplacesState, setFireplacesState] = useState<string[]>([]);
  const [fireplace, setFireplace] = useState("");
  const [fireplaceFeedback, setFireplaceFeedback] = useState("");

  useEffect(() => setFireplacesState(getFireplacesLocalStorage()), []);

  useEffect(() => {
    if (fireplace !== "" && !isValidFireplace(fireplace)) {
      setFireplaceFeedback(t("validation.invalidMac"));
    } else if (fireplacesState.includes(normalizeFireplace(fireplace))) {
      setFireplaceFeedback(t("validation.alreadyAdded"));
    } else {
      setFireplaceFeedback("");
    }
  }, [fireplace, fireplacesState, t]);

  /**
   * Sets `newFireplaces` to both state and local storage.
   */
  const setFireplaces = (newFireplaces: string[]) => {
    setFireplacesState(newFireplaces);
    setFireplacesLocalStorage(newFireplaces);
  };

  const onAdd = () => {
    const normalizedMac = normalizeFireplace(fireplace);
    setFireplaces([...fireplacesState, normalizedMac]);
    setFireplace("");
  };

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.code === "Enter") {
      onAdd();
    }
  };

  const onRemove = (index: number) =>
    setFireplaces(fireplacesState.filter((item, i) => i !== index));

  const addDisabled = fireplace === "" || fireplaceFeedback !== "";

  return (
    <Card>
      <Card.Header>{t("title")}</Card.Header>
      <Card.Body>
        <ListGroup>
          {fireplacesState.map((mac, index) => (
            <ListGroup.Item
              key={mac}
              className="d-flex justify-content-between align-items-center"
              as="div"
              action
            >
              <Link href={`/fireplace/${mac}`}>{mac}</Link>
              <Button onClick={() => onRemove(index)}>
                <FontAwesomeIcon icon={["fas", "minus"]} />
              </Button>
            </ListGroup.Item>
          ))}
          <ListGroup.Item>
            {fireplacesState.length === 0 && <span>{t("emptyState")}</span>}
          </ListGroup.Item>
          <ListGroup.Item
            className="d-flex justify-content-between align-items-start"
            as="div"
          >
            <Form.Group>
              <Form.Control
                className="me-2"
                placeholder={t("macPlaceholder")}
                value={fireplace}
                onChange={(e) => setFireplace(e.target.value)}
                onKeyPress={onKeyPress}
                isInvalid={fireplaceFeedback !== ""}
              />
              <Form.Control.Feedback type="invalid">
                {fireplaceFeedback}
              </Form.Control.Feedback>
            </Form.Group>
            <Button onClick={onAdd} disabled={addDisabled}>
              <FontAwesomeIcon icon={["fas", "plus"]} />
            </Button>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default Home;
