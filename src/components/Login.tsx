import { signIn } from "edilkamin";
import React, { useContext, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { ErrorContext } from "../context/error";
import { TokenContext } from "../context/token";
import { setTokenLocalStorage } from "../utils/helpers";

const Login = () => {
  const { t } = useTranslation("login");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { setToken } = useContext(TokenContext);
  const { addError } = useContext(ErrorContext);

  const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setUsername(e.target.value);

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setPassword(e.target.value);

  const onLogin = async (): Promise<void> => {
    try {
      const useLegacy = process.env.NEXT_PUBLIC_USE_LEGACY_API === "true";
      const token = await signIn(username, password, useLegacy);
      setTokenLocalStorage(token);
      setToken(token);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        addError({ title: t("errors.couldntLogin"), body: error.message });
      } else {
        addError({ body: t("errors.unknownError") });
      }
    }
  };

  const onFormSubmit = (e: React.FormEvent): void => e.preventDefault();

  return (
    <Form className="d-flex" onSubmit={onFormSubmit}>
      <Form.Control
        placeholder={t("usernamePlaceholder")}
        className="me-2"
        aria-label={t("emailAriaLabel")}
        onChange={onUsernameChange}
        autoComplete="username"
      />
      <Form.Control
        type="password"
        placeholder={t("passwordPlaceholder")}
        className="me-2"
        aria-label={t("passwordAriaLabel")}
        onChange={onPasswordChange}
        autoComplete="current-password"
      />
      <Button variant="primary" type="submit" onClick={onLogin}>
        {t("button")}
      </Button>
    </Form>
  );
};

export default Login;
