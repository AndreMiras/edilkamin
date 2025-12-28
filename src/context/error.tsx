import { createContext, ReactNode, useCallback, useState } from "react";

interface ErrorType {
  title?: string;
  body: string;
  action?: {
    label: string;
    onClick: () => void;
  };
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

const ErrorContextProvider = ({ children }: { children: ReactNode }) => {
  const [errors, setErrors] = useState<ErrorType[]>(defaultErrors);
  const addError = useCallback(
    (error: ErrorType) => setErrors((prev) => [...prev, error]),
    [],
  );
  return (
    <ErrorContext.Provider value={{ errors, setErrors, addError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export type { ErrorType };
export { ErrorContext, ErrorContextProvider };
