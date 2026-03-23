"use client";

import { Check, X, Receipt, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { officerService } from "@/services/officer/officer.service";
import { useAuthStore } from "@/stores/authStore";
import { useAlert } from "@/hooks/useAlert";
import ClubPaymentModal from "./modals/ClubPaymentModal";
import ReimbursementRejectModal from "./modals/ReimbursementRejectModal";
import { PaymentProvider } from "@/context/payment-context";

const LoadingSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((index) => (
      <div
        key={index}
        className="p-8 bg-white border border-gray-200 rounded-3xl shadow-sm animate-pulse"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Side Skeleton */}
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="flex gap-2">
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
            <div className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>

          {/* Right Side Skeleton */}
          <div className="flex flex-col items-end gap-4">
            <div className="h-6 bg-gray-200 rounded w-16" />
            <div className="flex gap-2">
              <div className="h-8 bg-green-100 rounded-full w-24" />
              <div className="h-8 bg-red-100 rounded-full w-16" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function PendingExpenses() {
  const showAlert = useAlert();
  const officerData = useAuthStore((state) => state.user);
  const [expenseList, setExpenseList] = useState([]);

  // Status can be: 'idle', 'loading', 'success', or 'error'
  const [status, setStatus] = useState("idle");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const openPaymentModal = () => setIsPaymentModalOpen(true);
  const closePaymentModal = () => setIsPaymentModalOpen(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const openRejectModal = () => setIsRejectModalOpen(true);
  const closeRejectModal = () => setIsRejectModalOpen(false);

  const [selectedReimburesementId, setSelectedReimburesementId] =
    useState(null);
  const [selectedAmountUsd, setSelectedAmountUsd] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedMemberName, setSelectedMemberName] = useState(null);
  const [selectedMemberEmail, setSelectedMemberEmail] = useState(null);

  const fetchExpenses = async () => {
    setStatus("loading");
    try {
      const response = await officerService.reimbursementRequestList();
      setExpenseList(response);
      setStatus("success");
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleApprove = (
    reimbursementId,
    amountUsd,
    submittedByMemberId,
    memberName,
    memberEmail,
  ) => {
    setSelectedReimburesementId(reimbursementId);
    setSelectedAmountUsd(amountUsd);
    setSelectedMemberId(submittedByMemberId);
    setSelectedMemberName(memberName);
    setSelectedMemberEmail(memberEmail);
    openPaymentModal();
  };

  const handleReject = async (reimbursementId) => {
    setSelectedReimburesementId(reimbursementId);
    openRejectModal();
  };

  const handleReceiptDownload = async (reimbursementId, receiptFileName) => {
    try {
      const payload = {
        userId: officerData?.userId,
        clubId: officerData?.clubId,
        reimbursementId,
      };

      const response =
        await officerService.reimbursementReceiptDownload(payload);

      // Use the passed receiptFileName (with extension) if provided
      let fileName = receiptFileName || "receipt";

      // Use content-type from headers for proper file type
      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([response.data], { type: contentType });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // force filename with extension
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showAlert("Failed to download receipt", "error");
    }
  };

  return (
    <PaymentProvider onPaymentSuccess={fetchExpenses}>
      <div className="w-full bg-white p-6">
        {/* 1. HEADER SECTION */}
        <div className="mb-6 space-y-2">
          <h1 className="text-base font-normal leading-4 text-[#122B5B]">
            Pending Expense Requests
          </h1>
          <p className="text-base font-normal leading-6 text-[#122B5B70]">
            Review and approve expense reimbursements
          </p>
        </div>

        {/* 2. LOADING STATE (Skeleton) */}
        {status === "loading" && <LoadingSkeleton />}

        {/* 3. ERROR STATE */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>

            <h3 className="text-base font-medium text-[#122B5B]">
              We couldn't load the data.
            </h3>

            <p className="text-sm text-[#122B5B70] mt-1 mb-4">
              Please try again.
            </p>

            <button
              onClick={fetchExpenses}
              className="flex items-center gap-2 text-xs font-semibold text-[#122B5B] uppercase tracking-wider hover:opacity-70 transition-opacity"
            >
              <RefreshCcw className="w-3 h-3" />
              Try Again
            </button>
          </div>
        )}

        {/* 4. EMPTY STATE */}
        {status === "success" && expenseList?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Receipt className="w-10 h-10 text-[#122B5B70] mb-4" />
            <h3 className="text-base font-normal text-[#122B5B] mb-1">
              No pending expense requests
            </h3>
            <p className="text-sm font-normal text-[#122B5B70]">
              All submitted expenses have been reviewed.
            </p>
          </div>
        )}

        {/* 5. SUCCESS STATE (List Display) */}
        {status === "success" && expenseList?.length > 0 && (
          <div className="space-y-6">
            {expenseList.map((expense) => (
              <div
                key={expense?.reimbursementId}
                className="p-8 bg-white border border-gray-200 rounded-3xl shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left Side: Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-normal leading-6 text-[#122B5B]">
                        {expense?.description}
                      </h3>
                      <button
                        onClick={() =>
                          handleReceiptDownload(
                            expense?.reimbursementId,
                            expense?.receiptFileName,
                          )
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 text-[#122B5B] text-xs font-normal"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Receipt attached
                      </button>
                    </div>

                    <div className="space-y-1 text-sm font-normal text-[#122B5B70]">
                      <p>Submitted by {expense?.memberName}</p>
                      <p>Category: {expense?.category}</p>
                      <p>Date: {expense?.purchaseDate}</p>
                    </div>
                  </div>

                  {/* Right Side: Amount and Actions */}
                  <div className="flex flex-col items-end gap-4">
                    <p className="text-2xl font-normal text-[#122B5B]">
                      ${expense.amountUsd}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleApprove(
                            expense?.reimbursementId,
                            expense?.amountUsd,
                            expense?.submittedByMemberId,
                            expense?.memberName,
                            expense?.memberEmail,
                          )
                        }
                        className="flex items-center gap-2 px-6 py-2 bg-[#00A63E] hover:bg-[#008f47] text-white text-sm font-bold rounded-full transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Approve & Pay
                      </button>
                      <button
                        onClick={() => handleReject(expense?.reimbursementId)}
                        className="flex items-center gap-1 px-4 py-2 text-[#E11D48] border border-gray-200 hover:bg-red-50 text-sm font-medium rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call the payment modal */}
      <ClubPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        memberData={{
          name: selectedMemberName,
          email: selectedMemberEmail,
          userId: selectedMemberId,
        }}
        officerData={{
          name: officerData?.firstName,
          email: officerData?.email,
        }}
        reimbursementId={selectedReimburesementId}
        selectedAmountUsd={selectedAmountUsd}
      />

      <ReimbursementRejectModal
        isOpen={isRejectModalOpen}
        onClose={closeRejectModal}
        reimbursementId={selectedReimburesementId}
      />
    </PaymentProvider>
  );
}
