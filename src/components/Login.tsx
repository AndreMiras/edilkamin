import React, {ReactElement, useCallback, useContext, useState} from 'react';
import {Button, Form} from 'react-bootstrap';
import {signIn} from 'edilkamin';
import {useTranslation} from 'next-i18next';
import {TokenContext} from '../context/token';
import {ErrorContext, ErrorType} from '../context/error';
import {setTokenLocalStorage} from '../utils/helpers';

const Login = (): ReactElement => {
    const [t] = useTranslation('common');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const {setToken} = useContext(TokenContext);
    const {addError} = useContext(ErrorContext);

    const addErrorCallback = useCallback(
        (error: ErrorType) => addError(error),

        []
    );

    const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
        setUsername(e.target.value);

    const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
        setPassword(e.target.value);

  const onLogin = async (): Promise<void> => {
        try {
            const token = await signIn(username, password);
            setTokenLocalStorage(token);
            setToken(token);
        } catch (error: unknown) {
            console.error(error);
            if (error instanceof Error) {
                addErrorCallback({title: t('unable_login_error'), body: error.message});
            } else {
                addErrorCallback({body: t('unknown_login_error')});
            }
        }
    };

    const onFormSubmit = (e: React.FormEvent): void => e.preventDefault();

    return (
        <Form className="d-flex" onSubmit={onFormSubmit}>
            <Form.Control
                placeholder={t('email')}
                className="me-2"
                aria-label={t('email')}
                onChange={onUsernameChange}
            />
            <Form.Control
                type="password"
                placeholder={t('password')}
                className="me-2"
                aria-label={t('password')}
                onChange={onPasswordChange}
            />
            <Button variant="primary" type="submit" onClick={onLogin}>
                {t('login')}
            </Button>
        </Form>
    );
};

export default Login;
