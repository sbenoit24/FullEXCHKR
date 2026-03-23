"use client";

import { createContext, useContext } from "react";

const PaymentContext = createContext({});

export const usePaymentContext = () => useContext(PaymentContext);

export const PaymentProvider = ({ children, onPaymentSuccess }) => {
  return (
    <PaymentContext.Provider value={{ onPaymentSuccess }}>
      {children}
    </PaymentContext.Provider>
  );
};
