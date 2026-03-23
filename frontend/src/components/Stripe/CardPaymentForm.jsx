"use client";

import { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAlert } from "@/hooks/useAlert";
import { officerService } from "@/services/officer/officer.service";
import { memberService } from "@/services/member/member.service";
import { authService } from "@/services/auth/auth.service";
import { usePaymentContext } from "@/context/payment-context";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1F2937",
      "::placeholder": { color: "#9CA3AF" },
      fontFamily: "sans-serif",
    },
    invalid: { color: "#f44336" },
  },
};

export default function CardPaymentForm({
  memberData,
  paymentDetails,
  paymentType,
  clientSecret,
  onClose,
}) {
  const showAlert = useAlert();

  const stripe = useStripe();
  const elements = useElements();

  const { onPaymentSuccess } = usePaymentContext();

  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);

    try {
      const billingDetails =
        paymentType === "reimbursement"
          ? {
              name: paymentDetails?.officerName,
              email: paymentDetails?.officerEmail,
            }
          : {
              name: memberData?.name,
              email: memberData?.email,
            };

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: billingDetails,
        },
      });

      if (result.error) {
        if (paymentType === "reimbursement") {
          saveTransactionForReimbursement(result?.paymentIntent?.id, "Failed");
        } else if (paymentType === "donation") {
          saveTransactionForDonation(result?.paymentIntent?.id, "Failed");
        } else if (paymentType === "club-donation") {
          saveTransactionForClubDonation(result?.paymentIntent?.id, "Failed");
        } else if (paymentType === "dues") {
          saveTransactionForDues(result?.paymentIntent?.id, "Failed");
        }
        showAlert(
          `${result?.error?.code} : ${result?.error?.decline_code}`,
          "error",
        );
        onClose && onClose();
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        if (paymentType === "reimbursement") {
          await saveTransactionForReimbursement(
            result?.paymentIntent.id,
            "Processing",
          );

          await approveReimbursement(result?.paymentIntent.id);
        } else if (paymentType === "donation") {
          saveTransactionForDonation(result?.paymentIntent?.id, "Processing");
        } else if (paymentType === "club-donation") {
          saveTransactionForClubDonation(
            result?.paymentIntent?.id,
            "Processing",
          );
        } else if (paymentType === "dues") {
          saveTransactionForDues(result?.paymentIntent?.id, "Processing");
        }

        showAlert("Payment processed successfully!", "success");
        onClose && onClose();
      }
    } catch (err) {
      showAlert("Payment failed", "error");
      onClose && onClose();

      console.log("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveTransactionForReimbursement = async (paymentIntentId, status) => {
    try {
      await officerService.saveTransaction({
        amount: paymentDetails?.amount,
        description: paymentDetails?.description,
        category: paymentDetails?.category,
        stripePaymentIntentId: paymentIntentId,
        type: paymentDetails?.type,
        recipientId: memberData?.userId,
        paymentStatus: status,
        platformFee: paymentDetails?.platformFee,
        stripeFee: paymentDetails?.stripeFee,
      });
    } catch (err) {
      console.error("Failed to save transaction:", err);
    }
  };

  const approveReimbursement = async (paymentIntentId) => {
    try {
      await officerService.reimbursementRequestApprove({
        reimbursementId: paymentDetails?.reimbursementId,
        stripeRefId: paymentIntentId,
      });
      onPaymentSuccess?.();
    } catch (err) {
      console.error("Failed to approve reimbursement:", err);
    }
  };

  const saveTransactionForDonation = async (paymentIntentId, status) => {
    try {
      await memberService.saveTransactionForDonation({
        amount: paymentDetails?.amount,
        description: paymentDetails?.description,
        category: paymentDetails?.category,
        stripePaymentIntentId: paymentIntentId,
        paymentStatus: status,
        platformFee: paymentDetails?.platformFee,
        stripeFee: paymentDetails?.stripeFee,
      });
      onPaymentSuccess?.();
    } catch (err) {
      console.error("Failed to save transaction:", err);
    }
  };

  const saveTransactionForDues = async (paymentIntentId, status) => {
    try {
      await memberService.payDue({
        amount: paymentDetails?.amount,
        description: paymentDetails?.description,
        category: paymentDetails?.category,
        stripePaymentIntentId: paymentIntentId,
        type: paymentDetails?.type,
        dueId: paymentDetails?.dueId,
        paymentStatus: status,
      });

      onPaymentSuccess?.();
    } catch (err) {
      console.error("Failed to save transaction:", err);
    }
  };

  const saveTransactionForClubDonation = async (paymentIntentId, status) => {
    try {
      await authService.saveTransactionForClubDonation({
        clubId: paymentDetails?.clubId,
        amount: paymentDetails?.amount,
        donatorName: paymentDetails?.donatorName,
        donatorEmail: paymentDetails?.donatorEmail,
        stripePaymentIntentId: paymentIntentId,
        paymentStatus: status,
      });
      onPaymentSuccess?.();
    } catch (err) {
      console.error("Failed to save club donation:", err);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[#6B7280] text-sm">Card Number</label>
      <div className="p-2 border border-[#E5E7EB] rounded">
        <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[#6B7280] text-sm">Expiry</label>
          <div className="p-2 border border-[#E5E7EB] rounded">
            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-[#6B7280] text-sm">CVC</label>
          <div className="p-2 border border-[#E5E7EB] rounded">
            <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handlePayment}
          disabled={loading || !clientSecret}
          className="bg-[#1E3A5F] text-white px-6 py-3 rounded-xl flex-1 hover:bg-[#162D4A] disabled:opacity-50"
        >
          {loading ? "Processing..." : "Send Payment"}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="bg-white text-[#6B7280] px-6 py-3 rounded-xl border border-[#E5E7EB] flex-1 hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
