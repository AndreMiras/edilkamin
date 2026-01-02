import { render, screen } from "@testing-library/react";
import { DeviceInfoType } from "edilkamin";
import { describe, expect, it, vi } from "vitest";

import AlarmHistory from "./AlarmHistory";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        "alarmHistory.noAlarms": "No alarms recorded",
        "alarmHistory.code": "Code",
        "alarmHistory.alarms.1": "Flue/chimney blockage",
        "alarmHistory.alarms.3": "Pellet tank empty",
        "alarmHistory.alarms.21": "Power outage detected",
      };
      if (key === "alarmHistory.totalCount" && params) {
        return `${params.count} alarm(s) recorded`;
      }
      return translations[key] || key;
    },
    i18n: {
      language: "en",
    },
  }),
}));

describe("AlarmHistory", () => {
  const baseInfo: DeviceInfoType = {
    nvm: {
      total_counters: {
        power_ons: 0,
        p1_working_time: 0,
        p2_working_time: 0,
        p3_working_time: 0,
        p4_working_time: 0,
        p5_working_time: 0,
      },
      service_counters: {
        p1_working_time: 0,
        p2_working_time: 0,
        p3_working_time: 0,
        p4_working_time: 0,
        p5_working_time: 0,
      },
      regeneration: {
        time: 0,
        last_intervention: 0,
        daylight_time_flag: 0,
        blackout_counter: 0,
        airkare_working_hours_counter: 0,
      },
      alarms_log: {
        number: 0,
        index: 0,
        alarms: [],
      },
      user_parameters: {} as DeviceInfoType["nvm"]["user_parameters"],
    },
    status: {
      counters: {
        service_time: 0,
      },
      commands: {} as DeviceInfoType["status"]["commands"],
      temperatures: {} as DeviceInfoType["status"]["temperatures"],
      flags: {
        is_pellet_in_reserve: false,
        is_relax_active: false,
        is_airkare_active: false,
        is_crono_active: false,
        is_easytimer_active: false,
        is_cochlea_in_continuous_mode: false,
      },
      pellet: {} as DeviceInfoType["status"]["pellet"],
      state: {} as DeviceInfoType["status"]["state"],
      fans: {} as DeviceInfoType["status"]["fans"],
      easytimer: { time: 0 },
    },
  };

  it("renders empty state when no alarms", () => {
    render(<AlarmHistory info={baseInfo} />);
    expect(screen.getByText("No alarms recorded")).toBeInTheDocument();
  });

  it("renders alarm list when alarms exist", () => {
    const infoWithAlarms: DeviceInfoType = {
      ...baseInfo,
      nvm: {
        ...baseInfo.nvm,
        alarms_log: {
          number: 2,
          index: 1,
          alarms: [
            { type: 3, timestamp: 1704067200 }, // 2024-01-01 00:00:00 UTC - Pellet tank empty
            { type: 1, timestamp: 1704153600 }, // 2024-01-02 00:00:00 UTC - Flue blockage
          ],
        },
      },
    };

    render(<AlarmHistory info={infoWithAlarms} />);

    expect(screen.getByText("2 alarm(s) recorded")).toBeInTheDocument();
    expect(screen.getByText("Flue/chimney blockage")).toBeInTheDocument();
    expect(screen.getByText("Pellet tank empty")).toBeInTheDocument();
  });

  it("filters out NONE (type 0) alarms", () => {
    const infoWithNoneAlarm: DeviceInfoType = {
      ...baseInfo,
      nvm: {
        ...baseInfo.nvm,
        alarms_log: {
          number: 2,
          index: 1,
          alarms: [
            { type: 0, timestamp: 1704067200 }, // NONE alarm - should be filtered
            { type: 3, timestamp: 1704153600 }, // Pellet tank empty
          ],
        },
      },
    };

    render(<AlarmHistory info={infoWithNoneAlarm} />);

    expect(screen.getByText("Pellet tank empty")).toBeInTheDocument();
    // Should show only 1 alarm visually (the non-NONE one)
    expect(screen.queryAllByText(/Code:/)).toHaveLength(1);
  });

  it("sorts alarms by timestamp (newest first)", () => {
    const infoWithAlarms: DeviceInfoType = {
      ...baseInfo,
      nvm: {
        ...baseInfo.nvm,
        alarms_log: {
          number: 2,
          index: 1,
          alarms: [
            { type: 3, timestamp: 1704067200 }, // Older - Pellet tank empty
            { type: 1, timestamp: 1704153600 }, // Newer - Flue blockage
          ],
        },
      },
    };

    render(<AlarmHistory info={infoWithAlarms} />);

    const alarmElements = screen.getAllByText(/Code:/);
    expect(alarmElements).toHaveLength(2);

    // The first element should contain code 1 (newer), second should contain code 3 (older)
    const firstAlarmContainer = alarmElements[0].closest(".bg-muted");
    const secondAlarmContainer = alarmElements[1].closest(".bg-muted");

    expect(firstAlarmContainer).toHaveTextContent("Code: 1");
    expect(secondAlarmContainer).toHaveTextContent("Code: 3");
  });

  it("displays alarm code in the UI", () => {
    const infoWithAlarm: DeviceInfoType = {
      ...baseInfo,
      nvm: {
        ...baseInfo.nvm,
        alarms_log: {
          number: 1,
          index: 0,
          alarms: [{ type: 21, timestamp: 1704067200 }],
        },
      },
    };

    const { container } = render(<AlarmHistory info={infoWithAlarm} />);

    // Check that the alarm code is displayed in the alarm item
    const alarmItem = container.querySelector(".bg-muted");
    expect(alarmItem).toHaveTextContent("Code: 21");
  });

  it("handles alarms with timestamp 0 gracefully", () => {
    const infoWithZeroTimestamp: DeviceInfoType = {
      ...baseInfo,
      nvm: {
        ...baseInfo.nvm,
        alarms_log: {
          number: 1,
          index: 0,
          alarms: [{ type: 3, timestamp: 0 }],
        },
      },
    };

    render(<AlarmHistory info={infoWithZeroTimestamp} />);

    expect(screen.getByText("Pellet tank empty")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument(); // Timestamp should show "-"
  });

  it("uses fallback description for unknown alarm types", () => {
    const infoWithUnknownAlarm: DeviceInfoType = {
      ...baseInfo,
      nvm: {
        ...baseInfo.nvm,
        alarms_log: {
          number: 1,
          index: 0,
          alarms: [{ type: 99, timestamp: 1704067200 }], // Unknown type
        },
      },
    };

    render(<AlarmHistory info={infoWithUnknownAlarm} />);

    // Should show unknown alarm with code 99
    // The alarm code appears in both the description (as key) and the code display
    expect(screen.getAllByText(/99/).length).toBeGreaterThan(0);
  });
});
