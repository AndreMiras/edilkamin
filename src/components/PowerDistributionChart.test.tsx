import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PowerDistributionChart from "./PowerDistributionChart";

// Mock recharts components since they require browser-like environment
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: { name: string }[];
  }) => (
    <svg data-testid="bar-chart">
      {children}
      {data.map((d) => (
        <text key={d.name}>{d.name}</text>
      ))}
    </svg>
  ),
  Bar: ({
    children,
  }: {
    children?: React.ReactNode;
    dataKey?: string;
    radius?: number[];
  }) => <g data-testid="bar">{children}</g>,
  Cell: ({ fill }: { fill?: string }) => (
    <rect data-testid="cell" fill={fill} />
  ),
  XAxis: () => <g data-testid="x-axis" />,
  YAxis: () => <g data-testid="y-axis" />,
  Tooltip: () => <g data-testid="tooltip" />,
}));

describe("PowerDistributionChart", () => {
  const mockDistribution = {
    p1: 15.5,
    p2: 25.0,
    p3: 30.0,
    p4: 20.0,
    p5: 9.5,
  };

  it("renders bar chart", () => {
    const { getByTestId } = render(
      <PowerDistributionChart distribution={mockDistribution} />,
    );
    expect(getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("renders all power level labels", () => {
    const { getByText } = render(
      <PowerDistributionChart distribution={mockDistribution} />,
    );
    expect(getByText("P1")).toBeInTheDocument();
    expect(getByText("P2")).toBeInTheDocument();
    expect(getByText("P3")).toBeInTheDocument();
    expect(getByText("P4")).toBeInTheDocument();
    expect(getByText("P5")).toBeInTheDocument();
  });

  it("renders cells for data points", () => {
    const { getAllByTestId } = render(
      <PowerDistributionChart distribution={mockDistribution} />,
    );
    const cells = getAllByTestId("cell");
    expect(cells.length).toBe(5);
  });
});
