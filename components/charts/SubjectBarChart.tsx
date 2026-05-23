"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export type SubjectScore = {
  subjectName: string;
  average: number;
};

export function SubjectBarChart({ data }: { data: SubjectScore[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
          <XAxis 
            dataKey="subjectName" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 12 }} 
            angle={-25} 
            textAnchor="end" 
            height={60}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            domain={["auto", "auto"]} 
            padding={{ top: 20 }}
            tick={{ fontSize: 12, fill: "#71717a" }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7' }}
          />
          <Bar dataKey="average" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="hsl(var(--chart-1, 220 70% 50%))" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
