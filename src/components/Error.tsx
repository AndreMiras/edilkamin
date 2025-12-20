import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { ErrorType } from "../context/error";

interface ErrorProps extends ErrorType {
  onClose: () => void;
}

const Error: FunctionComponent<ErrorProps> = ({ title, body, onClose }) => {
  const { t } = useTranslation("error");

  return (
    <Alert variant="destructive" className="relative mb-3">
      <FontAwesomeIcon icon="circle-exclamation" className="h-4 w-4" />
      <AlertTitle>{title || t("defaultTitle")}</AlertTitle>
      <AlertDescription>{body}</AlertDescription>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <FontAwesomeIcon icon="xmark" className="h-4 w-4" />
      </button>
    </Alert>
  );
};

export default Error;
