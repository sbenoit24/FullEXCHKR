"use client";

import React, { useState, useEffect } from "react";

const BudgetConfigureModal = ({
  isOpen,
  onClose,
  onSave,
  availableCategories,
  budgetExists,
  existingBudget,
}) => {
  const [totalBudget, setTotalBudget] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryAllocations, setCategoryAllocations] = useState({});
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleTotalBudgetChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setTotalBudget(value);
  };

  const handleCategorySelect = (category) => {
    if (
      !selectedCategories.some((cat) => cat.categoryId === category.categoryId)
    ) {
      setSelectedCategories([
        ...selectedCategories,
        { ...category, isNew: false },
      ]);
      setCategoryAllocations((prev) => ({
        ...prev,
        [category.categoryId]: "",
      }));
    }
    setShowCategoryDropdown(false);
  };

  const handleAddCustomCategory = () => {
    const tempId = `temp-${Date.now()}`;
    const newCategory = {
      categoryId: null,
      tempId: tempId,
      categoryName: "",
      isNew: true,
    };
    setSelectedCategories([...selectedCategories, newCategory]);
    setCategoryAllocations((prev) => ({ ...prev, [tempId]: "" }));
  };

  const handleCustomNameChange = (tempId, name) => {
    setSelectedCategories((prev) =>
      prev.map((cat) =>
        cat.tempId === tempId ? { ...cat, categoryName: name } : cat,
      ),
    );
  };

  const handleCategoryRemove = (idOrTempId) => {
    setSelectedCategories((prev) =>
      prev.filter((cat) => (cat.categoryId || cat.tempId) !== idOrTempId),
    );
    setCategoryAllocations((prev) => {
      const updated = { ...prev };
      delete updated[idOrTempId];
      return updated;
    });
  };

  const handleAllocationChange = (idOrTempId, value) => {
    const numValue = value.replace(/[^0-9]/g, "");
    const newAmount = parseInt(numValue) || 0;

    const otherAllocations = Object.entries(categoryAllocations)
      .filter(([key]) => key !== String(idOrTempId))
      .reduce((sum, [, val]) => sum + (parseInt(val) || 0), 0);

    const total = parseInt(totalBudget) || 0;

    // Keeping your logic: Only update if it doesn't exceed total
    if (otherAllocations + newAmount <= total) {
      setCategoryAllocations((prev) => ({ ...prev, [idOrTempId]: numValue }));
    }
  };

  const calculateAllocatedAmount = () => {
    return Object.values(categoryAllocations).reduce(
      (sum, val) => sum + (parseInt(val) || 0),
      0,
    );
  };

  const remainingAmount =
    (parseInt(totalBudget) || 0) - calculateAllocatedAmount();

  useEffect(() => {
    if (isOpen && existingBudget && availableCategories) {
      setTotalBudget(existingBudget.totalAnnualBudget.toString());

      const preselected = existingBudget.categories
        .map((cat) => {
          const matched = availableCategories.find(
            (ac) => ac.categoryName === cat.categoryName,
          );
          return matched ? { ...matched, isNew: false } : null;
        })
        .filter(Boolean);

      setSelectedCategories(preselected);

      const allocations = {};
      existingBudget.categories.forEach((cat) => {
        const matched = availableCategories.find(
          (ac) => ac.categoryName === cat.categoryName,
        );
        if (matched) allocations[matched.categoryId] = cat.budgeted.toString();
      });
      setCategoryAllocations(allocations);
    }
  }, [isOpen, existingBudget, availableCategories]);

  const handleSave = () => {
    const budgetData = {
      totalBudget: parseInt(totalBudget),
      categories: selectedCategories.map((cat) => {
        const key = cat.categoryId || cat.tempId;
        return {
          // If it's an existing category, cat.categoryId has the value.
          // If it's brand new, this remains null.
          categoryId: cat.categoryId || null,

          // Always provide the name for new categories so the backend can create the Master record.
          categoryName: cat.categoryName,

          totalBudgeted: parseInt(categoryAllocations[key]) || 0,
        };
      }),
    };
    onSave(budgetData);
    handleClose();
  };
  const handleClose = () => {
    setTotalBudget("");
    setSelectedCategories([]);
    setCategoryAllocations({});
    setShowCategoryDropdown(false);
    onClose();
  };

  const isValid = () => {
    const total = parseInt(totalBudget) || 0;
    const allocated = calculateAllocatedAmount();

    // Check that every row has a name (especially important for 'isNew' rows)
    const allNamesFilled = selectedCategories.every(
      (cat) => cat.categoryName && cat.categoryName.trim().length > 0,
    );

    return (
      total > 0 &&
      selectedCategories.length > 0 &&
      allocated === total &&
      allNamesFilled // Prevents sending null names to the backend
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white text-gray-900 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all">
        {/* Header with Gradient */}
        <div className="relative px-6 py-4 bg-[#122B5B]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white mb-0.5">
                Configure Annual Budget
              </h2>
              <p className="text-blue-100 text-xs">
                Configure your club's budget allocation
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-lg p-1.5"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"></div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1 bg-gradient-to-b from-gray-50/50 to-white">
          {/* Total Budget Input */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-[#122B5B]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Total Annual Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#122B5B] font-bold">
                $
              </span>
              <input
                type="text"
                value={
                  totalBudget ? parseInt(totalBudget).toLocaleString() : ""
                }
                onChange={handleTotalBudgetChange}
                className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 font-semibold text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Budget Summary Progress */}
          {totalBudget && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
              <div className="flex justify-between text-xs font-bold mb-2 text-gray-800">
                <span>
                  Allocated: ${calculateAllocatedAmount().toLocaleString()}
                </span>
                <span
                  className={
                    remainingAmount < 0 ? "text-red-600" : "text-blue-700"
                  }
                >
                  Remaining: ${remainingAmount.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.min((calculateAllocatedAmount() / (parseInt(totalBudget) || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Category Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              disabled={remainingAmount <= 0}
              className="flex-1 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-800 flex items-center justify-center gap-2 hover:border-blue-300 disabled:opacity-50"
            >
              Select Existing Category
            </button>
            <button
              onClick={handleAddCustomCategory}
              disabled={remainingAmount <= 0}
              className="px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-xl text-sm font-bold hover:bg-blue-100"
            >
              + New Category
            </button>
          </div>

          {/* Dropdown */}
          {showCategoryDropdown && (
            <div className="mb-4 bg-white border-2 border-blue-100 rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {availableCategories
                .filter(
                  (ac) =>
                    !selectedCategories.some(
                      (sc) => sc.categoryId === ac.categoryId,
                    ),
                )
                .map((cat) => (
                  <button
                    key={cat.categoryId}
                    onClick={() => handleCategorySelect(cat)}
                    className="w-full p-2 text-left hover:bg-blue-50 text-sm text-gray-800 border-b last:border-0"
                  >
                    {cat.categoryName}
                  </button>
                ))}
            </div>
          )}

          {/* Category List */}
          <div className="space-y-3">
            {selectedCategories.map((cat) => {
              const key = cat.categoryId || cat.tempId;
              return (
                <div
                  key={key}
                  className="p-3 bg-white border-2 border-gray-100 rounded-xl shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    {cat.isNew ? (
                      <input
                        type="text"
                        placeholder="Category Name"
                        value={cat.categoryName}
                        onChange={(e) =>
                          handleCustomNameChange(cat.tempId, e.target.value)
                        }
                        className="text-sm font-bold border-b-2 border-blue-400 outline-none w-1/2 text-gray-900 placeholder-gray-400"
                      />
                    ) : (
                      <span className="text-sm font-bold text-gray-800">
                        {cat.categoryName}
                      </span>
                    )}
                    <button
                      onClick={() => handleCategoryRemove(key)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                      $
                    </span>
                    <input
                      type="text"
                      value={
                        categoryAllocations[key]
                          ? parseInt(categoryAllocations[key]).toLocaleString()
                          : ""
                      }
                      onChange={(e) =>
                        handleAllocationChange(key, e.target.value)
                      }
                      placeholder="Amount"
                      className="w-full pl-7 py-1.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid()}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              isValid()
                ? "bg-[#122B5B] text-white shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Save Budget
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetConfigureModal;
