import { signIn } from "edilkamin";
import React, { useContext, useState } from "react";
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
    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onFormSubmit}>
      <input
        type="text"
        placeholder={t("usernamePlaceholder")}
        aria-label={t("emailAriaLabel")}
        onChange={onUsernameChange}
        autoComplete="username"
        className="w-full sm:flex-1 px-3 py-2 border !border-input !rounded-md !bg-background text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <input
        type="password"
        placeholder={t("passwordPlaceholder")}
        aria-label={t("passwordAriaLabel")}
        onChange={onPasswordChange}
        autoComplete="current-password"
        className="w-full sm:flex-1 px-3 py-2 border !border-input !rounded-md !bg-background text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="submit"
        onClick={onLogin}
        className="w-full sm:w-auto px-4 py-2 !bg-primary text-primary-foreground !rounded-md hover:!bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {t("button")}
      </button>
    </form>
  );
};

export default Login;
