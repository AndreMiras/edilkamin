import { render, screen } from "@testing-library/react";
import { ComponentInfoType, ComponentType } from "edilkamin";
import { describe, expect, it, vi } from "vitest";

import SoftwareInfo from "./SoftwareInfo";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "software.motherboard": "Motherboard",
        "software.emergencyPanel": "Emergency Panel",
        "software.radioControl": "Radio Control",
        "software.idroPanel": "Idro Panel",
        "software.boardName": "Board",
        "software.application": "Application",
        "software.bootloader": "Bootloader",
        "software.notAvailable": "Software information not available",
      };
      return translations[key] || key;
    },
  }),
}));

const createEmptyComponent = (): ComponentType => ({
  serial_number: "",
  board_name: "",
  bootloader_name: "",
  bootloader_version: "",
  application_name: "",
  application_version: "",
  compatibility: 0,
});

const createMockComponentInfo = (
  overrides: Partial<ComponentInfoType> = {},
): ComponentInfoType => ({
  timestamp: 1234567890,
  motherboard: createEmptyComponent(),
  emergency_panel: createEmptyComponent(),
  radio_control: createEmptyComponent(),
  expansion_board: createEmptyComponent(),
  remote_user_panel_1: createEmptyComponent(),
  remote_user_panel_2: createEmptyComponent(),
  remote_user_panel_3: createEmptyComponent(),
  temp_umidity_voc_probe_1: createEmptyComponent(),
  temp_umidity_voc_probe_2: createEmptyComponent(),
  temp_umidity_voc_probe_3: createEmptyComponent(),
  wifi_ble_module: createEmptyComponent(),
  idro_panel: createEmptyComponent(),
  general: { check: 0 },
  ...overrides,
});

describe("SoftwareInfo", () => {
  it("renders not available message when componentInfo is undefined", () => {
    render(<SoftwareInfo componentInfo={undefined} />);
    expect(
      screen.getByText("Software information not available"),
    ).toBeInTheDocument();
  });

  it("renders not available message when no components have version data", () => {
    const componentInfo = createMockComponentInfo();
    render(<SoftwareInfo componentInfo={componentInfo} />);
    expect(
      screen.getByText("Software information not available"),
    ).toBeInTheDocument();
  });

  it("renders motherboard info when available", () => {
    const componentInfo = createMockComponentInfo({
      motherboard: {
        serial_number: "",
        board_name: "LX0320 1.2",
        bootloader_name: "BOOT EDK2020_MB",
        bootloader_version: "2.0.211112a",
        application_name: "EDK2020_MB",
        application_version: "3.6.221008a",
        compatibility: 0,
      },
    });

    render(<SoftwareInfo componentInfo={componentInfo} />);

    expect(screen.getByText("Motherboard")).toBeInTheDocument();
    expect(screen.getByText("LX0320 1.2")).toBeInTheDocument();
    expect(screen.getByText("EDK2020_MB 3.6.221008a")).toBeInTheDocument();
    expect(screen.getByText("BOOT EDK2020_MB 2.0.211112a")).toBeInTheDocument();
  });

  it("renders multiple components when they have data", () => {
    const componentInfo = createMockComponentInfo({
      motherboard: {
        serial_number: "",
        board_name: "LX0320",
        bootloader_name: "",
        bootloader_version: "",
        application_name: "MB_APP",
        application_version: "1.0.0",
        compatibility: 0,
      },
      emergency_panel: {
        serial_number: "",
        board_name: "LX0920",
        bootloader_name: "",
        bootloader_version: "",
        application_name: "EP_APP",
        application_version: "2.0.0",
        compatibility: 0,
      },
    });

    render(<SoftwareInfo componentInfo={componentInfo} />);

    expect(screen.getByText("Motherboard")).toBeInTheDocument();
    expect(screen.getByText("Emergency Panel")).toBeInTheDocument();
  });

  it("hides components without version data", () => {
    const componentInfo = createMockComponentInfo({
      motherboard: {
        serial_number: "",
        board_name: "LX0320",
        bootloader_name: "",
        bootloader_version: "",
        application_name: "MB_APP",
        application_version: "1.0.0",
        compatibility: 0,
      },
      // radio_control has no version data
    });

    render(<SoftwareInfo componentInfo={componentInfo} />);

    expect(screen.getByText("Motherboard")).toBeInTheDocument();
    expect(screen.queryByText("Radio Control")).not.toBeInTheDocument();
  });
});
