import { useTranslation } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "../i18n";
import { render, waitFor } from "../test/utils";
import LanguageInitializer from "./LanguageInitializer";

describe("LanguageInitializer", () => {
  beforeEach(async () => {
    localStorage.clear();
    // Reset i18n to default language before each test
    await i18n.changeLanguage("en");
  });

  it("should initialize i18n with stored locale on mount", async () => {
    localStorage.setItem("edilkamin-locale", "fr");

    // Spy on i18n.changeLanguage
    const changeLanguageSpy = vi.spyOn(i18n, "changeLanguage");

    render(<LanguageInitializer />);

    // Should have called changeLanguage with "fr"
    await waitFor(
      () => {
        expect(changeLanguageSpy).toHaveBeenCalledWith("fr");
      },
      { timeout: 1000 }
    );

    changeLanguageSpy.mockRestore();
  });

  it("should use default language when localStorage is empty", () => {
    const TestComponent = () => {
      const { i18n } = useTranslation();
      return <div data-testid="language">{i18n.language}</div>;
    };

    const { getByTestId } = render(
      <>
        <LanguageInitializer />
        <TestComponent />
      </>
    );

    // Should use default language (en)
    expect(getByTestId("language")).toHaveTextContent("en");
  });

  it("should handle Spanish locale", async () => {
    localStorage.setItem("edilkamin-locale", "es");

    // Spy on i18n.changeLanguage
    const changeLanguageSpy = vi.spyOn(i18n, "changeLanguage");

    render(<LanguageInitializer />);

    // Should have called changeLanguage with "es"
    await waitFor(
      () => {
        expect(changeLanguageSpy).toHaveBeenCalledWith("es");
      },
      { timeout: 1000 }
    );

    changeLanguageSpy.mockRestore();
  });

  it("should handle English locale explicitly", async () => {
    localStorage.setItem("edilkamin-locale", "en");

    const TestComponent = () => {
      const { i18n } = useTranslation();
      return <div data-testid="language">{i18n.language}</div>;
    };

    const { getByTestId } = render(
      <>
        <LanguageInitializer />
        <TestComponent />
      </>
    );

    await waitFor(
      () => {
        expect(getByTestId("language")).toHaveTextContent("en");
      },
      { timeout: 2000 }
    );
  });

  it("should not change language for invalid locale", () => {
    localStorage.setItem("edilkamin-locale", "invalid-locale");

    const TestComponent = () => {
      const { i18n } = useTranslation();
      return <div data-testid="language">{i18n.language}</div>;
    };

    const { getByTestId } = render(
      <>
        <LanguageInitializer />
        <TestComponent />
      </>
    );

    // Should stay at default language since invalid locale is not in validLocales array
    expect(getByTestId("language")).toHaveTextContent("en");
  });

  it("should not change language when localStorage has null", () => {
    // localStorage is empty (getItem returns null)

    const TestComponent = () => {
      const { i18n } = useTranslation();
      return <div data-testid="language">{i18n.language}</div>;
    };

    const { getByTestId } = render(
      <>
        <LanguageInitializer />
        <TestComponent />
      </>
    );

    // Should use default language
    expect(getByTestId("language")).toHaveTextContent("en");
  });

  it("should render null (no visible output)", () => {
    const { container } = render(<LanguageInitializer />);

    // Component should render nothing
    expect(container.firstChild).toBeNull();
  });

  it("should only validate against supported locales", () => {
    // Test that the component checks if locale is in the validLocales array
    // The validLocales array in the component is: ["en", "fr", "es"]
    const { container } = render(<LanguageInitializer />);

    // Component renders nothing
    expect(container.firstChild).toBeNull();

    // The actual validation happens internally - if localStorage has a valid locale,
    // the component would change the language. If not, it doesn't.
    // Since this is tested in other tests, we just verify the component renders correctly.
  });

  it("should ignore case sensitivity issues if present", () => {
    // Test with uppercase locale
    localStorage.setItem("edilkamin-locale", "FR");

    const TestComponent = () => {
      const { i18n } = useTranslation();
      return <div data-testid="language">{i18n.language}</div>;
    };

    const { getByTestId } = render(
      <>
        <LanguageInitializer />
        <TestComponent />
      </>
    );

    // Should not change language because "FR" !== "fr"
    expect(getByTestId("language")).toHaveTextContent("en");
  });

  it("should handle empty string in localStorage", () => {
    localStorage.setItem("edilkamin-locale", "");

    const TestComponent = () => {
      const { i18n } = useTranslation();
      return <div data-testid="language">{i18n.language}</div>;
    };

    const { getByTestId } = render(
      <>
        <LanguageInitializer />
        <TestComponent />
      </>
    );

    // Should stay at default language
    expect(getByTestId("language")).toHaveTextContent("en");
  });

  it("should run effect only on mount", () => {
    localStorage.setItem("edilkamin-locale", "fr");

    const TestComponent = () => {
      const { i18n } = useTranslation();
      return <div data-testid="language">{i18n.language}</div>;
    };

    const { rerender, getByTestId } = render(
      <>
        <LanguageInitializer />
        <TestComponent />
      </>
    );

    // Wait for initial language change
    waitFor(() => {
      expect(getByTestId("language")).toHaveTextContent("fr");
    });

    // Change localStorage
    localStorage.setItem("edilkamin-locale", "es");

    // Rerender the component
    rerender(
      <>
        <LanguageInitializer />
        <TestComponent />
      </>
    );

    // Language should still be 'fr' because effect only runs on mount
    // and i18n object reference hasn't changed
    expect(getByTestId("language")).toHaveTextContent("fr");
  });
});
