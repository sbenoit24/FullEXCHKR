"use client";

import { useState } from "react";
import ActionsContainer from "./components/ActionsContainer";
import PaymentHeader from "./components/PaymentHeader.";
import TransactionsContainer from "./components/TransactionsContainer";
import { PaymentProvider } from "@/context/payment-context";

export default function PaymentsPage() {
  const [paymentVersion, setPaymentVersion] = useState(0);

  const handlePaymentSuccess = () => {
    setPaymentVersion((v) => v + 1);
  };

  return (
    <PaymentProvider onPaymentSuccess={handlePaymentSuccess}>
      <PaymentHeader paymentVersion={paymentVersion}/>
      <ActionsContainer paymentVersion={paymentVersion} />
      <TransactionsContainer paymentVersion={paymentVersion} />
    </PaymentProvider>
  );
}
