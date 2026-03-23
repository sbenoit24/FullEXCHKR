"use client";

import React from "react";
import { Wallet } from "lucide-react";

const BudgetCategories = ({ budgetData }) => {
  const calculatePercentage = (spent, total) => {
    if (!total) return 0;
    return (spent / total) * 100;
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  const hasBudget = budgetData && budgetData.length > 0;

  return (
    <div className="w-full rounded-2xl p-6 bg-white shadow-lg">
      <div className="mb-6 space-y-1">
        <p className="text-m text-[#0D214A]">Budget Categories</p>
        <p className="text-sm text-gray-500">
          Track spending against budgeted amounts
        </p>
      </div>

      {!hasBudget ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Wallet className="w-7 h-7 text-gray-400" />
          </div>

          <p className="text-sm font-medium text-gray-700">
            No active budget for this year
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Create a budget to start tracking your spending
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {budgetData.map((category, index) => {
            const percentage = calculatePercentage(
              category.spent,
              category.budgeted,
            );
            const remaining = category.budgeted - category.spent;

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-m text-gray-900">
                    {category.categoryName}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(category.spent)} /{" "}
                    {formatCurrency(category.budgeted)}
                  </span>
                </div>

                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#122B5B] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{percentage.toFixed(1)}% used</span>
                  <span>{formatCurrency(remaining)} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetCategories;
