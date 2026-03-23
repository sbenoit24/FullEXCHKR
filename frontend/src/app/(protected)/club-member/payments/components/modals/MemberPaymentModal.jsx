"use client";

import { useRef, useState } from "react";
import Modal from "@/components/Modal/Modal.js";
import { X, CreditCard, DollarSign } from "lucide-react";
import { memberService } from "@/services/member/member.service";

import CardPaymentForm from "@/components/Stripe/CardPaymentForm";
import AchPaymentForm from "@/components/Stripe/AchPaymentForm";

import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import PaymentFeeBreakdown from "@/components/Stripe/PaymentFeeBreakdown";

export default function MemberPaymentModal({
  memberData,
  memberDue,
  isOpen,
  onClose,
}) {
  const modalRef = useRef(null);

  const [selectedMethodId, setSelectedMethodId] = useState("card");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  const stripePromise = getStripe();

  const [finalAmount, setFinalAmount] = useState({
    finalAmountInUsd: 0,
    finalAmountInCents: 0,
  });

  const [displayedAmount, setDisplayedAmount] = useState(
    memberDue?.totalAmount,
  );

  const resetForm = () => {
    setSelectedMethodId("card");
    setShowPaymentForm(false);
    setClientSecret(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleContinue = async () => {
    if (!selectedMethodId) return;

    try {
      setIsLoading(true);

      const payload = {
        amount: finalAmount?.finalAmountInCents,
        description: "Member dues payment",
        paymentMethodType:
          selectedMethodId === "bank" ? "us_bank_account" : "card",
      };

      const response = await memberService.memberPaymentToClub(payload);

      // Check if Stripe is not configured
      if (response.message === "Stripe not configured for this club") {
        modalRef.current?.addAlert("Stripe not configured for this club");
        return; // stop here, don't render payment forms
      }

      setClientSecret(response.clientSecret);
      setDisplayedAmount(finalAmount?.finalAmountInUsd);
      setShowPaymentForm(true);
    } catch (error) {
      console.log("Payment initiation failed:", error);
      modalRef.current?.addAlert("Stripe not configured for this club");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: "card",
      title: "Credit / Debit Card",
      subtitle: "Online payment",
      icon: <CreditCard size={20} className="text-[#6B7280]" />,
      component: (
        <CardPaymentForm
          memberData={{
            name: memberData?.name,
            email: memberData?.email,
          }}
          paymentDetails={{
            amount: memberDue?.totalAmount,
            description: "Member dues payment",
            category: "Dues",
            type: "Income",
            dueId: memberDue?.dueId,
          }}
          paymentType="dues"
          clientSecret={clientSecret}
          onClose={handleClose}
        />
      ),
    },
    {
      id: "bank",
      title: "Bank Transfer",
      subtitle: "ACH / Direct debit",
      icon: <DollarSign size={20} className="text-[#6B7280]" />,
      component: (
        <AchPaymentForm
          memberData={{
            name: memberData?.name,
            email: memberData?.email,
          }}
          paymentDetails={{
            amount: memberDue?.totalAmount,
            description: "Member dues payment",
            category: "Dues",
            type: "Income",
            dueId: memberDue?.dueId,
          }}
          paymentType="dues"
          clientSecret={clientSecret}
          onClose={handleClose}
        />
      ),
    },
  ];

  const selectedMethod = paymentMethods.find(
    (method) => method.id === selectedMethodId,
  );

  return (
    <Modal ref={modalRef} isOpen={isOpen} onClose={handleClose}>
      <div className="w-[500px] bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[#1F2937] font-semibold text-[20px]">
              Pay Dues
            </h2>
            <p className="text-[#9CA3AF] text-[14px] mt-1">
              {memberDue?.description}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Amount */}
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4">
          <div className="flex justify-between mb-3">
            <span className="text-[#6B7280] text-[14px]">Amount Due</span>
            <span className="text-[#1F2937] font-bold text-[28px]">
              ${displayedAmount}
            </span>
          </div>
        </div>

        {!showPaymentForm ? (
          <>
            <PaymentFeeBreakdown
              actualAmountInUsd={memberDue?.totalAmount}
              paymentMethodType={selectedMethodId}
              setFinalAmount={setFinalAmount}
            />

            <label className="text-[#1F2937] text-[15px] font-semibold">
              Select Payment Method
            </label>

            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`w-full p-4 rounded-xl border-2 flex justify-between cursor-pointer mb-2 ${
                  selectedMethodId === method.id
                    ? "border-[#3B82F6] bg-[#EFF6FF]"
                    : "border-[#E5E7EB]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {method.icon}
                  <div>
                    <div className="font-medium">{method.title}</div>
                    <div className="text-sm text-gray-400">
                      {method.subtitle}
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={selectedMethodId === method.id}
                  onChange={() => setSelectedMethodId(method.id)}
                />
              </label>
            ))}

            <button
              onClick={handleContinue}
              disabled={!selectedMethodId || isLoading}
              className="w-full bg-[#1E3A5F] text-white py-3 rounded-xl disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Continue"}
            </button>
          </>
        ) : (
          clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              {selectedMethod?.component}
            </Elements>
          )
        )}
      </div>
    </Modal>
  );
}
