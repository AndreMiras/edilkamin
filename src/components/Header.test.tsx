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
      "https://github.com/AndreMiras/edilkamin"
    );
  });

  it("should render LanguageSwitcher", () => {
    render(<Header />);

    // LanguageSwitcher should be present (displays as language code "EN")
    expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
  });

  it("should render Login component when not authenticated", () => {
    render(
      <TokenContext.Provider
        value={{
          token: null,
          setToken: vi.fn(),
        }}
      >
        <Header />
      </TokenContext.Provider>
    );

    // Login form should be present with username input
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
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
      </TokenContext.Provider>
    );

    // Logout button should be present
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("should render Login component during loading state", () => {
    render(
      <TokenContext.Provider
        value={{
          token: undefined,
          setToken: vi.fn(),
        }}
      >
        <Header />
      </TokenContext.Provider>
    );

    // Login component should be present during loading (same as unauthenticated)
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    // Logout should not be present
    expect(
      screen.queryByRole("button", { name: /logout/i })
    ).not.toBeInTheDocument();
  });
});
