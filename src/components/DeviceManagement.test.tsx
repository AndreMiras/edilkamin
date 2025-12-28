import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "../test/utils";
import DeviceManagement from "./DeviceManagement";

describe("DeviceManagement", () => {
  const defaultProps = {
    devices: [],
    onAdd: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("controlled mode", () => {
    it("should show dialog when open prop is true", () => {
      render(<DeviceManagement {...defaultProps} open={true} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should hide dialog when open prop is false", () => {
      render(<DeviceManagement {...defaultProps} open={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should call onOpenChange when dialog trigger is clicked", async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DeviceManagement
          {...defaultProps}
          open={false}
          onOpenChange={onOpenChange}
        />,
      );

      const triggerButton = screen.getByRole("button", {
        name: /manage devices/i,
      });
      await user.click(triggerButton);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it("should call onOpenChange with false when dialog is closed", async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DeviceManagement
          {...defaultProps}
          open={true}
          onOpenChange={onOpenChange}
        />,
      );

      // Close button in dialog header
      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("uncontrolled mode", () => {
    it("should work without open/onOpenChange props", async () => {
      const user = userEvent.setup();

      render(<DeviceManagement {...defaultProps} />);

      // Dialog should not be visible initially
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // Click trigger to open
      const triggerButton = screen.getByRole("button", {
        name: /manage devices/i,
      });
      await user.click(triggerButton);

      // Dialog should be visible
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });
  });
});
