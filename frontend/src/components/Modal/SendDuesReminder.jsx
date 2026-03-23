"use client";

import React from "react";
import { X, Send, ChevronLeft, ChevronRight } from "lucide-react";

const SendDuesReminders = ({
  isOpen = true,
  onClose = () => {},
  onSend,
  recipients,
  currentPage = 0,
  onPageChange = () => {},
  totalPages = 1,
  totalElements = 0,
}) => {
  if (!isOpen) return null;

  const getAmountColor = (amount) => {
    if (amount <= 75) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  // Use totalElements if provided, otherwise use recipients length
  const displayTotal = totalElements > 0 ? totalElements : recipients.length;

  const hasRecipients = Array.isArray(recipients) && recipients.length > 0;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Send Dues Reminders
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Send email reminders to {displayTotal} members with unpaid or
              partial dues
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Recipients List */}
        <div className="p-6">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                Recipients ({displayTotal})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {hasRecipients ? (
                recipients.map((recipient, index) => (
                  <div
                    key={recipient?.dueId || recipient?.memberId || index}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-900 font-medium">
                      {recipient?.fullName}
                    </span>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${getAmountColor(
                        recipient?.amountOwed,
                      )}`}
                    >
                      ${(recipient?.amountOwed).toFixed(2)} owed
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No members with outstanding dues 🎉
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  Page {currentPage + 1} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className={`p-1 rounded transition-colors ${
                      currentPage === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className={`p-1 rounded transition-colors ${
                      currentPage === totalPages - 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Handle send reminders logic here
              if (!hasRecipients) return;
              console.log("Sending reminders to:", recipients);
              onSend(recipients);
            }}
            disabled={!hasRecipients}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${
              hasRecipients
                ? "text-white bg-blue-900 hover:bg-blue-800"
                : "text-gray-400 bg-gray-200 cursor-not-allowed"
            }`}
          >
            <Send size={16} />
            Send Reminders
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendDuesReminders;
