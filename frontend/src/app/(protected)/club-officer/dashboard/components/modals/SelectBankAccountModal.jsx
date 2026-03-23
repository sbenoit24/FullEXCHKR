"use client";

import { useRef, useState } from "react";
import Modal from "@/components/Modal/Modal";
import { X, CheckCircle } from "lucide-react";
import ConfirmDisconnectModal from "./ConfirmDisconnectModal";

export default function SelectBankAccountModal({
  isOpen,
  onClose,
  bankAccounts = [],
  selectedAccountId,
  onSelectAccount,
  onDisconnect
}) {
  const modalRef = useRef(null);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);

  const handleSelect = (account) => {
    onSelectAccount(account);
    onClose();
  };

  const handleConfirmDisconnect = () => {
    setShowConfirmDisconnect(false);
    onClose();
    onDisconnect();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="w-[500px] bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-[#1F2937] font-semibold text-[20px]">
                Select Bank Account
              </h2>
              <p className="text-[#9CA3AF] text-[14px] mt-1">
                Choose the account you want to use as primary
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Accounts List */}
          <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto">
            {bankAccounts.map((account) => {
              const isSelected =
                account.accountId === selectedAccountId;

              return (
                <button
                  key={account.accountId}
                  onClick={() => handleSelect(account)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                    isSelected
                      ? "border-[#3B82F6] bg-[#EFF6FF]"
                      : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                  }`}
                >
                  <div>
                    <p className="text-[#1F2937] font-medium text-[15px]">
                      {account.name || "Bank Account"}
                    </p>
                    <p className="text-[#6B7280] text-[13px] mt-1">
                      **** **** **** {account.mask || "XXXX"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[#1F2937] font-semibold text-[14px]">
                      $
                      {account?.balances?.available?.toLocaleString() ??
                        "0"}
                    </span>

                    {isSelected && (
                      <CheckCircle
                        size={18}
                        className="text-[#3B82F6]"
                      />
                    )}
                  </div>
                </button>
              );
            })}

            {bankAccounts.length === 0 && (
              <p className="text-center text-[#9CA3AF] text-[14px] py-10">
                No bank accounts found
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowConfirmDisconnect(true)}
              disabled={bankAccounts.length === 0}
              className={`px-6 py-3 rounded-xl border text-[15px] font-medium transition-colors flex-1 ${
                bankAccounts.length === 0
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-red-600 border-red-200 hover:bg-red-50"
              }`}
            >
              Disconnect Bank
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-[#9CA3AF] text-[12px] -mt-2">
            Powered by{" "}
            <span className="text-[#6366F1] font-medium">Plaid</span> •
            Secure & Encrypted
          </p>
        </div>
      </Modal>

      <ConfirmDisconnectModal
        isOpen={showConfirmDisconnect}
        onClose={() => setShowConfirmDisconnect(false)}
        onConfirm={handleConfirmDisconnect}
      />
    </>
  );
}
