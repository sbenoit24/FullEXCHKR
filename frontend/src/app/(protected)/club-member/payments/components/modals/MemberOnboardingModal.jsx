"use client";

import { useRef, useState } from "react";
import Modal from "@/components/Modal/Modal.js";
import { X, Clock, AlertCircle, PlusCircle, Loader2 } from "lucide-react";
import { memberService } from "@/services/member/member.service";

export default function MemberOnboardingModal({
  memberData,
  isOpen,
  onClose,
  stripeAccountStatus,
}) {
  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Logic to determine internal status
  const isPending = stripeAccountStatus === "Pending";
  const isNotConfigured = stripeAccountStatus === "Not configured";
  const statusKey = isPending
    ? "PENDING"
    : isNotConfigured
      ? "NOT_CONFIGURED"
      : "RESTRICTED";

  // Configuration mapping for UI states
  const STATUS_CONFIG = {
    PENDING: {
      title: "Verification in Progress",
      icon: <Clock className="text-amber-500" size={24} />,
      message:
        "Your Stripe account is currently being verified. This usually takes a few minutes. Please check back later.",
      buttonText: "Verification Pending",
      containerClass: "bg-amber-50 border-amber-100",
      textClass: "text-amber-800",
    },
    NOT_CONFIGURED: {
      title: "Stripe Configuration",
      icon: <PlusCircle className="text-[#1E3A5F]" size={24} />,
      message:
        "You haven't set up a Stripe account yet. Connect now to start receiving reimbursements.",
      buttonText: "Connect Stripe",
      containerClass: "bg-[#F9FAFB] border-[#E5E7EB]",
      textClass: "text-[#374151]",
    },
    RESTRICTED: {
      title: "Stripe Configuration",
      icon: <AlertCircle className="text-red-500" size={24} />,
      message:
        "Your account is currently restricted. Please complete your Stripe setup to resume receiving payments.",
      buttonText: "Resolve Restrictions",
      containerClass: "bg-[#F9FAFB] border-[#E5E7EB]",
      textClass: "text-[#374151]",
    },
  };

  const currentConfig = STATUS_CONFIG[statusKey];
  const isDisabled = isLoading || isPending;

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  const handleConnectStripe = async () => {
    if (isDisabled) return;
    setIsLoading(true);

    try {
      const payload = { userId: memberData?.userId };
      const response = await memberService.stripeOnboarding(payload);
      const url = response?.url || response?.data?.onboardingUrl;

      if (url) {
        window.location.href = url;
        handleClose();
      } else {
        throw new Error("No URL returned");
      }
    } catch (err) {
      console.error("Stripe onboarding error:", err);
      modalRef.current?.addAlert(
        "Something went wrong, please try again later",
      );
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} ref={modalRef}>
      <div className="w-[420px] bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h2 className="text-[#1F2937] font-semibold text-[20px]">
            {currentConfig.title}
          </h2>

          <button
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close modal"
            className={`text-gray-400 hover:text-gray-600 transition-colors ${
              isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Message Section */}
        <div
          className={`border rounded-xl p-5 flex flex-col items-center text-center gap-3 ${currentConfig.containerClass}`}
        >
          {currentConfig.icon}
          <p
            className={`${currentConfig.textClass} text-[15px] leading-relaxed`}
          >
            {currentConfig.message}
          </p>
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnectStripe}
          disabled={isDisabled}
          className={`w-full py-3 rounded-xl text-white font-medium flex items-center justify-center transition-all
            ${
              isDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#1E3A5F] hover:bg-[#162D4A] active:scale-[0.98]"
            }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </span>
          ) : (
            currentConfig.buttonText
          )}
        </button>
      </div>
    </Modal>
  );
}
