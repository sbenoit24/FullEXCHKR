"use client";

import { useState, useEffect } from "react";
import React from "react";
import { DollarSign, RefreshCcw } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { officerService } from "@/services/officer/officer.service";
import Link from "next/link";

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const fetchRecentActivity = async () => {
    setStatus("loading");
    try {
      const apiData = await officerService.getRecentActivity();
      setActivities(apiData || []);
      setStatus("success");
    } catch (err) {
      console.error("Failed to fetch recent activity:", err);
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNowStrict(new Date(dateString), {
        addSuffix: true,
      });
    } catch (e) {
      return "Recently";
    }
  };

  const SkeletonItem = () => (
    <div className="flex items-start justify-between animate-pulse">
      <div className="flex flex-col gap-2 w-full">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        <div className="h-3 bg-gray-50 rounded w-1/6"></div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-5 bg-gray-100 rounded-full w-20"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 mt-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center border-2 border-[#122B5B]">
              <DollarSign className="w-5 h-5 text-[#122B5B]" strokeWidth={2} />
            </div>
            <h2 className="text-[17px] font-normal text-[#122B5B]">
              Recent Activity
            </h2>
          </div>
          <p className="text-[14px] text-[#122B5B70]">
            Latest transactions and updates
          </p>
        </div>

        {status === "success" && activities.length > 0 && (
          <Link
            href="/club-officer/finance"
            className="text-[14px] font-semibold text-[#122B5B] hover:text-[#1e293b] transition-colors"
          >
            View All
          </Link>
        )}
      </div>

      {/* Activity List */}
      <div className="space-y-6">
        {status === "loading" && (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-sm text-red-600 mb-3 text-center">
              We couldn't load the data. Please try again.
            </p>
            <button
              onClick={fetchRecentActivity}
              className="flex items-center gap-2 text-xs font-semibold text-[#122B5B] uppercase tracking-wider hover:opacity-70 transition-opacity"
            >
              <RefreshCcw className="w-3 h-3" />
              Try Again
            </button>
          </div>
        )}

        {status === "success" && activities.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-50 rounded-xl">
            <div className="bg-gray-50 p-3 rounded-full mb-3">
              <DollarSign className="w-6 h-6 text-[#122B5B30]" />
            </div>
            <p className="text-[15px] font-medium text-[#122B5B]">
              No recent transactions
            </p>
            <p className="text-[13px] text-[#122B5B70]">
              Activities will appear here once they occur.
            </p>
          </div>
        )}

        {status === "success" &&
          activities.length > 0 &&
          activities.map((activity) => {
            const isExpense = activity.type === "Expense";
            const isFailed = activity?.status?.toLowerCase() === "failed";

            return (
              <div
                key={activity.transId}
                className="flex items-start justify-between"
              >
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-[15px] font-semibold text-[#122B5B]">
                    {activity.doneByUserName}
                  </h3>
                  <p className="text-[14px] text-[#122B5B70]">
                    {activity.category}
                    <span className="mx-1">•</span>
                    {activity.description}
                  </p>
                  <p className="text-[12px] text-[#122B5B70]">
                    {formatDate(activity.transDate)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-[15px] font-bold ${
                      isFailed || isExpense
                        ? "text-[#E7000B]"
                        : "text-[#00A63E]"
                    }`}
                  >
                    {!isFailed && (isExpense ? "-" : "+")}$
                    {Number(activity.amount).toFixed(2)}
                  </span>

                  <span
                    className={`px-3 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wider ${
                      isFailed
                        ? "border-[#E7000B20] text-[#E7000B]"
                        : "border-[#122B5B20] text-[#122B5B]"
                    } bg-white`}
                  >
                    {activity?.status}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
