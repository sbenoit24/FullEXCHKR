"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { officerService } from "@/services/officer/officer.service";
import { useAuthStore } from "@/stores/authStore";

export default function StripeContainer() {
  const officerData = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(false); // For button clicks
  const [isInitialLoading, setIsInitialLoading] = useState(true); // For initial status check
  const [stripeStatus, setStripeStatus] = useState(null);
  const [error, setError] = useState("");

  const handleClubStripeInfo = async () => {
    setIsInitialLoading(true);
    try {
      const response = await officerService.getClubStripeInfo();

      setStripeStatus(response?.stripeAccountStatus || "Not configured");
    } catch (err) {
      console.error("Fetching club stripe info failed:", err);
      setStripeStatus("Error");
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    handleClubStripeInfo();
  }, []);

  const handleConnectStripe = async () => {
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        userId: officerData?.userId,
        clubId: officerData?.clubId,
      };

      const response = await officerService.stripeOnboarding(payload);
      const url = response?.url || response?.data?.onboardingUrl;

      if (url) {
        window.location.href = url;
      } else {
        setError("Something went wrong, please try again later");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Stripe onboarding error:", err);
      setError("Something went wrong, please try again later");
      setIsLoading(false);
    }
  };

  // --- 1. Skeleton Loading State ---
  if (isInitialLoading) {
    return (
      <div className="w-full px-0 py-4">
        <div className="w-full border border-gray-200 rounded-xl p-5 bg-white animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
            <div className="grow space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-9 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. Main UI Logic ---
  return (
    <div className="w-full px-0 py-4">
      <div className="w-full border border-gray-300 rounded-xl p-5 bg-white shadow-sm">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                stripeStatus === "Enabled" ? "bg-green-100" : "bg-blue-900"
              } ${stripeStatus === "Error" ? "bg-red-100" : ""}`} // Added red bg for error icon container
            >
              {stripeStatus === "Enabled" ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <CreditCard
                  className={`w-5 h-5 ${stripeStatus === "Error" ? "text-red-600" : "text-white"}`}
                />
              )}
            </div>
          </div>

          <div className="grow">
            <h2 className="text-base font-semibold text-[#122B5B] mb-1">
              {stripeStatus === "Enabled"
                ? "Payment System Active"
                : "Enable Online Dues Payment"}
            </h2>

            <div className="mb-4">
              {stripeStatus === "Enabled" && (
                <p className="text-sm text-green-600">
                  Your Stripe account is activated and ready to receive
                  payments.
                </p>
              )}

              {stripeStatus === "Pending" && (
                <p className="text-sm text-amber-600">
                  Please wait for the stripe activation.
                </p>
              )}

              {stripeStatus === "Restricted" && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    Account Restricted: Further action required.
                  </p>
                </div>
              )}

              {/* --- NEW ERROR MESSAGE --- */}
              {stripeStatus === "Error" && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">
                    Something went wrong, please try again later.
                  </p>
                </div>
              )}

              {(stripeStatus === "Not configured" || !stripeStatus) && (
                <p className="text-sm text-gray-500">
                  Allow members to pay dues online using cards or ACH.
                </p>
              )}
            </div>

            {stripeStatus !== "Enabled" && (
              <button
                onClick={handleConnectStripe}
                // Updated: Disable if loading OR if there is a system error
                disabled={isLoading || stripeStatus === "Error"}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-[#122B5B] text-white`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    {stripeStatus === "Restricted"
                      ? "Complete Onboarding"
                      : "Connect Stripe"}
                  </>
                )}
              </button>
            )}

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
