"use client";
import { useState } from "react";
import MembersList from "./MembersList";
import TrackingList from "./TrackingList";

export default function TableContainer() {
  const [activeTab, setActiveTab] = useState("members");

  return (
    <div className="mt-4">
      {/* Tabs */}
      <div className="flex bg-gray-200 rounded-[20px] px-1 py-1 h-10 mb-4">
        <button
          className={`w-1/2 text-[14px] font-normal text-[#122B5B] flex items-center justify-center ${
            activeTab === "members"
              ? "bg-white px-2 py-1 rounded-[20px]"
              : ""
          }`}
          onClick={() => setActiveTab("members")}
        >
          All Members
        </button>

        <button
          className={`w-1/2 text-[14px] font-normal text-[#122B5B] flex items-center justify-center ${
            activeTab === "tracking"
              ? "bg-white px-2 py-1 rounded-[20px]"
              : ""
          }`}
          onClick={() => setActiveTab("tracking")}
        >
          Dues Tracking
        </button>
      </div>

      {/* Content */}
      {activeTab === "members" ? <MembersList /> : <TrackingList />}
    </div>
  );
}
