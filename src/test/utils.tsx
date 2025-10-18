import { render, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactElement } from "react";
import { I18nextProvider } from "react-i18next";

import { ErrorContextProvider } from "../context/error";
import { TokenContextProvider } from "../context/token";
import i18n from "../i18n";

// Provider wrapper for all tests - includes i18n and contexts
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <TokenContextProvider>
        <ErrorContextProvider>{children}</ErrorContextProvider>
      </TokenContextProvider>
    </I18nextProvider>
  );
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  };
};

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// Export custom render as default render
export { customRender as render };
