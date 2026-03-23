"use client";

import { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { officerService } from "@/services/officer/officer.service";
import { useOfficersDashboardStore } from "@/stores/officer/officerDashboardStore";

export default function PlaidLinkManager() {
  const linkToken = useOfficersDashboardStore((s) => s.linkToken);
  const setLinkToken = useOfficersDashboardStore((s) => s.setLinkToken);
  const setIsLinked = useOfficersDashboardStore((s) => s.setIsLinked);
  const setBankStatus = useOfficersDashboardStore((s) => s.setBankStatus);
  const setIsBankLinking = useOfficersDashboardStore((s) => s.setIsBankLinking);
   const refreshBankStatus = useOfficersDashboardStore(
    (state) => state.refreshBankStatus,
  );

  const { open, ready } = usePlaidLink(
    linkToken
      ? {
          token: linkToken,
          // Inside PlaidLinkManager.js onSuccess:
          onSuccess: async (public_token, metadata) => {
            try {
              if (public_token) {
                await officerService.exchangePublicToken({
                  public_token,
                  institution_id: metadata.institution?.institution_id,
                  institution_name: metadata.institution?.name,
                  account_ids: metadata.accounts?.map((acc) => acc.id) || [],
                });
              } else {
                await officerService.reactivateAccount();
              }

              await refreshBankStatus();
            } catch (err) {
              console.error("Plaid process failed:", err);
            } finally {
              setIsBankLinking(false);
              setLinkToken(null);
            }
          },
          onExit: () => {
            setIsBankLinking(false);
            setLinkToken(null);
          },
        }
      : {},
  );

  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  return null;
}
