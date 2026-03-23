"use client";

import { useState, useEffect } from "react";
import { CreditCard, Link, LoaderIcon, AlertCircle } from "lucide-react";
import { useOfficersDashboardStore } from "@/stores/officer/officerDashboardStore";
import { officerService } from "@/services/officer/officer.service";

export default function BankConnectCard() {
  const isLinked = useOfficersDashboardStore((state) => state.isLinked);
  const needsRepair = useOfficersDashboardStore((state) => state.needsRepair);
  const setIsLinked = useOfficersDashboardStore((state) => state.setIsLinked);
  const isBankLinking = useOfficersDashboardStore((s) => s.isBankLinking);
  const setIsBankLinking = useOfficersDashboardStore((s) => s.setIsBankLinking);

  // api call to generate and get link token to link bank using plaid
  const handleConnectBank = async () => {
    try {
      setIsBankLinking(true);
      await officerService.generateLinkToken();
    } catch (error) {
      setIsBankLinking(false);
      console.error("Error generating link token:", error);
    }
  };

  if (isLinked && needsRepair === false) return null;

  return (
    <div className="border-2 border-[#0D214A] bg-[#f8fcff] rounded-2xl p-6 flex items-start gap-4 mt-6">
      {/* Icon */}
      <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
        {needsRepair ? (
          <AlertCircle className="w-6 h-6 text-white" strokeWidth={2} />
        ) : (
          <CreditCard className="w-6 h-6 text-white" strokeWidth={2} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {needsRepair ? "Action Required" : "Connect Your Bank Account"}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {needsRepair
            ? "Your bank connection needs attention.Please reconnect your account to continue syncing transactions and keep records up to date."
            : "Securely link your organization's bank account to automatically synctransactions and maintain accurate records."}
        </p>

        {/* Button */}
        <button
          disabled={isBankLinking}
          onClick={(e) => {
            e.stopPropagation();
            if (!isBankLinking) handleConnectBank?.();
          }}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          {isBankLinking ? (
            <>
              <LoaderIcon size={14} className="animate-spin" />
              Connecting…
            </>
          ) : needsRepair === true ? (
            <>
              <AlertCircle className="w-4 h-4" strokeWidth={2} />
              Bank re-login required
            </>
          ) : (
            <>
              <Link className="w-4 h-4" strokeWidth={2} />
              Connect with Plaid
            </>
          )}
        </button>
      </div>
    </div>
  );
}
