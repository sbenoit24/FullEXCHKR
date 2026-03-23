"use client";

import { useRef, useState } from "react";
import Modal from "@/components/Modal/Modal.js";
import { X, Loader2 } from "lucide-react";
import { officerService } from "@/services/officer/officer.service";
import { useAlert } from "@/hooks/useAlert";
import { usePaymentContext } from "@/context/payment-context";

export default function ReimbursementRejectModal({
  isOpen,
  onClose,
  reimbursementId,
}) {
  const showAlert = useAlert();
  const modalRef = useRef(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const { onPaymentSuccess } = usePaymentContext();

  const resetForm = () => {
    setReason("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleReject = async () => {
    if (loading) return; // extra protection
    if (!reason.trim()) {
      modalRef.current?.addAlert("Please provide a reason for rejection");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        reimbursementId: reimbursementId,
        rejectReason: reason,
      };

      await officerService.reimbursementRequestReject(payload);
      showAlert("Reimbursement request rejected", "success");
      onPaymentSuccess?.();
      handleClose();
    } catch (e) {
      showAlert("Failed to reject request", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal ref={modalRef} isOpen={isOpen} onClose={handleClose}>
      <div className="w-lg bg-white rounded-2xl border border-[#E5E7EB] shadow p-[25px] flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h2 className="text-[#122B5B] font-bold text-[18px]">
              Reject Reimbursement
            </h2>
            <p className="text-[#122B5B70] text-[14px] mt-2.5">
              Please provide a reason for rejecting this request. This will be
              shared with the member.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-800 -mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={21} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[#122B5B] text-[14px] block mb-1">
              Reason for Rejection <span className="text-[#122B5B]">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 rounded-[14px] bg-[#122B5B08] text-[#122B5B] border border-transparent focus:border-[#122B5B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              placeholder="e.g., Missing receipt or incorrect amount..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex pt-2">
          <button
            onClick={handleReject}
            disabled={loading}
            className="bg-[#122B5B] text-white px-4 py-2 rounded-[14px] w-full text-[14px] font-medium cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Rejecting..." : "Reject Request"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
