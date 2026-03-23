"use client";

import { useRef, useState, useEffect } from "react";
import Modal from "@/components/Modal/Modal.js";
import { X, CreditCard, DollarSign, Send, User } from "lucide-react";
import { officerService } from "@/services/officer/officer.service";

import CardPaymentForm from "@/components/Stripe/CardPaymentForm";
import AchPaymentForm from "@/components/Stripe/AchPaymentForm";

import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";

import PaymentFeeBreakdown from "@/components/Stripe/PaymentFeeBreakdown";

export default function ClubPaymentModal({
  isOpen,
  onClose,
  memberData,
  officerData,
  reimbursementId,
  selectedAmountUsd,
}) {
  const modalRef = useRef(null);

  const [selectedMethodId, setSelectedMethodId] = useState("card");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  const stripePromise = getStripe();

  const [form, setForm] = useState({
    amount: selectedAmountUsd || "",
    description: "",
  });

  // keep amount in sync if prop changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      amount: selectedAmountUsd || "",
    }));
  }, [selectedAmountUsd]);

  const resetForm = () => {
    setSelectedMethodId("card");
    setShowPaymentForm(false);
    setClientSecret(null);
    setForm({
      amount: selectedAmountUsd || "",
      description: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const amountInDollars = Number(selectedAmountUsd || 0);

  const [finalAmount, setFinalAmount] = useState({
    finalAmountInUsd: 0,
    finalAmountInCents: 0,
    finalPlatformFeeInUsd: 0,
    finalStripeFeeInUsd: 0,
  });

  const handleContinue = async () => {
    if (isLoading) return; // extra protection
    if (
      !selectedMethodId ||
      !finalAmount?.finalAmountInCents ||
      !finalAmount?.finalAmountInUsd
    )
      return;

    try {
      setIsLoading(true);

      const payload = {
        userId: memberData?.userId,
        amount: finalAmount?.finalAmountInCents,
        description: "Club reimbursement payment",
        paymentMethodType:
          selectedMethodId === "bank" ? "us_bank_account" : "card",
      };

      const response = await officerService.clubPaymentToMember(payload);

      if (response.message === "Stripe not configured for this member") {
        modalRef.current?.addAlert("Stripe not configured for this member");
        return;
      }

      setClientSecret(response.clientSecret);
      setForm((prev) => ({
        ...prev,
        amount: finalAmount?.finalAmountInUsd,
      }));
      setShowPaymentForm(true);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      modalRef.current?.addAlert(
        error?.response?.data?.message || "Failed to initiate payment.",
      );
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
            userId: memberData?.userId,
          }}
          paymentDetails={{
            amount: amountInDollars,
            description: "Club reimbursement payment",
            category: "Reimbursement",
            type: "Expense",
            reimbursementId,
            officerName: officerData?.name,
            officerEmail: officerData?.email,
            platformFee: finalAmount?.finalPlatformFeeInUsd,
            stripeFee: finalAmount?.finalStripeFeeInUsd,
          }}
          paymentType="reimbursement"
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
            userId: memberData?.userId,
          }}
          paymentDetails={{
            amount: amountInDollars,
            description: "Club reimbursement payment",
            category: "Reimbursement",
            type: "Expense",
            reimbursementId,
            officerName: officerData?.name,
            officerEmail: officerData?.email,
            platformFee: finalAmount?.finalPlatformFeeInUsd,
            stripeFee: finalAmount?.finalStripeFeeInUsd,
          }}
          paymentType="reimbursement"
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
      <div className="w-[500px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5 scrollbar-hide">
        {/* CSS to hide scrollbar while allowing scrolling */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Send size={20} />
            <h2 className="text-[#1E3A5F] font-semibold text-[20px]">
              Send Payment
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 -mt-1 cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-[#6B7280] text-[14px] -mt-3">
          Send money to {memberData?.name || "member"}
        </p>

        {/* Member Card */}
        <div className="bg-[#F0F9FF] border border-[#BFDBFE] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white">
              <User size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-[#1E3A5F] font-semibold text-[15px]">
                {memberData?.name || "member"}
              </h3>
              <p className="text-[#6B7280] text-[13px]">{memberData?.email}</p>
            </div>
            <span className="bg-[#DBEAFE] text-[#1E40AF] px-3 py-1 rounded-full text-[12px] font-medium">
              Reimbursement
            </span>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-[#1E3A5F] text-[14px] font-medium block mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
              $
            </span>
            <input
              type="number"
              value={form.amount}
              disabled
              readOnly
              className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-gray-100 text-[#1E3A5F] border border-[#E5E7EB] cursor-not-allowed"
            />
          </div>
        </div>

        {!showPaymentForm ? (
          <>
            <PaymentFeeBreakdown
              actualAmountInUsd={amountInDollars}
              paymentMethodType={selectedMethodId}
              setFinalAmount={setFinalAmount}
            />

            <label className="text-[#1F2937] text-[15px] font-semibold">
              Select Payment Method
            </label>

            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`w-full p-4 rounded-xl border-2 flex justify-between cursor-pointer mb-2 transition-all ${
                  selectedMethodId === method.id
                    ? "border-[#3B82F6] bg-[#EFF6FF]"
                    : "border-[#E5E7EB]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {method.icon}
                  <div>
                    <div className="font-medium text-[#1E3A5F]">
                      {method.title}
                    </div>
                    <div className="text-sm text-gray-400">
                      {method.subtitle}
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={selectedMethodId === method.id}
                  onChange={() => setSelectedMethodId(method.id)}
                  className="cursor-pointer"
                />
              </label>
            ))}

            <button
              onClick={handleContinue}
              disabled={!selectedMethodId || isLoading}
              className="w-full bg-[#1E3A5F] text-white py-3 rounded-xl disabled:opacity-50 mt-2 mb-2"
            >
              {isLoading ? "Processing..." : "Continue"}
            </button>
          </>
        ) : (
          clientSecret && (
            <div className="pb-4">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                {selectedMethod?.component}
              </Elements>
            </div>
          )
        )}
      </div>
    </Modal>
  );
}
