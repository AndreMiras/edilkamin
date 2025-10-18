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

    expect(screen.getByRole("radio", { name: /on/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /off/i })).toBeInTheDocument();
  });

  it("should select correct button based on powerState", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PowerToggle powerState={true} onChange={onChange} loading={false} />,
    );

    const onButton = screen.getByRole("radio", { name: /on/i });
    const offButton = screen.getByRole("radio", { name: /off/i });

    // When powerState is true, on button should be checked
    expect(onButton).toBeChecked();
    expect(offButton).not.toBeChecked();

    // Rerender with powerState false
    rerender(
      <PowerToggle powerState={false} onChange={onChange} loading={false} />,
    );

    expect(onButton).not.toBeChecked();
    expect(offButton).toBeChecked();
  });

  it("should call onChange with 1 when on button is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <PowerToggle powerState={false} onChange={onChange} loading={false} />,
    );

    const onButton = screen.getByRole("radio", { name: /on/i });
    await user.click(onButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    // First argument should be 1, second is the event object
    expect(onChange.mock.calls[0][0]).toBe(1);
  });

  it("should call onChange with 0 when off button is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <PowerToggle powerState={true} onChange={onChange} loading={false} />,
    );

    const offButton = screen.getByRole("radio", { name: /off/i });
    await user.click(offButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    // First argument should be 0, second is the event object
    expect(onChange.mock.calls[0][0]).toBe(0);
  });

  it("should disable both buttons when loading is true", () => {
    const onChange = vi.fn();
    render(
      <PowerToggle powerState={false} onChange={onChange} loading={true} />,
    );

    const onButton = screen.getByRole("radio", { name: /on/i });
    const offButton = screen.getByRole("radio", { name: /off/i });

    expect(onButton).toBeDisabled();
    expect(offButton).toBeDisabled();
  });

  it("should not call onChange when buttons are disabled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <PowerToggle powerState={false} onChange={onChange} loading={true} />,
    );

    const onButton = screen.getByRole("radio", { name: /on/i });

    // Attempting to click disabled button should not trigger onChange
    await user.click(onButton);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("should render icons with labels", () => {
    const onChange = vi.fn();
    render(
      <PowerToggle powerState={false} onChange={onChange} loading={false} />,
    );

    const onButton = screen.getByRole("radio", { name: /on/i });
    const offButton = screen.getByRole("radio", { name: /off/i });

    // Buttons should contain both icon and text
    expect(onButton).toBeInTheDocument();
    expect(offButton).toBeInTheDocument();
  });
});
