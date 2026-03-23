"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { BarChart3 } from "lucide-react";

export const MonthlySpendingChart = ({ data }) => {
  const hasData = data && data.length > 0;

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{data.month}</p>
          <p className="text-sm text-gray-600">
            ${data.amount.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <h2 className="text-base font-medium text-gray-900 mb-1">
        Monthly Spending Trend
      </h2>
      <p className="text-sm text-gray-400 mb-6">Last 4 months</p>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-7 h-7 text-gray-400" />
          </div>

          <p className="text-sm font-medium text-gray-700">
            No spending data
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Monthly spending will appear once transactions are added
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: -20, bottom: 20 }}
          >
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 14 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 14 }}
              ticks={[0, 1500, 3000, 4500, 6000]}
              domain={[0, 6000]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(15, 23, 42, 0.1)" }}
            />
            <Bar
              dataKey="amount"
              fill="#122B5B"
              radius={[4, 4, 0, 0]}
              barSize={80}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
