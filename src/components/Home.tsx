import {KeyboardEvent, ReactElement, useEffect, useState} from 'react';
import Link from 'next/link';
import {Button, Card, Form, ListGroup} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMinus, faPlus} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'next-i18next';
import {isValidFireplace} from '../utils/helpers';

// I suspect there's no API for fetching fireplaces.
// Instead bluetooth is used to fetch the MAC addresses on the Android app
// then it gets stored to a local database.
// In our case fireplaces are added by the user and stored to the localStorage.
const localStorageKey = 'fireplaces';

const Home = (): ReactElement => {
    const [t] = useTranslation('common');

    const getFireplacesLocalStorage = (): string[] =>
        JSON.parse(localStorage.getItem(localStorageKey) ?? '[]');

    const setFireplacesLocalStorage = (newFireplaces: string[]) =>
        localStorage.setItem(localStorageKey, JSON.stringify(newFireplaces));

    const [fireplacesState, setFireplacesState] = useState<string[]>([]);
    const [fireplace, setFireplace] = useState('');
    const [fireplaceFeedback, setFireplaceFeedback] = useState('');

    useEffect(() => setFireplacesState(getFireplacesLocalStorage()), []);

    useEffect(() => {
        if (fireplace !== '' && !isValidFireplace(fireplace)) {
            setFireplaceFeedback(t('invalid_mac_address'));
        } else if (fireplacesState.includes(fireplace.toLowerCase())) {
            setFireplaceFeedback(t('device_already_added'));
        } else {
            setFireplaceFeedback('');
        }
    }, [fireplace, fireplacesState]);

    /**
     * Sets `newFireplaces` to both state and local storage.
     */
    const setFireplaces = (newFireplaces: string[]) => {
        setFireplacesState(newFireplaces);
        setFireplacesLocalStorage(newFireplaces);
    };

    const onAdd = () => {
        setFireplaces([...fireplacesState, fireplace]);
        setFireplace('');
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.code === 'Enter') {
            onAdd();
        }
    };

    const onRemove = (index: number) =>
        setFireplaces(fireplacesState.filter((item, i) => i !== index));

    const addDisabled = fireplace === '' || fireplaceFeedback !== '';

    return (
        <Card>
            <Card.Header>{t('stove')}</Card.Header>
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
                                <FontAwesomeIcon icon={faMinus}/>
                            </Button>
                        </ListGroup.Item>
                    ))}
                    <ListGroup.Item>
                        {fireplacesState.length === 0 && (
                            <span>{t('no_stove')}</span>
                        )}
                    </ListGroup.Item>
                    <ListGroup.Item
                        className="d-flex justify-content-between align-items-start"
                        as="div"
                    >
                        <Form.Group>
                            <Form.Control
                                className="me-2"
                                placeholder="AA:BB:CC:DD:EE:FF"
                                value={fireplace}
                                onChange={(e) => setFireplace(e.target.value)}
                                onKeyDown={onKeyDown}
                                isInvalid={fireplaceFeedback !== ''}
                            />
                            <Form.Control.Feedback type="invalid">
                                {fireplaceFeedback}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Button onClick={onAdd} disabled={addDisabled}>
                            <FontAwesomeIcon icon={faPlus}/>
                        </Button>
                    </ListGroup.Item>
                </ListGroup>
            </Card.Body>
        </Card>
    );
};

export default Home;
