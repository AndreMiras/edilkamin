import { render, screen } from "@testing-library/react";
import { DeviceInfoType } from "edilkamin";
import { describe, expect, it, vi } from "vitest";

import UsageStatistics from "./UsageStatistics";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        "statistics.totalHours": "Total Operating Hours",
        "statistics.serviceDue": "Service Due",
        "statistics.serviceOk": "Service OK",
        "statistics.powerDistribution": "Power Distribution",
        "statistics.powerOns": "Power Ons",
        "statistics.blackouts": "Blackouts",
        "statistics.alarms": "Alarms",
      };
      if (key === "statistics.hoursSinceService" && params) {
        return `${params.hours}h / ${params.threshold}h`;
      }
      return translations[key] || key;
    },
  }),
}));

// Mock recharts components
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <svg data-testid="bar-chart">{children}</svg>
  ),
  Bar: ({ children }: { children?: React.ReactNode }) => (
    <g data-testid="bar">{children}</g>
  ),
  Cell: ({ fill }: { fill?: string }) => (
    <rect data-testid="cell" fill={fill} />
  ),
  XAxis: () => <g data-testid="x-axis" />,
  YAxis: () => <g data-testid="y-axis" />,
  Tooltip: () => <g data-testid="tooltip" />,
}));

describe("UsageStatistics", () => {
  const mockInfo: DeviceInfoType = {
    nvm: {
      total_counters: {
        power_ons: 150,
        p1_working_time: 10,
        p2_working_time: 20,
        p3_working_time: 30,
        p4_working_time: 25,
        p5_working_time: 15,
      },
      service_counters: {
        p1_working_time: 5,
        p2_working_time: 10,
        p3_working_time: 15,
        p4_working_time: 10,
        p5_working_time: 5,
      },
      regeneration: {
        time: 0,
        last_intervention: 0,
        daylight_time_flag: 0,
        blackout_counter: 3,
        airkare_working_hours_counter: 0,
      },
      alarms_log: {
        number: 7,
        index: 0,
        alarms: [],
      },
      user_parameters: {} as DeviceInfoType["nvm"]["user_parameters"],
    },
    status: {
      counters: {
        service_time: 50,
      },
      commands: {} as DeviceInfoType["status"]["commands"],
      temperatures: {} as DeviceInfoType["status"]["temperatures"],
      flags: {} as DeviceInfoType["status"]["flags"],
      pellet: {} as DeviceInfoType["status"]["pellet"],
      state: {} as DeviceInfoType["status"]["state"],
      fans: {} as DeviceInfoType["status"]["fans"],
    },
  };

  it("renders total operating hours", () => {
    render(<UsageStatistics info={mockInfo} />);
    // 10 + 20 + 30 + 25 + 15 = 100 hours
    expect(screen.getByText("100.0")).toBeInTheDocument();
    expect(screen.getByText("Total Operating Hours")).toBeInTheDocument();
  });

  it("renders power on count", () => {
    render(<UsageStatistics info={mockInfo} />);
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("Power Ons")).toBeInTheDocument();
  });

  it("renders blackout count", () => {
    render(<UsageStatistics info={mockInfo} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Blackouts")).toBeInTheDocument();
  });

  it("renders alarm count", () => {
    render(<UsageStatistics info={mockInfo} />);
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Alarms")).toBeInTheDocument();
  });

  it("shows service OK when under threshold", () => {
    render(<UsageStatistics info={mockInfo} />);
    // 5 + 10 + 15 + 10 + 5 = 45 hours since service (under 2000 threshold)
    expect(screen.getByText("Service OK")).toBeInTheDocument();
  });

  it("shows service due when over threshold", () => {
    const infoWithHighService: DeviceInfoType = {
      ...mockInfo,
      nvm: {
        ...mockInfo.nvm,
        service_counters: {
          p1_working_time: 500,
          p2_working_time: 500,
          p3_working_time: 500,
          p4_working_time: 500,
          p5_working_time: 500,
        },
      },
    };
    render(<UsageStatistics info={infoWithHighService} />);
    // 500 * 5 = 2500 hours since service (over 2000 threshold)
    expect(screen.getByText("Service Due")).toBeInTheDocument();
  });
});
