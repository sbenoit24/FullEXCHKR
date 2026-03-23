"use client";

import Modal from "@/components/Modal/Modal";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDisconnectModal({
  isOpen,
  onClose,
  onConfirm
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[420px] bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-[#1F2937] font-semibold text-[18px]">
              Disconnect bank?
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <p className="text-[#6B7280] text-[14px]">
          This will disconnect <strong>all accounts</strong> from this
          bank and stop syncing balances and transactions. You can
          reconnect at any time.
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      </div>
    </Modal>
  );
}
