import axiosClient from "../axiosClient";

export const memberApi = {
  memberPaymentToClub: async (payload) => {
    return axiosClient.post("/api/stripe/member-payment-intent", payload, {
      withCredentials: true,
    });
  },
  stripeOnboarding: async (payload) => {
    return axiosClient.post("/api/stripe/member-stripe-onboarding", payload, {
      withCredentials: true,
    });
  },
  memberReimbursementRequest: async (payload) => {
    return axiosClient.post("/api/member/finance/reimbursement-request", payload, {
      withCredentials: true,
    });
  },
  saveTransactionForDonation: async (payload) => {
    return axiosClient.post("/api/member/finance/save-donation", payload, {
      withCredentials: true,
    });
  },

  memberTransactions: async () => {
    return axiosClient.get("/api/member/finance/member-transactions", {
      withCredentials: true,
    });
  },

  getMemberDue: async (payload) => {
    return axiosClient.get("/api/member/finance/member-due", {
      withCredentials: true,
    });
  },

  getRecentMemberDue: async (payload) => {
    return axiosClient.get("/api/member/finance/recent-member-due", {
      withCredentials: true,
    });
  },

  payDue: async (payload) => {
    return axiosClient.post("/api/member/finance/pay-due", payload, {
      withCredentials: true,
    });
  },
  
  dueReceiptDownload: (payload) => {
    return axiosClient.post(
      "/api/member/finance/due-receipt-download",
      payload,
      {
        withCredentials: true,
        responseType: "blob", // For file download
      },
    );
  },

  getMemberStripeInfo: async () => {
    return axiosClient.get("/api/stripe/member-stripe-info", {
      withCredentials: true,
    });
  },

  getClubBudgetCategories: async () => {
    return axiosClient.get("/api/member/finance/club-budget-categories", {
      withCredentials: true,
    });
  },
};
