"use client";

import { useEffect, useState } from "react";
import { DollarSign, Heart, Receipt } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import MemberPaymentModal from "./modals/MemberPaymentModal";
import MemberOnboardingModal from "./modals/MemberOnboardingModal";
import ReimbursementSubmissionModal from "./modals/ReimbursementSubmissionModal";
import MemberDonationModal from "./modals/MemberDonationModal";
import { memberService } from "@/services/member/member.service";

function ActionCard({
  icon: Icon,
  title,
  subtitle,
  bgColor,
  iconColor = "#FFFFFF",
  onClick,
}) {
  const isHexColor = iconColor.startsWith("#");

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div
        className={`rounded-full w-14 h-14 flex items-center justify-center mb-4 ${bgColor}`}
      >
        <Icon
          className="w-7 h-7"
          style={isHexColor ? { color: iconColor } : undefined}
        />
      </div>

      <h3 className="text-base font-semibold mb-1" style={{ color: "#122B5B" }}>
        {title}
      </h3>

      <p className="text-sm" style={{ color: "#122B5B70" }}>
        {subtitle}
      </p>
    </div>
  );
}

const initialDue = {
  dueId: null,
  description: "No dues",
  totalAmount: 0,
};

export default function ActionsContainer({ paymentVersion }) {
  const memberData = useAuthStore((state) => state.user);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isReimbursementModalOpen, setIsReimbursementModalOpen] =
    useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [stripeStatus, setStripeStatus] = useState(null);

  const [memberDue, setMemberDue] = useState(initialDue);

  const getMemberDue = async () => {
    try {
      const response = await memberService.getMemberDue();
      if (response && typeof response === "object") {
        setMemberDue({
          dueId: response.dueId ?? initialDue.dueId,
          description: response.description ?? initialDue.description,
          totalAmount: response.totalAmount ?? initialDue.totalAmount,
        });
      } else {
        setMemberDue(initialDue);
      }
    } catch (err) {
      console.log("Error fetching member due, using fallback:", err);
      setMemberDue(initialDue);
    }
  };

  const handleMemberStripeInfo = async () => {
    try {
      const response = await memberService.getMemberStripeInfo();
      setStripeStatus(response?.stripeAccountStatus || "Not configured");
    } catch (err) {
      console.error("Fetching member stripe info failed:", err);
      setStripeStatus("Error");
    }
  };

  useEffect(() => {
    getMemberDue();
    handleMemberStripeInfo();
  }, []);

  useEffect(() => {
    getMemberDue();
  }, [paymentVersion]);

  const cards = [
    {
      icon: DollarSign,
      title: "Pay Dues",
      subtitle: `$${memberDue?.totalAmount} • ${memberDue?.description}`,
      bgColor: "bg-[#122B5B]",
      iconColor: "#FFFFFF",
      onClick:
        memberDue.totalAmount > 0
          ? () => setIsPaymentModalOpen(true)
          : undefined,
    },
    {
      icon: Heart,
      title: "Make a Donation",
      subtitle: "Support club activities",
      bgColor: "bg-[#C39A4E]",
      iconColor: "#FFFFFF",
      onClick: () => setIsDonationModalOpen(true),
    },
    {
      icon: Receipt,
      title: "Submit Receipt",
      subtitle: "Get reimbursed",
      bgColor: "bg-[#B8DFFF]",
      iconColor: "#122B5B",
      onClick: () => {
        if (stripeStatus === "Enabled" || stripeStatus === "Error") {
          setIsReimbursementModalOpen(true); // Open Reimbursement Modal
        } else {
          setIsOnboardingModalOpen(true); // Open Onboarding Modal
        }
      },
    },
  ];

  return (
    <div className="w-full mt-8">
      <h2 className="text-lg font-semibold mb-4" style={{ color: "#122B5B" }}>
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <ActionCard key={index} {...card} />
        ))}
      </div>

      {isPaymentModalOpen && (
        <MemberPaymentModal
          memberData={memberData}
          memberDue={memberDue}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}

      {isOnboardingModalOpen && (
        <MemberOnboardingModal
          memberData={memberData}
          isOpen={isOnboardingModalOpen}
          onClose={() => setIsOnboardingModalOpen(false)}
          stripeAccountStatus={stripeStatus}
        />
      )}

      {isReimbursementModalOpen && (
        <ReimbursementSubmissionModal
          memberData={memberData}
          isOpen={isReimbursementModalOpen}
          onClose={() => setIsReimbursementModalOpen(false)}
        />
      )}

      {isDonationModalOpen && (
        <MemberDonationModal
          memberData={memberData}
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
        />
      )}
    </div>
  );
}
