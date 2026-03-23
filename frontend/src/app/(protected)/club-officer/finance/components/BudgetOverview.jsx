"use client";

import React from "react";
import { PiggyBank } from "lucide-react";

const BudgetOverview = ({ budgetData }) => {
  const calculatePercentage = (spent, budgeted) => {
    return budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
  };

  const calculateRemaining = (spent, budgeted) => {
    return budgeted - spent;
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800";
    if (percentage >= 50) return "bg-green-100 text-green-800";
    return "bg-green-100 text-green-800";
  };

  const hasBudget = budgetData && budgetData.length > 0;

  return (
    <div className="bg-white rounded-2xl w-full p-5 shadow-lg">
      <div className="mb-6 space-y-1">
        <p className="text-m text-[#0D214A]">Budget Overview</p>
        <p className="text-xs text-gray-500">
          Manage your organization's budget categories
        </p>
      </div>

      {!hasBudget ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <PiggyBank className="w-7 h-7 text-gray-400" />
          </div>

          <p className="text-sm font-medium text-gray-700">
            No active budget for this year
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Create budget categories to start tracking usage
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {budgetData.map((category, index) => {
            const percentage = calculatePercentage(
              category.spent,
              category.budgeted,
            );
            const remaining = calculateRemaining(
              category.spent,
              category.budgeted,
            );

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-5"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <h2 className="text-m text-gray-900">
                      {category.categoryName}
                    </h2>
                    <p className="text-xs text-gray-500">
                      ${category.spent.toLocaleString()} spent of $
                      {category.budgeted.toLocaleString()} budgeted
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${getPercentageColor(
                      percentage,
                    )}`}
                  >
                    {percentage}% used
                  </span>
                </div>

                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#122B5B] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  ${remaining.toLocaleString()} remaining
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;
