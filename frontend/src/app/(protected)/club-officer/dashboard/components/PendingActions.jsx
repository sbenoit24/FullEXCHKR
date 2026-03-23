"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCcw } from "lucide-react";
import { officerService } from "@/services/officer/officer.service";
import Link from "next/link";

const ACTION_CONFIG = {
  EXPENSE_APPROVAL: {
    text: (count) =>
      `${count} expense request${count > 1 ? "s" : ""} awaiting approval`,
    buttonText: "Review",
  },
  DUES_REMINDER: {
    text: (count) =>
      `${count} member${count > 1 ? "s" : ""} need dues reminder`,
    buttonText: "Send Reminder",
  },
};

const ActionSkeleton = () => (
  <div className="animate-pulse flex items-center justify-between rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
    <div className="flex items-center gap-4">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
      <div className="h-4 w-48 bg-gray-200 rounded" />
    </div>
    <div className="h-9 w-24 bg-gray-200 rounded-xl" />
  </div>
);

export default function PendingActions() {
  const [actions, setActions] = useState([]);
  // Status can be: 'idle', 'loading', 'success', or 'error'
  const [status, setStatus] = useState("idle");

  const fetchPendingActions = async () => {
    setStatus("loading");
    try {
      const apiData = await officerService.getPendingActions();

      if (!apiData || !Array.isArray(apiData)) {
        throw new Error("Invalid API response");
      }

      const mappedActions = apiData
        .filter(
          (item) => item.pendingCount > 0 && ACTION_CONFIG[item.actionType],
        )
        .map((item) => ({
          id: item.actionType,
          text: ACTION_CONFIG[item.actionType].text(item.pendingCount),
          buttonText: ACTION_CONFIG[item.actionType].buttonText,
        }));

      setActions(mappedActions);
      setStatus("success");
    } catch (err) {
      console.error("Failed to fetch pending actions:", err);
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchPendingActions();
  }, []);

  return (
    <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
      {/* Header Section */}
      <div className="mb-6 grid grid-cols-[20px_1fr] gap-x-2">
        <AlertCircle className="w-5 h-5 text-[#C39A4E] mt-0.5" />
        <h2 className="text-[17px] font-semibold text-[#122B5B]">
          Pending Actions
        </h2>
        <p className="col-span-2 text-[15px] text-[#122B5B70] font-light">
          Tasks that need your attention
        </p>
      </div>

      <div className="space-y-3">
        {/* LOADING STATE */}
        {status === "loading" && (
          <>
            <ActionSkeleton />
            <ActionSkeleton />
          </>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-sm text-red-600 mb-3 text-center">
              We couldn't load the data. Please try again.
            </p>
            <button
              onClick={fetchPendingActions}
              className="flex items-center gap-2 text-xs font-semibold text-[#122B5B] uppercase tracking-wider hover:opacity-70 transition-opacity"
            >
              <RefreshCcw className="w-3 h-3" /> Try Again
            </button>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" &&
          (actions.length > 0 ? (
            actions.map((action) => (
              <div
                key={action.id}
                className="
                  group rounded-2xl border border-[#E5E7EB] p-4
                  flex items-center justify-between bg-white
                  transition-all duration-200
                  hover:shadow-[0_6px_12px_-4px_rgba(0,0,0,0.12)]
                  hover:-translate-y-px
                "
              >
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C39A4E]" />
                  <span className="text-[15px] font-medium text-[#122B5B]">
                    {action.text}
                  </span>
                </div>

                <Link
                  href="/club-officer/finance"
                  className="px-6 py-2 rounded-xl border border-[#E5E7EB] text-sm text-[#122B5B] hover:bg-gray-50 transition-colors font-medium"
                >
                  {action.buttonText}
                </Link>
              </div>
            ))
          ) : (
            /* Empty State UI */
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                <CheckCircle2 className="w-6 h-6 text-[#00C950]" />
              </div>
              <p className="text-[15px] font-medium text-[#122B5B]">
                You're all caught up!
              </p>
              <p className="text-sm text-[#122B5B70]">
                No pending tasks require your attention right now.
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
