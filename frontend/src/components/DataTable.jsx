"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Download, Inbox } from "lucide-react";

export function DataTable({
  title,
  subtitle,
  columns,
  data,
  searchPlaceholder = "Search...",
  filterLabel = "All Categories",
  selectedFilterOption,
  filterOptions,
  onFilter,
  showExport = true,
  showFilter = true,
  showSearch = true,
  searchTerm,
  onSearch,
  page,
  size,
  setPage,
  setSize,
  loading,
  onExport,
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [exportDate, setExportDate] = useState({
    fromDate: "",
    toDate: "",
  });

  const dateStringToInstant = (dateStr) => {
    if (!dateStr) return undefined;
    return new Date(`${dateStr}T00:00:00Z`).toISOString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-m text-[#0D214A]">{title}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
          )}

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                {selectedFilterOption === "All"
                  ? filterLabel
                  : selectedFilterOption}
                <ChevronDown className="w-4 h-4" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <ul className="py-1">
                    {filterOptions?.map((option) => (
                      <li
                        key={option}
                        onClick={() => {
                          onFilter(option);
                          setIsFilterOpen(false);
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                          selectedFilterOption === option
                            ? "bg-gray-100 font-medium text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Export Button */}
          {showExport && (
            <div className="relative">
              <button
                onClick={() => setIsExportOpen((prev) => !prev)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4 space-y-3">
                  {/* From Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-600">From Date</label>
                    <input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={exportDate.fromDate}
                      onChange={(e) =>
                        setExportDate((prev) => ({
                          ...prev,
                          fromDate: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm
             text-gray-900 bg-white
             focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* To Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-600">To Date</label>
                    <input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={exportDate.toDate}
                      onChange={(e) =>
                        setExportDate((prev) => ({
                          ...prev,
                          toDate: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm
             text-gray-900 bg-white
             focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => {
                      if (!exportDate.fromDate || !exportDate.toDate) return;

                      const payload = {
                        fromDate: dateStringToInstant(exportDate.fromDate),
                        toDate: dateStringToInstant(exportDate.toDate),
                      };

                      onExport(payload);
                      setExportDate({
                        fromDate: "",
                        toDate: "",
                      });
                      setIsExportOpen(false);
                    }}
                    className="w-full mt-2 px-4 py-2 bg-[#0D214A] text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-[#122B5B70]">Loading ...</div>
      ) : !data || data.length === 0 ? (
        <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-24 text-gray-500">
          <Inbox className="w-12 h-12 mb-4 text-gray-400" />
          <p className="text-lg font-medium">No {title}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-800"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="py-2.5 px-2.5 text-gray-900"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {/* <span className="text-sm text-[#122B5B70]">Rows per page:</span>
              <select
                value={size}
                onChange={(e) => {
                  setPage(0);
                  setSize(Number(e.target.value));
                }}
                className="border border-[#122B5B20] rounded-md h-9 px-3 text-sm text-[#122B5B] bg-white hover:border-[#122B5B40] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#122B5B20]"
              >
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={24}>24</option>
              </select> */}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-[#122B5B] font-medium">
                Page {page + 1}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0 || loading}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  className="flex items-center gap-1 px-4 h-9 border border-[#122B5B20] rounded-md text-sm text-[#122B5B] font-medium bg-white hover:bg-[#122B5B08] hover:border-[#122B5B40] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-[#122B5B20] transition-all"
                >
                  <span>←</span>
                  <span>Previous</span>
                </button>

                <button
                  disabled={loading || data.length < size}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 px-4 h-9 border border-[#122B5B20] rounded-md text-sm text-[#122B5B] font-medium bg-white hover:bg-[#122B5B08] hover:border-[#122B5B40] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-[#122B5B20] transition-all"
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
