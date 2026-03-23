import axiosClient from "../axiosClient";

export const officerApi = {
  addMember: async (payload) => {
    return axiosClient.post("/api/officer/members", payload, {
      withCredentials: true,
    });
  },

  fetchMembers: async () => {
    return axiosClient.get("/api/officer/members", {
      withCredentials: true,
    });
  },

  memberCount: async () => {
    return axiosClient.get("/api/officer/members/count", {
      withCredentials: true,
    });
  },

  bankConnectionStatus: async () => {
    return axiosClient.get("/api/plaid/status", {
      withCredentials: true,
    });
  },

  generateLinkToken: async (payload) => {
    return axiosClient.post("/api/plaid/link-token", null, {
      withCredentials: true,
    });
  },

  exchangePublicToken: async (payload) => {
    return axiosClient.post("/api/plaid/exchange-token", payload, {
      withCredentials: true,
    });
  },

  getBankBalance: async () => {
    return axiosClient.get("/api/plaid/balance", {
      withCredentials: true,
    });
  },

  changeDefaultAccount: async (payload) => {
    return axiosClient.patch("/api/plaid/default-account", payload, {
      withCredentials: true,
    });
  },

  disconnectBank: async () => {
    return axiosClient.post("/api/plaid/unlink", {
      withCredentials: true,
    });
  },

  reactivateBank: async () => {
    return axiosClient.post("/api/plaid/reactivate", {
      withCredentials: true,
    });
  },

  stripeOnboarding: async (payload) => {
    return axiosClient.post("/api/stripe/account-onboarding", payload, {
      withCredentials: true,
    });
  },

  getClubBalance: async () => {
    return axiosClient.get("/api/stripe/stripe-balance", {
      withCredentials: true,
    });
  },
  clubPaymentToMember: async (payload) => {
    return axiosClient.post("/api/stripe/club-payment-intent", payload, {
      withCredentials: true,
    });
  },
  reimbursementRequestList: async () => {
    return axiosClient.get("/api/club/finance/reimbursement-request-list", {
      withCredentials: true,
    });
  },

  reimbursementRequestReject: async (payload) => {
    return axiosClient.post(
      "/api/club/finance/reimbursement-request-reject",
      payload,
      {
        withCredentials: true,
      },
    );
  },
  reimbursementRequestApprove: async (payload) => {
    return axiosClient.post(
      "/api/club/finance/reimbursement-request-approve",
      payload,
      {
        withCredentials: true,
      },
    );
  },
  reimbursementReceiptDownload: (payload) => {
    return axiosClient.post(
      "/api/club/finance/reimbursement-receipt-download",
      payload,
      {
        withCredentials: true,
        responseType: "blob", // For file download
      },
    );
  },
  saveTransaction: async (payload) => {
    return axiosClient.post("/api/club/finance/record-success", payload, {
      withCredentials: true,
    });
  },

  getTransactionHistory: async ({ page = 0, size = 10 }) => {
    return axiosClient.get("/api/club/finance/history", {
      params: {
        page,
        size,
      },
      withCredentials: true,
    });
  },

  downloadTransactionHistoryPdf: async (payload) => {
    return axiosClient.post("/api/club/finance/download-trans-pdf", payload, {
      withCredentials: true,
      responseType: "blob",
    });
  },
  addTransaction: async (payload) => {
    return axiosClient.post("/api/club/finance/record-success", payload, {
      withCredentials: true,
    });
  },

  createInvoiceAndDue: async (payload) => {
    return axiosClient.post("/api/club/finance/create-invoice", payload, {
      withCredentials: true,
    });
  },

  getDuesList: async ({ page = 0, size = 8 }) => {
    return axiosClient.get("/api/club/finance/member-dues", {
      params: {
        page,
        size,
      },
      withCredentials: true,
    });
  },

  getDuesSummary: async () => {
    return axiosClient.get("/api/club/finance/dues-summary", {
      withCredentials: true,
    });
  },

  getFinanceSummary: async () => {
    return axiosClient.get("/api/club/finance/finance-summary", {
      withCredentials: true,
    });
  },

  sentDueReminder: async (payload) => {
    return axiosClient.post("/api/club/finance/member-dues/remind", payload, {
      withCredentials: true,
    });
  },

  sentDueReminders: async (payload) => {
    return axiosClient.post(
      "/api/club/finance/member-dues/remind-bulk",
      payload,
      {
        withCredentials: true,
      },
    );
  },

  getPendingActions: async () => {
    return axiosClient.get("/api/club/finance/pending-actions", {
      withCredentials: true,
    });
  },

  getClubStripeInfo: async () => {
    return axiosClient.get("/api/stripe/club-stripe-info", {
      withCredentials: true,
    });
  },

  getRecentActivity: async () => {
    return axiosClient.get("/api/club/finance/recent-activity", {
      withCredentials: true,
    });
  },
  addMembersCSV: async (payload) => {
    return axiosClient.post("/api/officer/members/csv", payload, {
      withCredentials: true,
    });
  },

  getSpendingCategory: async () => {
    return axiosClient.get("/api/club/finance/spending-by-category", {
      withCredentials: true,
    });
  },

  getMonthlySpending: async () => {
    return axiosClient.get("/api/club/finance/monthly-spending", {
      withCredentials: true,
    });
  },

  addBudget: async (payload) => {
    return axiosClient.post("/api/club/finance/budget-setup", payload, {
      withCredentials: true,
    });
  },

  updateBudget: async (payload) => {
    return axiosClient.patch("/api/club/finance/budget", payload, {
      withCredentials: true,
    });
  },

  getClubBudgetSummary: async () => {
    return axiosClient.get("/api/club/finance/budget-summary", {
      withCredentials: true,
    });
  },

  downloadDuesListPdf: async (payload) => {
    return axiosClient.post("/api/club/finance/download-dues-pdf", payload, {
      withCredentials: true,
      responseType: "blob",
    });
  },

  budgetCategories: {
    create: async (payload) => {
      return axiosClient.post("/api/club/finance/budget-categories", payload, {
        withCredentials: true,
      });
    },

    getAll: async () => {
      return axiosClient.get("/api/club/finance/budget-categories", {
        withCredentials: true,
      });
    },
  },
};
