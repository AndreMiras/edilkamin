import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { COLORS } from "@/utils/colors";

interface PowerDistributionChartProps {
  distribution: {
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    p5: number;
  };
}

const CHART_COLORS = COLORS.chart.palette;

const PowerDistributionChart = ({
  distribution,
}: PowerDistributionChartProps) => {
  const data = [
    { name: "P1", value: distribution.p1, fill: CHART_COLORS[0] },
    { name: "P2", value: distribution.p2, fill: CHART_COLORS[1] },
    { name: "P3", value: distribution.p3, fill: CHART_COLORS[2] },
    { name: "P4", value: distribution.p4, fill: CHART_COLORS[3] },
    { name: "P5", value: distribution.p5, fill: CHART_COLORS[4] },
  ];

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis type="category" dataKey="name" />
          <YAxis type="number" domain={[0, 100]} unit="%" />
          <Tooltip
            formatter={(value) =>
              typeof value === "number" ? `${value.toFixed(1)}%` : value
            }
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PowerDistributionChart;
