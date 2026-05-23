"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type SubjectScore = {
  subjectName: string;
  average: number;
};

export function SubjectRadarChart({ data }: { data: SubjectScore[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid opacity={0.5} />
          <PolarAngleAxis dataKey="subjectName" tick={{ fontSize: 12, fill: '#52525b' }} />
          <PolarRadiusAxis 
            angle={30} 
            domain={["auto", "auto"]} 
            tick={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7' }}
          />
          <Radar
            name="Promedio"
            dataKey="average"
            stroke="hsl(var(--chart-1, 220 70% 50%))"
            fill="hsl(var(--chart-1, 220 70% 50%))"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
