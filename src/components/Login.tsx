import { signIn } from "edilkamin";
import React, { useCallback, useContext, useState } from "react";
import { Button, Form } from "react-bootstrap";

import { ErrorContext, ErrorType } from "../context/error";
import { TokenContext } from "../context/token";
import { setTokenLocalStorage } from "../utils/helpers";

const Login = (): JSX.Element => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { setToken } = useContext(TokenContext);
  const { addError } = useContext(ErrorContext);

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
        addErrorCallback({ title: "Couldn't login", body: error.message });
      } else {
        addErrorCallback({ body: "Unknown login error" });
      }
    }
  };

  const onFormSubmit = (e: React.FormEvent): void => e.preventDefault();

  return (
    <Form className="d-flex" onSubmit={onFormSubmit}>
      <Form.Control
        placeholder="Username"
        className="me-2"
        aria-label="Email"
        onChange={onUsernameChange}
      />
      <Form.Control
        type="password"
        placeholder="Password"
        className="me-2"
        aria-label="Password"
        onChange={onPasswordChange}
      />
      <Button type="submit" onClick={onLogin}>
        Login
      </Button>
    </Form>
  );
};

export default Login;
