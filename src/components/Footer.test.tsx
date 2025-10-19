import { describe, expect, it } from "vitest";

import { render, screen } from "../test/utils";
import Footer from "./Footer";

describe("Footer Component", () => {
  it("renders footer text with version", () => {
    render(<Footer />);

    expect(screen.getByText(/Open Edilkamin v/i)).toBeInTheDocument();
  });

  it("displays git describe version when available", () => {
    const originalGitDescribe = process.env.NEXT_PUBLIC_GIT_DESCRIBE;
    process.env.NEXT_PUBLIC_GIT_DESCRIBE = "v1.2.3";

    render(<Footer />);

    expect(screen.getByText(/v1\.2\.3/)).toBeInTheDocument();

    // Restore original value
    process.env.NEXT_PUBLIC_GIT_DESCRIBE = originalGitDescribe;
  });

  it('displays "dev" when git describe is not available', () => {
    const originalGitDescribe = process.env.NEXT_PUBLIC_GIT_DESCRIBE;
    delete process.env.NEXT_PUBLIC_GIT_DESCRIBE;

    render(<Footer />);

    expect(screen.getByText(/dev/)).toBeInTheDocument();

    // Restore original value
    process.env.NEXT_PUBLIC_GIT_DESCRIBE = originalGitDescribe;
  });

  it("renders with correct footer styling", () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector("footer");
    expect(footer).toHaveClass(
      "footer",
      "mt-auto",
      "py-3",
      "bg-body-secondary",
    );
  });

  it("centers the text content", () => {
    const { container } = render(<Footer />);

    const container_elem = container.querySelector(".text-center");
    expect(container_elem).toBeInTheDocument();
  });
});
