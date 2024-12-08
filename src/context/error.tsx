import { createContext, FunctionComponent, ReactNode, useState } from "react";

interface ErrorType {
  title?: string;
  body: string;
}
interface ErrorContextType {
  errors: ErrorType[];
  setErrors: (errors: ErrorType[]) => void;
  addError: (error: ErrorType) => void;
}

const defaultErrors: ErrorType[] = [];
const errorsContextDefault = {
  errors: defaultErrors,
  setErrors: () => {},
  addError: () => {},
};

const ErrorContext = createContext<ErrorContextType>(errorsContextDefault);

const ErrorContextProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [errors, setErrors] = useState<ErrorType[]>(defaultErrors);
  const addError = (error: ErrorType) => setErrors([...errors, error]);
  return (
    <ErrorContext.Provider value={{ errors, setErrors, addError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export type { ErrorType };
export { ErrorContext, ErrorContextProvider };
