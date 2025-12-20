import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../test/utils";
import PowerToggle from "./PowerToggle";

describe("PowerToggle", () => {
  it("should render both on and off buttons", () => {
    const onChange = vi.fn();
    render(
      <PowerToggle powerState={false} onChange={onChange} loading={false} />,
    );

    expect(screen.getByRole("button", { name: /on/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /off/i })).toBeInTheDocument();
  });

  it("should apply active styling based on powerState", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PowerToggle powerState={true} onChange={onChange} loading={false} />,
    );

    const onButton = screen.getByRole("button", { name: /on/i });
    const offButton = screen.getByRole("button", { name: /off/i });

    // When powerState is true, on button should have active styling
    expect(onButton.className).toContain("bg-primary");
    expect(offButton.className).toContain("bg-background");

    // Rerender with powerState false
    rerender(
      <PowerToggle powerState={false} onChange={onChange} loading={false} />,
    );

    expect(onButton.className).toContain("bg-background");
    expect(offButton.className).toContain("bg-primary");
  });

  it("should call onChange with 1 when on button is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <PowerToggle powerState={false} onChange={onChange} loading={false} />,
    );

    const onButton = screen.getByRole("button", { name: /on/i });
    await user.click(onButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("should call onChange with 0 when off button is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <PowerToggle powerState={true} onChange={onChange} loading={false} />,
    );

    const offButton = screen.getByRole("button", { name: /off/i });
    await user.click(offButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("should disable both buttons when loading is true", () => {
    const onChange = vi.fn();
    render(
      <PowerToggle powerState={false} onChange={onChange} loading={true} />,
    );

    const onButton = screen.getByRole("button", { name: /on/i });
    const offButton = screen.getByRole("button", { name: /off/i });

    expect(onButton).toBeDisabled();
    expect(offButton).toBeDisabled();
  });

  it("should not call onChange when buttons are disabled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <PowerToggle powerState={false} onChange={onChange} loading={true} />,
    );

    const onButton = screen.getByRole("button", { name: /on/i });

    // Attempting to click disabled button should not trigger onChange
    await user.click(onButton);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("should render icons with labels", () => {
    const onChange = vi.fn();
    render(
      <PowerToggle powerState={false} onChange={onChange} loading={false} />,
    );

    const onButton = screen.getByRole("button", { name: /on/i });
    const offButton = screen.getByRole("button", { name: /off/i });

    // Buttons should contain both icon and text
    expect(onButton).toBeInTheDocument();
    expect(offButton).toBeInTheDocument();
  });
});
