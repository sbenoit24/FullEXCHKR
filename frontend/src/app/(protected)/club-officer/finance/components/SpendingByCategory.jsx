"use client";
import React, { useState } from "react";
import { Inbox } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export const SpendingByCategory = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Function to determine if a color is dark or light
  const isColorDark = (hexColor) => {
    // Remove # if present
    const hex = hexColor.replace("#", "");

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return true if dark (luminance < 0.5)
    return luminance < 0.5;
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-600">{data.percentage.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const hasData =
    Array.isArray(data) &&
    data.length > 0 &&
    data.some((item) => item.percentage > 0);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <h2 className="text-base font-medium text-gray-900 mb-1">
        Spending by Category
      </h2>
      <p className="text-sm text-gray-400 mb-8">Distribution of expenses</p>

      <div className="flex flex-col items-center">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-gray-400" />
            </div>

            <p className="text-sm font-medium text-gray-700">
              No spending data
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Your expenses will appear here once added
            </p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="relative w-full max-w-md h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={120}
                    dataKey="percentage"
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={
                          activeIndex === null || activeIndex === index
                            ? 1
                            : 0.6
                        }
                        style={{
                          cursor: "pointer",
                          transition: "opacity 0.3s ease",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6 max-w-2xl">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    {item.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
