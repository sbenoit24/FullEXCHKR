"use client";

import { useRef, useState } from "react";
import Modal from "@/components/Modal/Modal.js";
import { X, CreditCard, DollarSign, Heart } from "lucide-react";
import { memberService } from "@/services/member/member.service";

import CardPaymentForm from "@/components/Stripe/CardPaymentForm";
import AchPaymentForm from "@/components/Stripe/AchPaymentForm";

import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import PaymentFeeBreakdown from "@/components/Stripe/PaymentFeeBreakdown";

export default function MemberDonationModal({ memberData, isOpen, onClose }) {
  const modalRef = useRef(null);

  const [selectedAmount, setSelectedAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState("card");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  const stripePromise = getStripe();

  const resetForm = () => {
    setSelectedAmount("");
    setCustomAmount("");
    setSelectedMethodId("");
    setShowPaymentForm(false);
    setClientSecret(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedAmountValue = customAmount || selectedAmount;

  const amountInDollars = selectedAmountValue
    ? parseFloat(selectedAmountValue)
    : 0;

  const [finalAmount, setFinalAmount] = useState({
    finalAmountInUsd: 0,
    finalAmountInCents: 0,
    finalPlatformFeeInUsd: 0,
    finalStripeFeeInUsd: 0,
  });

  const handleContinue = async () => {
    const amount = customAmount || selectedAmount;
    const amountInCents = finalAmount?.finalAmountInCents;

    // Basic required checks
    if (!amount || !selectedMethodId) {
      modalRef.current?.addAlert("Please enter a valid amount");
      return;
    }

    // Strict validation for custom amount (no leading zeros like 01, 001)
    if (customAmount) {
      const amountStr = customAmount.toString().trim();

      const isValidFormat = /^(?!0\d)\d+(\.\d{1,2})?$/.test(amountStr);

      if (!isValidFormat || Number(amountStr) <= 0) {
        modalRef.current?.addAlert("Please enter a valid amount");
        return;
      }
    }

    // Validate cents value (final safety check)
    if (!amountInCents || Number(amountInCents) <= 0) {
      modalRef.current?.addAlert("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        userId: memberData?.userId,
        clubId: memberData?.clubId,
        amount: finalAmount?.finalAmountInCents, // Convert to cents
        description: "Club donation",
        paymentMethodType:
          selectedMethodId === "bank" ? "us_bank_account" : "card",
      };

      const response = await memberService.memberPaymentToClub(payload);

      if (response.message === "Stripe not configured for this club") {
        modalRef.current?.addAlert("Stripe not configured for this club");
        return;
      }

      setClientSecret(response.clientSecret);
      setShowPaymentForm(true);
    } catch (error) {
      console.log("Payment initiation failed:", error);
      modalRef.current?.addAlert("Stripe not configured for this club");
    } finally {
      setIsLoading(false);
    }
  };

  const donationAmounts = [
    { value: "10", label: "$10" },
    { value: "25", label: "$25" },
    { value: "50", label: "$50" },
    { value: "100", label: "$100" },
  ];

  const paymentMethods = [
    {
      id: "card",
      title: "Credit / Debit Card",
      subtitle: "Secure payment via Stripe",
      icon: <CreditCard size={20} className="text-[#6B7280]" />,
      component: (
        <CardPaymentForm
          memberData={{
            name: memberData?.name,
            email: memberData?.email,
          }}
          paymentDetails={{
            amount: amountInDollars,
            description: "Member donation",
            category: "Donation",
            type: "Income",
            platformFee: finalAmount?.finalPlatformFeeInUsd,
            stripeFee: finalAmount?.finalStripeFeeInUsd,
          }}
          paymentType="donation"
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
            amount: amountInDollars,
            description: "Member donation",
            category: "Donation",
            type: "Income",
            platformFee: finalAmount?.finalPlatformFeeInUsd,
            stripeFee: finalAmount?.finalStripeFeeInUsd,
          }}
          clientSecret={clientSecret}
          paymentType="donation"
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
      <div
        className="relative w-full max-w-[500px] max-h-[90vh] bg-white rounded-3xl shadow-xl overflow-y-auto 
        [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-6 flex flex-col gap-5"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full transition z-10 hover:bg-gray-100 text-gray-400"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[#1F2937] font-semibold text-[20px]">
              Make a Donation
            </h2>
            <p className="text-[#9CA3AF] text-[14px] mt-1">
              Support our club activities and events
            </p>
          </div>
        </div>

        {!showPaymentForm ? (
          <>
            {/* Select Amount */}
            <div>
              <label className="text-[#1F2937] text-[15px] font-semibold block mb-3">
                Select Amount
              </label>
              <div className="grid grid-cols-2 gap-3">
                {donationAmounts.map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => {
                      setSelectedAmount(amount.value);
                      setCustomAmount("");
                    }}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                      selectedAmount === amount.value
                        ? "border-[#3B82F6] bg-[#EFF6FF]"
                        : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                    }`}
                  >
                    <span className="text-[#D4AF37] text-[20px] mb-1">$</span>
                    <span className="text-[#1E3A5F] font-bold text-[24px]">
                      {amount.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="text-[#1F2937] text-[14px] font-medium block mb-2">
                Or Enter Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[16px]">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={customAmount}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "" || Number(value) >= 0) {
                      setCustomAmount(value);
                      setSelectedAmount("");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "+") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.target.blur()} // 👈 stops scroll increment/decrement
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 border-2 border-[#E5E7EB] rounded-xl focus:border-[#3B82F6] focus:outline-none text-[#6B7280]"
                />
              </div>
            </div>

            {/* Your Impact */}
            <div className="bg-[#EFF6FF] border border-[#dbeafe] rounded-xl p-4 flex gap-3">
              <Heart size={20} className="text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <div className="text-[#1E3A5F] font-semibold text-[14px] mb-1">
                  Your Impact
                </div>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">
                  Donations help fund student film projects, guest speakers,
                  equipment upgrades, and community events.
                </p>
              </div>
            </div>

            <PaymentFeeBreakdown
              actualAmountInUsd={amountInDollars}
              paymentMethodType={selectedMethodId}
              setFinalAmount={setFinalAmount}
            />

            {/* Payment Method */}
            <div>
              <label className="text-[#1F2937] text-[15px] font-semibold block mb-3">
                Payment Method
              </label>
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`w-full p-4 rounded-xl border-2 flex justify-between items-center cursor-pointer mb-2 transition-all ${
                    selectedMethodId === method.id
                      ? "border-[#3B82F6] bg-[#EFF6FF]"
                      : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {method.icon}
                    <div>
                      <div className="font-medium text-[#1F2937] text-[14px]">
                        {method.title}
                      </div>
                      <div className="text-[13px] text-[#9CA3AF]">
                        {method.subtitle}
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={selectedMethodId === method.id}
                    onChange={() => setSelectedMethodId(method.id)}
                    className="w-4 h-4"
                  />
                </label>
              ))}
            </div>

            <button
              onClick={handleContinue}
              disabled={
                (!selectedAmount && !customAmount) ||
                !selectedMethodId ||
                isLoading
              }
              className="w-full bg-[#1E3A5F] text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#152b45] transition-colors"
            >
              {isLoading ? "Processing..." : "Continue"}
            </button>

            {/* Footer Info */}
            <div className="flex items-center justify-center gap-3 text-[12px] text-[#9CA3AF]">
              <div className="flex items-center gap-1">
                <span>🛡️</span>
                <span>Tax-deductible</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span>🔒</span>
                <span>Secure & encrypted</span>
              </div>
            </div>
          </>
        ) : (
          clientSecret && (
            <>
              {/* Amount Display */}
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280] text-[14px]">Amount</span>
                  <span className="text-[#1F2937] font-bold text-[28px]">
                    ${finalAmount?.finalAmountInUsd}
                  </span>
                </div>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                {selectedMethod?.component}
              </Elements>
            </>
          )
        )}
      </div>
    </Modal>
  );
}
