import { FunctionComponent } from "react";
import { Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { ErrorType } from "../context/error";

interface ErrorProps extends ErrorType {
  onClose: () => void;
}

const Error: FunctionComponent<ErrorProps> = ({ title, body, onClose }) => {
  const { t } = useTranslation("error");

  return (
    <Alert variant="danger" onClose={onClose} dismissible>
      <Alert.Heading>{title || t("defaultTitle")}</Alert.Heading>
      <p>{body}</p>
    </Alert>
  );
};

export default Error;
