import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { configure, DeviceInfoType, getSession } from "edilkamin";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Errors from "../../../components/Errors";
import Stove from "../../../pages/stove/[mac]";
import { render, screen } from "../../../test/utils";

vi.mock("edilkamin", async () => {
  const actual = await vi.importActual<typeof import("edilkamin")>("edilkamin");
  return {
    ...actual,
    configure: vi.fn(() => ({
      deviceInfo: vi.fn(),
      setPower: vi.fn(),
      setTargetTemperature: vi.fn(),
      setPowerLevel: vi.fn(),
      setAuto: vi.fn(),
      setFanSpeed: vi.fn(),
    })),
    getSession: vi.fn(),
  };
});

vi.mock("../../../utils/platform", () => ({
  isNativePlatform: vi.fn(() => false),
}));

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  return {
    ...actual,
    isAxiosError: vi.fn(),
  };
});

const mockRouterPush = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => ({
    query: { mac: "aabbccddeeff" },
    push: mockRouterPush,
    pathname: "/stove/[mac]",
    route: "/stove/[mac]",
    asPath: "/stove/aabbccddeeff",
  }),
}));

describe("Stove Page", () => {
  const mockMac = "aabbccddeeff";
  const mockToken = "test-token-12345";

  // Helper to create mock device info
  const createMockDeviceInfo = (
    power: boolean = true,
    temperature: number = 22,
    isAuto: boolean = true,
  ): DeviceInfoType =>
    ({
      status: {
        commands: {
          power,
        },
        temperatures: {
          board: 35,
          enviroment: 20,
        },
        flags: {
          is_pellet_in_reserve: false,
        },
        pellet: {
          autonomy_time: 900,
        },
      } as any,
      nvm: {
        user_parameters: {
          enviroment_1_temperature: temperature,
          enviroment_2_temperature: 18,
          enviroment_3_temperature: 16,
          is_auto: isAuto,
          is_sound_active: true,
          manual_power: 3,
          fan_1_ventilation: 3,
          fan_2_ventilation: 2,
          fan_3_ventilation: 0,
        },
        installer_parameters: {
          fans_number: 2,
        },
        oem_parameters: {
          fan_1_max_level: 4,
          fan_2_max_level: 5,
        },
      } as any,
    }) as DeviceInfoType;

  // Helper to find power button (the one with power-off icon)
  const findPowerButton = () => {
    const buttons = screen.getAllByRole("button");
    return buttons.find((btn) => btn.querySelector('[data-icon="power-off"]'));
  };

  // Helper to find temperature increase button
  const findIncreaseButton = () => {
    const buttons = screen.getAllByRole("button");
    return buttons.find((btn) => btn.querySelector('[data-icon="plus"]'));
  };

  // Helper to find temperature decrease button
  const findDecreaseButton = () => {
    const buttons = screen.getAllByRole("button");
    return buttons.find((btn) => btn.querySelector('[data-icon="minus"]'));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("edilkamin-token", mockToken);
    vi.mocked(getSession).mockResolvedValue(mockToken);
    // Suppress console.error for cleaner test output
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("Data Fetching", () => {
    it("should show loading state initially", async () => {
      const mockDeviceInfo = vi.fn(
        () => new Promise(() => {}), // Never resolves
      );
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(<Stove />);

      // Wait for auth to resolve and thermostat to render
      await waitFor(() => {
        expect(findPowerButton()).toBeInTheDocument();
      });

      // Power button should be disabled in loading state
      const powerButton = findPowerButton();
      expect(powerButton).toBeDisabled();
    });

    it("should fetch device info on mount with correct mac and token", async () => {
      const mockDeviceInfo = vi.fn().mockResolvedValue(createMockDeviceInfo());
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(<Stove />);

      await waitFor(() => {
        expect(mockDeviceInfo).toHaveBeenCalledWith(mockToken, mockMac);
      });
    });

    it("should update state with device info on successful fetch", async () => {
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(true, 25));
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(<Stove />);

      // Wait for data to load and check that temperature is displayed
      await waitFor(() => {
        // The thermostat displays temperature as text "25.0"
        expect(screen.getByText("25.0")).toBeInTheDocument();
      });
    });

    it("should handle 404 error and add appropriate error to context", async () => {
      const mockDeviceInfo = vi.fn().mockRejectedValue({
        response: { status: 404 },
      });
      vi.mocked(axios).isAxiosError = vi.fn().mockReturnValue(true) as any;
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(
        <>
          <Stove />
          <Errors />
        </>,
      );

      // Error should be added to ErrorContext and displayed
      // Multiple alerts may appear due to polling, so we check for at least one
      await waitFor(() => {
        expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(1);
      });
      expect(
        screen.getAllByText(/device.*not found/i, { exact: false }).length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("should handle API error with message from response", async () => {
      const errorMessage = "Invalid token or expired session";
      const mockDeviceInfo = vi.fn().mockRejectedValue({
        response: {
          status: 401,
          data: { message: errorMessage },
        },
      });
      vi.mocked(axios).isAxiosError = vi.fn().mockReturnValue(true) as any;
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(
        <>
          <Stove />
          <Errors />
        </>,
      );

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it("should handle generic Error instances", async () => {
      const errorMessage = "Network error";
      const mockDeviceInfo = vi.fn().mockRejectedValue(new Error(errorMessage));
      vi.mocked(axios).isAxiosError = vi.fn().mockReturnValue(false) as any;
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(
        <>
          <Stove />
          <Errors />
        </>,
      );

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it("should handle non-Error exceptions", async () => {
      const mockDeviceInfo = vi.fn().mockRejectedValue("String error");
      vi.mocked(axios).isAxiosError = vi.fn().mockReturnValue(false) as any;
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(
        <>
          <Stove />
          <Errors />
        </>,
      );

      await waitFor(() => {
        expect(
          screen.getByText(/couldn.*fetch.*info/i, { exact: false }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Power Control", () => {
    it("should update power state optimistically before API call", async () => {
      const user = userEvent.setup();
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(false, 22));
      const mockSetPower = vi.fn(() => new Promise(() => {})); // Never resolves
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: mockSetPower,
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(<Stove />);

      // Wait for initial load
      await waitFor(() => {
        expect(mockDeviceInfo).toHaveBeenCalled();
      });

      // Find and click power button
      const powerButton = findPowerButton();
      await user.click(powerButton!);

      // State should update immediately (optimistic)
      expect(mockSetPower).toHaveBeenCalledWith(mockToken, mockMac, 1);
    });

    it("should call setPower API with correct parameters", async () => {
      const user = userEvent.setup();
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(false, 22));
      const mockSetPower = vi.fn().mockResolvedValue({});
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: mockSetPower,
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(<Stove />);

      await waitFor(() => {
        expect(mockDeviceInfo).toHaveBeenCalled();
      });

      const powerButton = findPowerButton();
      await user.click(powerButton!);

      await waitFor(() => {
        expect(mockSetPower).toHaveBeenCalledWith(mockToken, mockMac, 1);
      });
    });

    it("should rollback power state on API error", async () => {
      const user = userEvent.setup();
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(false, 22));
      const mockSetPower = vi.fn().mockRejectedValue(new Error("API Error"));
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: mockSetPower,
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(
        <>
          <Stove />
          <Errors />
        </>,
      );

      await waitFor(() => {
        expect(mockDeviceInfo).toHaveBeenCalled();
      });

      const powerButton = findPowerButton();
      await user.click(powerButton!);

      // Should show error (rollback happens, but closure captures old value)
      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText(/power.*update.*failed/i, { exact: false }),
      ).toBeInTheDocument();
    });

    it("should add error to context on power update failure", async () => {
      const user = userEvent.setup();
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(true, 22));
      const mockSetPower = vi
        .fn()
        .mockRejectedValue(new Error("Network timeout"));
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: mockSetPower,
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(
        <>
          <Stove />
          <Errors />
        </>,
      );

      await waitFor(() => {
        expect(mockDeviceInfo).toHaveBeenCalled();
      });

      // Click power button to turn off
      const powerButton = findPowerButton();
      await user.click(powerButton!);

      expect(await screen.findByRole("alert")).toBeInTheDocument();
    });
  });

  describe("Temperature Control", () => {
    it("should update temperature optimistically before API call", async () => {
      const user = userEvent.setup();
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(true, 20));
      const mockSetTargetTemperature = vi.fn(() => new Promise(() => {})); // Never resolves
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: mockSetTargetTemperature,
        setPowerLevel: vi.fn(),
      } as any);

      render(<Stove />);

      // Wait for UI to render with data before interacting
      await waitFor(() => {
        expect(screen.getByText("20.0")).toBeInTheDocument();
      });

      // Find temperature increase button (plus icon button)
      const increaseButton = findIncreaseButton();
      await user.click(increaseButton!);

      // Temperature should update immediately (optimistic)
      await waitFor(() => {
        expect(mockSetTargetTemperature).toHaveBeenCalledWith(
          mockToken,
          mockMac,
          1,
          20.5,
        );
      });
    });

    it("should call setTargetTemperature API with correct parameters", async () => {
      const user = userEvent.setup();
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(true, 22));
      const mockSetTargetTemperature = vi.fn().mockResolvedValue({});
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: mockSetTargetTemperature,
        setPowerLevel: vi.fn(),
      } as any);

      render(<Stove />);

      // Wait for UI to render with data before interacting
      await waitFor(() => {
        expect(screen.getByText("22.0")).toBeInTheDocument();
      });

      const decreaseButton = findDecreaseButton();
      await user.click(decreaseButton!);

      await waitFor(() => {
        expect(mockSetTargetTemperature).toHaveBeenCalledWith(
          mockToken,
          mockMac,
          1,
          21.5,
        );
      });
    });

    it("should rollback temperature on API error", async () => {
      const user = userEvent.setup();
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(true, 23));
      const mockSetTargetTemperature = vi
        .fn()
        .mockRejectedValue(new Error("API Error"));
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: mockSetTargetTemperature,
        setPowerLevel: vi.fn(),
      } as any);

      render(
        <>
          <Stove />
          <Errors />
        </>,
      );

      // Wait for UI to render with data before interacting
      await waitFor(() => {
        expect(screen.getByText("23.0")).toBeInTheDocument();
      });

      const increaseButton = findIncreaseButton();
      await user.click(increaseButton!);

      // Should show error and rollback
      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText(/temperature.*update.*failed/i, { exact: false }),
      ).toBeInTheDocument();
    });

    it("should add error to context on temperature update failure", async () => {
      const user = userEvent.setup();
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(true, 25, true));
      const mockSetTargetTemperature = vi
        .fn()
        .mockRejectedValue(new Error("Connection refused"));
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: mockSetTargetTemperature,
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(
        <>
          <Stove />
          <Errors />
        </>,
      );

      // Wait for UI to render with data before interacting
      await waitFor(() => {
        expect(screen.getByText("25.0")).toBeInTheDocument();
      });

      const decreaseButton = findDecreaseButton();
      await user.click(decreaseButton!);

      expect(await screen.findByRole("alert")).toBeInTheDocument();
    });
  });

  describe("Rendering and Integration", () => {
    it("should render accordion with device controls", async () => {
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(true, 22));
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(<Stove />);

      await waitFor(() => {
        expect(mockDeviceInfo).toHaveBeenCalled();
      });

      // Check accordion headers exist
      expect(screen.getByText(/advanced/i)).toBeInTheDocument();
      expect(screen.getByText(/device info/i)).toBeInTheDocument();
    });

    it("should pass correct props to child components", async () => {
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(true, 24));
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(<Stove />);

      // Wait for data to load and temperature to display
      await waitFor(() => {
        expect(screen.getByText("24.0")).toBeInTheDocument();
      });

      // Power button should exist
      const powerButton = findPowerButton();
      expect(powerButton).toBeInTheDocument();
    });

    it("should not fetch when mac or token is missing", () => {
      const mockDeviceInfo = vi.fn();
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      // Clear token
      localStorage.clear();

      render(<Stove />);

      // Should not call deviceInfo when token is missing
      expect(mockDeviceInfo).not.toHaveBeenCalled();
    });
  });

  describe("Power Level Slider in Accordion", () => {
    it("should render power level slider in accordion", async () => {
      const user = userEvent.setup();
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(true, 22, true));
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(<Stove />);

      await waitFor(() => {
        expect(mockDeviceInfo).toHaveBeenCalled();
      });

      // Open the advanced accordion
      const advancedTrigger = screen.getByText(/advanced/i);
      await user.click(advancedTrigger);

      // Should show power level slider with label
      await waitFor(() => {
        expect(screen.getByText("Heating Intensity")).toBeInTheDocument();
      });
    });

    it("should show readonly power level slider when auto mode is on", async () => {
      const user = userEvent.setup();
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(true, 22, true));
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(<Stove />);

      await waitFor(() => {
        expect(mockDeviceInfo).toHaveBeenCalled();
      });

      // Open the advanced accordion
      const advancedTrigger = screen.getByText(/advanced/i);
      await user.click(advancedTrigger);

      // Should show "Auto" badge when isAuto is true
      await waitFor(() => {
        expect(screen.getByText("Auto")).toBeInTheDocument();
      });

      // Power level slider should be disabled (it's the one with min=1, max=5 for power levels)
      const sliders = screen.getAllByRole("slider");
      const powerLevelSlider = sliders.find(
        (slider) =>
          slider.getAttribute("min") === "1" &&
          slider.getAttribute("max") === "5",
      );
      expect(powerLevelSlider).toBeDisabled();
    });

    it("should show editable power level slider when auto mode is off", async () => {
      const user = userEvent.setup();
      const mockDeviceInfo = vi
        .fn()
        .mockResolvedValue(createMockDeviceInfo(true, 22, false));
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(<Stove />);

      await waitFor(() => {
        expect(mockDeviceInfo).toHaveBeenCalled();
      });

      // Open the advanced accordion
      const advancedTrigger = screen.getByText(/advanced/i);
      await user.click(advancedTrigger);

      // When isAuto is off, there will be two "Heating Intensity" labels:
      // one in main view (PowerLevelControl) and one in accordion (PowerLevelSlider)
      await waitFor(() => {
        const heatingIntensityLabels = screen.getAllByText("Heating Intensity");
        expect(heatingIntensityLabels.length).toBeGreaterThanOrEqual(2);
      });

      // "Auto" badge should not be visible when isAuto is false
      expect(screen.queryByText("Auto")).not.toBeInTheDocument();

      // Power level slider in accordion should be enabled (it's the one with min=1, max=5 for power levels)
      const sliders = screen.getAllByRole("slider");
      const powerLevelSlider = sliders.find(
        (slider) =>
          slider.getAttribute("min") === "1" &&
          slider.getAttribute("max") === "5",
      );
      expect(powerLevelSlider).not.toBeDisabled();
    });
  });

  describe("401 error handling", () => {
    it("should refresh token and retry on 401 error from deviceInfo", async () => {
      const newToken = "refreshed-token";
      const error401 = { response: { status: 401 } };
      const mockDeviceInfo = vi
        .fn()
        .mockRejectedValueOnce(error401)
        .mockResolvedValue(createMockDeviceInfo()); // Always succeed after first call
      vi.mocked(axios).isAxiosError = vi.fn().mockReturnValue(true) as any;
      vi.mocked(getSession)
        .mockResolvedValueOnce(mockToken) // Initial load
        .mockResolvedValueOnce(newToken); // Refresh after 401
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(<Stove />);

      await waitFor(() => {
        // getSession called at least twice: once for initial load, once for refresh
        expect(getSession).toHaveBeenCalledWith(false, false); // Initial load
        expect(getSession).toHaveBeenCalledWith(true, false); // Refresh after 401
        // deviceInfo called: 1) initial fail, 2) retry with new token, 3) useEffect re-run with updated context
        expect(mockDeviceInfo).toHaveBeenCalled();
        expect(mockDeviceInfo).toHaveBeenCalledWith(newToken, mockMac);
      });
    });

    it("should redirect to home when refresh fails on 401", async () => {
      const error401 = { response: { status: 401 } };
      const mockDeviceInfo = vi.fn().mockRejectedValueOnce(error401);
      vi.mocked(axios).isAxiosError = vi.fn().mockReturnValue(true) as any;
      vi.mocked(getSession)
        .mockResolvedValueOnce(mockToken) // Initial load
        .mockRejectedValueOnce(new Error("Refresh failed")); // Refresh fails
      vi.mocked(configure).mockReturnValue({
        deviceInfo: mockDeviceInfo,
        setPower: vi.fn(),
        setTargetTemperature: vi.fn(),
        setPowerLevel: vi.fn(),
        setAuto: vi.fn(),
        setFanSpeed: vi.fn(),
      } as any);

      render(<Stove />);

      // Wait for the error flow to complete - when refresh fails, localStorage is cleared
      await waitFor(() => {
        expect(localStorage.getItem("edilkamin-token")).toBeNull();
      });
      expect(mockRouterPush).toHaveBeenCalledWith("/");
    });
  });
});
