"use client";

import { useState, useEffect } from "react";
import { Mail, FileText } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import CreateInvoiceOverlay from "../../../../../components/Modal/CreateInvoiceOverlay";
import { useAlert } from "@/hooks/useAlert";
import { officerService } from "@/services/officer/officer.service";

export default function DashboardHeader() {
  const user = useAuthStore((state) => state.user);
  const showAlert = useAlert();
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [activeMembers, setActiveMembers] = useState(null);

  const getActiveMembers = async () => {
    try {
      const response = await officerService.fetchMembers();
      console.log("memberss", response);
      setActiveMembers(response);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to get active members";
      showAlert(message, "error");
      console.log("active members get error", error);
    }
  };

  const createInvoice = async (invoiceData) => {
    try {
      await officerService.createInvoiceAndDue(invoiceData);
      setShowCreateInvoice(false);
      showAlert("Invoice sent successfully", "success");
    } catch (error) {
      console.log("send invoices error", error);
      setShowCreateInvoice(false);
      showAlert("Failed to create invoice", "error");
    }
  };

  useEffect(() => {
    getActiveMembers();
  }, []);

  return (
    <>
      <div className="p-8 md:py-9 px-6 rounded-3xl bg-[#0D214A]">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
          {/* Left section */}
          <div className="flex flex-col gap-2 md:justify-center">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-normal text-white">
                Welcome back, {user?.firstName || "User"}! 👋
              </h2>
            </div>
          </div>

          {/* Right section: Buttons */}
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => setShowCreateInvoice(true)}
              className="flex items-center justify-center gap-2 bg-white text-[#122B5B] font-normal text-[13px] leading-5 rounded-[14px] w-[139px] h-9 hover:opacity-80 cursor-pointer"
            >
              <FileText size={16} />
              Create Invoice
            </button>

            {/* <button
              className="flex items-center justify-center gap-2 border text-white font-normal text-[14px] leading-5 rounded-[14px] w-[139px] h-9 hover:opacity-80 cursor-pointer"
              style={{ backgroundColor: "#FFFFFF4D", borderColor: "#FFFFFF4D" }}
            >
              <Mail size={16} />
              Collect Payment
            </button> */}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0 mt-3">
          <p className="text-base md:text-lg font-normal text-[#DBEAFE]">
            {`${user?.clubName || "User"}  • ${user?.roles[0]}`}
          </p>
        </div>
      </div>

      {/* Modal */}
      {showCreateInvoice && (
        <CreateInvoiceOverlay
          onClose={() => setShowCreateInvoice(false)}
          members={activeMembers || []}
          onSend={(invoiceData) => createInvoice(invoiceData)}
        />
      )}
    </>
  );
}
