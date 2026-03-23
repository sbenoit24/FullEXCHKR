import React, { useEffect } from "react";

const PaymentFeeBreakdown = ({
  actualAmountInUsd = 0,
  paymentMethodType,
  setFinalAmount,
}) => {
  const netAmount = Number(actualAmountInUsd);

  // Platform fee logic (unchanged)
  const platformFeePercentage =
    Number(process.env.PLATFORM_FEE_PERCENTAGE || 1) / 100;

  // Card fees logic (unchanged)
  const cardFeePercentage =
    Number(process.env.STRIPE_FEE_CARD_PERCENTAGE || 2.9) / 100;
  const cardFeeFixed = Number(process.env.STRIPE_FEE_CARD_FIXED || 30) / 100;

  // ACH fees logic (unchanged)
  const achFeePercentage =
    Number(process.env.STRIPE_FEE_ACH_PERCENTAGE || 0.8) / 100;
  const achFeeMax = Number(process.env.STRIPE_FEE_ACH_MAX || 500) / 100;

  let stripeFeePercentage, stripeFeeFixed, stripeFeeMax;

  if (paymentMethodType === "card") {
    stripeFeePercentage = cardFeePercentage;
    stripeFeeFixed = cardFeeFixed;
    stripeFeeMax = null;
  } else if (paymentMethodType === "bank") {
    stripeFeePercentage = achFeePercentage;
    stripeFeeFixed = 0;
    stripeFeeMax = achFeeMax;
  } else {
    stripeFeePercentage = cardFeePercentage;
    stripeFeeFixed = cardFeeFixed;
    stripeFeeMax = null;
  }

  const totalPercentage = stripeFeePercentage + platformFeePercentage;
  const totalToCharge = (netAmount + stripeFeeFixed) / (1 - totalPercentage);

  let stripeFee = totalToCharge * stripeFeePercentage + stripeFeeFixed;
  if (stripeFeeMax !== null && stripeFee > stripeFeeMax) {
    stripeFee = stripeFeeMax;
  }

  const platformFee = totalToCharge * platformFeePercentage;

  // Sum for the combined UI line
  const combinedFee = stripeFee + platformFee;

  useEffect(() => {
    if (!setFinalAmount) return;
    const finalAmountInUsd = Number(totalToCharge.toFixed(2));
    const finalAmountInCents = Math.round(finalAmountInUsd * 100);
    const finalPlatformFeeInUsd = Number(platformFee.toFixed(2));
    const finalStripeFeeInUsd = Number(stripeFee.toFixed(2));

    setFinalAmount({
      finalAmountInUsd,
      finalAmountInCents,
      finalPlatformFeeInUsd,
      finalStripeFeeInUsd,
    });
  }, [totalToCharge, stripeFee, platformFee, setFinalAmount]);

  const formatCurrency = (val) =>
    val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="mt-5 w-full bg-white border border-[#122B5B20] rounded-2xl p-5">
      <div className="flex flex-col gap-3">
        {/* Original Amount */}
        <div className="flex justify-between items-center">
          <span className="text-[#9CA3AF] text-[14px]">Payment amount</span>
          <span className="text-[#1E3A5F] font-medium text-[14px]">
            ${formatCurrency(netAmount)}
          </span>
        </div>

        {/* Combined Fee Line */}
        <div className="flex justify-between items-center">
          <span className="text-[#9CA3AF] text-[14px]">
            Platform & Processing fees
          </span>
          <span className="text-[#1E3A5F] font-medium text-[14px]">
            + ${formatCurrency(combinedFee)}
          </span>
        </div>

        <div className="h-px bg-[#E5E7EB] w-full my-1 opacity-50" />

        {/* Grand Total */}
        <div className="flex justify-between items-center">
          <span className="text-[#1E3A5F] font-bold text-[15px]">
            Total to pay
          </span>
          <span className="text-[#1E3A5F] font-bold text-[16px]">
            ${formatCurrency(totalToCharge)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentFeeBreakdown;
