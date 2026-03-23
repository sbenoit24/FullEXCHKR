"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Cards/Card";
import ConnectBank from "./ConnectBank";
import SelectBankAccountModal from "./modals/SelectBankAccountModal";
import ConfirmDisconnectModal from "./modals/ConfirmDisconnectModal";
import { officerService } from "@/services/officer/officer.service";
import { useOfficersDashboardStore } from "../../../../../stores/officer/officerDashboardStore";
import { useAlert } from "@/hooks/useAlert";
import { useAuthStore } from "../../../../../stores/authStore";

export default function CardsContainer() {
  const showAlert = useAlert();

  /* ----------------------------- State ----------------------------- */
  const userData = useAuthStore((state) => state.user);
  const [bankInfo, setBankInfo] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [activeMembers, setActiveMembers] = useState(null);

  /* ------------------------------ Store ----------------------------- */
  const userClubData = useOfficersDashboardStore((state) => state.userClubData);
  const setUserClubData = useOfficersDashboardStore(
    (state) => state.setUserClubData,
  );
  const isLinked = useOfficersDashboardStore((state) => state.isLinked);
  const setIsLinked = useOfficersDashboardStore((state) => state.setIsLinked);
  const needsRepair = useOfficersDashboardStore((state) => state.needsRepair);
  const bankStatus = useOfficersDashboardStore((state) => state.bankStatus);
  const setBankStatus = useOfficersDashboardStore(
    (state) => state.setBankStatus,
  );
  const isBankLinking = useOfficersDashboardStore((s) => s.isBankLinking);
  const setIsBankLinking = useOfficersDashboardStore((s) => s.setIsBankLinking);
  const refreshBankStatus = useOfficersDashboardStore(
    (state) => state.refreshBankStatus,
  );

  /* --------------------------- API Calls ---------------------------- */

  // api call to get count of active members
  const getMemberCount = async () => {
    try {
      const response = await officerService.memberCount();
      // console.log("member count", response);
      // console.log("type", typeof response);

      setActiveMembers(response);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 404) {
        setActiveMembers(null);
      }

      console.error("Error checking member count:", error);
      showAlert("Error checking member count at the moment", "error");
    }
  };

  // api call to get club balance
  const fetchClubBalance = async () => {
    try {
      const response = await officerService.getClubBalance();

      // console.log("Club balance response:", response);
      const responseMessage = response?.message;
      const clubBalance = response?.stripeBalance;
      const balanceDifference = response?.balanceDifference;
      // console.log("clubBalance got", clubBalance);

      if (responseMessage === "Club is not connected to Stripe") {
        setUserClubData((prevState) => ({
          ...prevState,
          clubBalance: null,
          balanceDifference: null,
        }));
      } else if (clubBalance != null) {
        setUserClubData((prevState) => ({
          ...prevState,
          clubBalance: clubBalance,
          balanceDifference: balanceDifference,
        }));
      }
    } catch (error) {
      console.error("Error checking club balance:", error);
    }
  };

  //api call to get bank account balance
  const fetchBankAccounts = async () => {
    try {
      const response = await officerService.getBankBalance();
      // console.log("bank balance res", response);
      return response;
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      return [];
    }
  };

  /* --------------------------- Initial Load -------------------------- */
  useEffect(() => {
    refreshBankStatus();
    getMemberCount();
    fetchClubBalance();
  }, []);

  /* -------------------- Fetch Accounts / Primary -------------------- */
  useEffect(() => {
    if (!isLinked || !bankStatus?.primaryAccountId) return;

    const loadAccounts = async () => {
      const accounts = await fetchBankAccounts();
      // console.log("loaded accounts", accounts);
      setBankAccounts(accounts);

      if (!accounts.length) return;

      let primary =
        accounts.find((acc) => acc.accountId === bankStatus.primaryAccountId) ||
        accounts[0];

      if (primary.accountId !== bankStatus.primaryAccountId) {
        try {
          await officerService.changeDefaultAccount({
            accountId: primary.accountId,
          });
        } catch (err) {
          console.error("Failed to update default account:", err);
        }
      }

      setBankInfo({
        ...primary,
        institutionName: bankStatus.institutionName,
      });
    };

    loadAccounts();
  }, [isLinked, bankStatus]);

  /* ------------------------- Plaid Actions --------------------------- */

  // api call to generate and get link token to link bank using plaid
  const handleConnectBank = async () => {
    try {
      setIsBankLinking(true);
      await officerService.generateLinkToken();
    } catch (error) {
      setIsBankLinking(false);
      console.error("Error generating link token:", error);
    }
  };

  // api call to disconnect bank
  const handleDisconnectBank = async () => {
    setShowConfirmDisconnect(false);
    try {
      await officerService.disconnectBank();
      setIsLinked(false);
      setBankStatus(null);
      setBankInfo(null);
      setBankAccounts([]);
      showAlert("Bank disconnected successfully", "success");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to disconnect bank";
      showAlert(message, "error");
    }
  };

  /* ---------------------------- Render ------------------------------- */
  return (
    <>
      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
        <Card
          bgColor="#E7EAEF"
          title="Club Balance"
          value={
            userClubData?.clubBalance != null
              ? `$${userClubData.clubBalance}`
              : "Not Connected"
          }
          subtitle={
            userClubData?.balanceDifference != null
              ? `${userClubData.balanceDifference}% from last month`
              : ""
          }
          icon="DollarSign"
          bgIcon="#122B5B"
          subIcon={
            userClubData.balanceDifference == null
              ? "Minus"
              : userClubData.balanceDifference > 0
                ? "TrendingUp"
                : "TrendingDown"
          }
          bgSubIcon={
            userClubData.balanceDifference == null
              ? "Minus"
              : userClubData.balanceDifference > 0
                ? "#00A63E"
                : "red"
          }
          width="full"
        />

        <ConnectBank
          bgColor={needsRepair ? "#FEF2F2" : "#F9F5ED"}
          title="Bank Balance"
          value={
            bankInfo?.balances?.available
              ? `$${bankInfo.balances.available.toLocaleString()}`
              : "--"
          }
          subtitle={needsRepair ? "Connection Expired" : bankInfo?.name}
          icon="Building"
          bgIcon={needsRepair ? "#EF4444" : "#C39A4E"}
          showButton={isLinked === false || needsRepair === true}
          needsRepair={needsRepair}
          loading={isBankLinking}
          onConnect={handleConnectBank}
          onCardClick={() => {
            if (isLinked && !needsRepair) {
              setShowConfirmDisconnect(true);
            } else [console.log("statteeee", isLinked, needsRepair)];
          }}
        />

        <Card
          bgColor="#F8FCFF"
          title="Active Members"
          value={activeMembers ? activeMembers?.totalCount : 0}
          subtitle={`${activeMembers?.joinedThisMonthCount ?? 0} this month`}
          icon="Users"
          bgIcon="#B8DFFF"
          subIcon={activeMembers > 0 ? "TrendingUp" : "Minus"}
          bgSubIcon="#00A63E"
        />
      </div>

      {/* Account Selection Modal */}
      {/* <SelectBankAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        bankAccounts={bankAccounts}
        selectedAccountId={bankInfo?.accountId}
        onSelectAccount={async (account) => {
          setBankInfo(account);
          await officerService.changeDefaultAccount({
            accountId: account.accountId,
          });
        }}
        onDisconnect={handleDisconnectBank}
      /> */}

      {/* Account deletion confirmation modal */}
      <ConfirmDisconnectModal
        isOpen={showConfirmDisconnect}
        onClose={() => setShowConfirmDisconnect(false)}
        onConfirm={handleDisconnectBank}
      />
    </>
  );
}
