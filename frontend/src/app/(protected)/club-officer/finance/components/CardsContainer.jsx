"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Cards/Card";
import { useMembersDashboardStore } from "@/stores/officer/membersDashboardStore";
import { useOfficersDashboardStore } from "@/stores/officer/officerDashboardStore";
import { officerService } from "@/services/officer/officer.service";

export default function CardsContainer() {
  const { setLoading, setError } = useMembersDashboardStore();
  const userClubData = useOfficersDashboardStore((state) => state.userClubData);
  const setUserClubData = useOfficersDashboardStore(
    (state) => state.setUserClubData,
  );
  const [cardData, setCardData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    pendingReimbursements: 0,
  });

  // api call to get get finance summary
  const fetchFinanceSummary = async () => {
    try {
      setLoading(true);
      const data = await officerService.getFinanceSummary();
      const financeSummary = data || [];
      console.log("finance summry", financeSummary);
      setCardData(financeSummary);
      setError(null);
    } catch (error) {
      console.log("finance summary failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // api call to get club balance
  const fetchClubBalance = async () => {
    try {
      const response = await officerService.getClubBalance();

      // console.log("Club balance response:", response);
      const responseMessage = response?.data?.message;
      const clubBalance = response?.data?.stripeBalance;
      const balanceDifference = response?.balanceDifference;
      // console.log("clubBalance got", clubBalance);

      if (responseMessage === "Club is not connected to Stripe") {
        setUserClubData((prevState) => ({
          ...prevState,
          clubBalance: null,
          balanceDifference: null,
        }));
      } else if (clubBalance) {
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

  useEffect(() => {
    fetchFinanceSummary();
    fetchClubBalance();
  }, []);

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
      <Card
        bgColor="#e8eaee"
        title="Current Balance"
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
        icon="Wallet"
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

      <Card
        bgColor="#EAF9EF"
        title="Total Income"
        value={
          cardData?.totalIncome > 0 ? `$${cardData?.totalIncome}` : `$${0}`
        }
        subtitle="This semester"
        icon="TrendingUp"
        bgIcon="#00C950"
        width="full"
      />

      <Card
        bgColor="#f8f5ef"
        title="Total Expenses"
        value={
          cardData?.totalExpenses > 0 ? `$${cardData?.totalExpenses}` : `$${0}`
        }
        subtitle="This semester"
        icon="TrendingDown"
        bgIcon="#FB2C36"
        width="full"
      />

      <Card
        bgColor="#FCEBEB"
        title="Pending Expenses"
        value={
          cardData?.pendingReimbursements > 0
            ? `$${cardData?.pendingReimbursements}`
            : `$${0}`
        }
        subtitle="Awaiting approval"
        icon="Clock"
        bgIcon="#C39A4E"
        width="full"
      />
    </div>
  );
}
