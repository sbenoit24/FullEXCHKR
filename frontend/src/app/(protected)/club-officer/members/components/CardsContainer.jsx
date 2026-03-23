"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Cards/Card";
import { useMembersDashboardStore } from "@/stores/officer/membersDashboardStore";
import { officerService } from "@/services/officer/officer.service";

export default function CardsContainer() {
  const { membersData, setLoading, setError } =
    useMembersDashboardStore();
  const [cardData, setCardData] = useState({
    duesCollected: 0,
    paidInFull: 0,
    needReminder: 0,
  });

  // const calculateCardData = (duesList = []) => {
  //   const summary = {
  //     duesCollected: 0,
  //     paidInFull: 0,
  //     needReminder: 0,
  //   };

  //   for (let i = 0; i < duesList.length; i++) {
  //     const due = duesList[i];

  //     // Sum total collected
  //     summary.duesCollected += Number(due.amountPaid || 0);

  //     // Count paid in full
  //     if (due.amountOwed === 0) {
  //       summary.paidInFull += 1;
  //     }

  //     // Count reminders needed
  //     if (due.amountOwed > 0 && due.status === "Unpaid") {
  //       summary.needReminder += 1;
  //     }
  //   }

  //   console.log("Calculated Card Data:", summary);
  //   setCardData(summary);
  // };

  const fetchDuesSummary = async () => {
    try {
      setLoading(true);
      const data = await officerService.getDuesSummary();
      const duesSummary = data?.data || [];
      console.log("due summry", duesSummary);
      setCardData(duesSummary);
      setError(null);
    } catch (error) {
      console.log("dues summary failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuesSummary();
  }, []);

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
      <Card
        bgColor="#e8eaee"
        title="Total Members"
        value={membersData?.length > 0 ? membersData?.length : 0}
        subtitle="Active members"
        icon="UsersRound"
        bgIcon="#122B5B"
        width="full"
      />

      <Card
        bgColor="#EAF9EF"
        title="Dues Collected"
        value={cardData?.duesCollected > 0 ? `$${cardData?.duesCollected}` : `$${0}`}
        subtitle={`${cardData?.collectionRate}% collection rate`}
        icon="DollarSign"
        bgIcon="#00C950"
        width="full"
      />

      <Card
        bgColor="#f8f5ef"
        title="Paid in Full"
        value={cardData?.paidInFull > 0 ? cardData?.paidInFull : 0}
        subtitle="members"
        icon="Check"
        bgIcon="#C39A4E"
        width="full"
      />

      <Card
        bgColor="#FCEBEB"
        title="Need Reminder"
        value={cardData?.needReminder > 0 ? cardData?.needReminder : 0}
        subtitle="unpaid or partial"
        icon="AlertCircle"
        bgIcon="#FB2C36"
        width="full"
      />
    </div>
  );
}
