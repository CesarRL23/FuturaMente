"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type ProgressPoint = { week: number; value: number };

export function ProgressLineChart({ data }: { data: ProgressPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
          <XAxis dataKey="week" tickLine={false} axisLine={false} />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            domain={["auto", "auto"]} 
            padding={{ top: 20, bottom: 20 }}
            tick={{ fontSize: 12, fill: "#71717a" }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--chart-1, 221.2 83.2% 53.3%))"
            strokeWidth={3}
            dot={{ r: 4, fill: "white", strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

