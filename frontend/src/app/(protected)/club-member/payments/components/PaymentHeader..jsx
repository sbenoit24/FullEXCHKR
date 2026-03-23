"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { memberService } from "@/services/member/member.service";
import { formatToReadableDate } from "@/utils/date";

export default function PaymentHeader({ paymentVersion }) {
  const [recentMemberDue, setRecentMemberDue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecentMemberDue = async () => {
      try {
        const response = await memberService.getRecentMemberDue();
        setRecentMemberDue(Array.isArray(response) ? response : []);
      } catch (err) {
        console.log("Error fetching recent member due:", err);
        setRecentMemberDue([]);
      } finally {
        setLoading(false);
      }
    };

    getRecentMemberDue();
  }, [paymentVersion]);

  const currentDue = recentMemberDue[0] || {};
  const nextDue = recentMemberDue[1] || {};

  // Consistent Container Class
  const containerClassName =
    "bg-linear-to-br from-blue-900 to-blue-950 rounded-xl p-6 text-white shadow-md";

  if (loading) {
    return (
      <div className={`${containerClassName} animate-pulse`}>
        {/* Header Skeleton - Matches flex gap and margin */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-white/20 rounded-full" />
          <div className="h-7 w-48 bg-white/20 rounded" />{" "}
          {/* h-7 matches text-xl */}
        </div>

        {/* Current Period + Amount Skeleton */}
        <div className="grid grid-cols-3 items-start mb-2">
          <div className="col-span-1">
            <div className="h-7 w-24 bg-white/10 rounded mb-1" />{" "}
            {/* text-lg height */}
            <div className="h-7 w-32 bg-white/20 rounded" />{" "}
            {/* text-lg height */}
          </div>
          <div className="col-span-1 flex flex-col items-center">
            <div className="h-7 w-16 bg-white/10 rounded mb-1" />
            <div className="h-7 w-12 bg-white/20 rounded" />
          </div>
        </div>

        {/* Due Date Skeleton */}
        <div className="mb-4">
          <div className="h-7 w-20 bg-white/10 rounded mb-1" />
          <div className="h-7 w-36 bg-white/20 rounded" />
        </div>

        {/* Divider Skeleton */}
        <div className="border-t border-white/20 pt-4">
          <div className="h-4 w-56 bg-white/10 rounded" />{" "}
          {/* text-xs height */}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Membership Active</h2>
      </div>

      <div className="grid grid-cols-3 items-start mb-2">
        <div className="col-span-1">
          <p className="text-blue-200 text-lg mb-1">Current Due</p>
          <p className="text-lg font-bold">
            {currentDue.description || "No current due"}
          </p>
        </div>

        <div className="col-span-1 text-center">
          <p className="text-blue-200 text-lg mb-1">Amount</p>
          <p className="text-lg font-bold">
            {currentDue.totalAmount !== undefined
              ? `$${currentDue.totalAmount}`
              : "0"}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-blue-200 text-lg mb-1">Due Date</p>
        <p className="text-lg font-semibold">
          {formatToReadableDate(currentDue?.dueDate) || "No Due"}
        </p>
      </div>

      <div className="border-t border-white/20 pt-4">
        <p className="text-blue-100 text-xs">
          Next payment due:{" "}
          {formatToReadableDate(nextDue?.dueDate) || "No upcoming dues"}
        </p>
      </div>
    </div>
  );
}
