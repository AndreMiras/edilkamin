import { beforeEach, describe, expect, it, vi } from "vitest";

import { TokenContext } from "../context/token";
import { render, screen } from "../test/utils";
import Header from "./Header";

describe("Header", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should render header with brand and logo", () => {
    render(<Header />);

    // Brand link should be present with logo and text
    const brandLink = screen.getByRole("link", { name: /edilkamin/i });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute("href", "/");
  });

  it("should render About link", () => {
    render(<Header />);

    const aboutLink = screen.getByRole("link", { name: /about/i });
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute(
      "href",
      "https://github.com/AndreMiras/edilkamin",
    );
  });

  it("should render LanguageSwitcher", () => {
    render(<Header />);

    // LanguageSwitcher should be present (displays as language code "EN")
    expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
  });

  it("should not render Login or Logout when not authenticated", () => {
    render(
      <TokenContext.Provider
        value={{
          token: null,
          setToken: vi.fn(),
        }}
      >
        <Header />
      </TokenContext.Provider>,
    );

    // Login form should NOT be present (login is only on Home page)
    expect(screen.queryByPlaceholderText("Username")).not.toBeInTheDocument();
    // Logout should also not be present
    expect(
      screen.queryByRole("button", { name: /logout/i }),
    ).not.toBeInTheDocument();
  });

  it("should render Logout component when authenticated", () => {
    render(
      <TokenContext.Provider
        value={{
          token: "test-token",
          setToken: vi.fn(),
        }}
      >
        <Header />
      </TokenContext.Provider>,
    );

    // Logout button should be present
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("should not render Login or Logout during loading state", () => {
    render(
      <TokenContext.Provider
        value={{
          token: undefined,
          setToken: vi.fn(),
        }}
      >
        <Header />
      </TokenContext.Provider>,
    );

    // Login form should NOT be present during loading (login is only on Home page)
    expect(screen.queryByPlaceholderText("Username")).not.toBeInTheDocument();
    // Logout should not be present either
    expect(
      screen.queryByRole("button", { name: /logout/i }),
    ).not.toBeInTheDocument();
  });
});
