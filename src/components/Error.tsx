import { FunctionComponent } from "react";
import { Alert } from "react-bootstrap";
import { ErrorType } from "../context/error";

interface ErrorProps extends ErrorType {
  onClose: () => void;
}

const Error: FunctionComponent<ErrorProps> = ({ title, body, onClose }) => (
  <Alert variant="danger" onClose={onClose} dismissible>
    <Alert.Heading>{title || "Error"}</Alert.Heading>
    <p>{body}</p>
  </Alert>
);

export default Error;
