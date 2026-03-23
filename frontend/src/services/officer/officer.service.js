import { officerApi } from "./officer.api";
import { useOfficersDashboardStore } from "../../stores/officer/officerDashboardStore";

export const officerService = {
  addMember: async (payload) => {
    try {
      await officerApi.addMember(payload);
    } catch (err) {
      throw err;
    }
  },

  fetchMembers: async () => {
    try {
      const response = await officerApi.fetchMembers();
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  memberCount: async () => {
    try {
      const response = await officerApi.memberCount();
      return response.data;
    } catch (err) {
      console.error("Member count failed:", err);
      throw err;
    }
  },

  bankConnectionStatus: async () => {
    try {
      const response = await officerApi.bankConnectionStatus();
      return response.data;
    } catch (err) {
      return { isLinked: null };
    }
  },

  generateLinkToken: async () => {
    const setLinkToken = useOfficersDashboardStore.getState().setLinkToken;

    try {
      const response = await officerApi.generateLinkToken();
      setLinkToken(response.data.link_token);
      return response;
    } catch (err) {
      console.error("link generation failed:", err);
      throw err;
    }
  },

  exchangePublicToken: async (payload) => {
    try {
      console.log("exchange payload passing", payload);
      await officerApi.exchangePublicToken(payload);
    } catch (err) {
      console.error("exchanging public token failed:", err);
      throw err;
    }
  },

  getBankBalance: async () => {
    try {
      const response = await officerApi.getBankBalance();
      return response.data;
    } catch (err) {
      console.error("bank balance getting failed:", err);
      throw err;
    }
  },

  changeDefaultAccount: async (payload) => {
    try {
      console.log("change account payload passing", payload);
      await officerApi.changeDefaultAccount(payload);
    } catch (err) {
      console.error("change account failed:", err);
      throw err;
    }
  },

  disconnectBank: async () => {
    try {
      await officerApi.disconnectBank();
    } catch (err) {
      console.error("disconnect bank failed:", err);
      throw err;
    }
  },

  reactivateBank: async () => {
    try {
      await officerApi.reactivateBank();
    } catch (err) {
      console.error("reactivate bank failed:", err);
      throw err;
    }
  },

  stripeOnboarding: async (payload) => {
    try {
      const response = await officerApi.stripeOnboarding(payload);
      return response;
    } catch (err) {
      console.error("Stripe onboarding failed:", err);
      throw err;
    }
  },

  getClubBalance: async () => {
    try {
      const response = await officerApi.getClubBalance();
      return response?.data;
    } catch (err) {
      console.error("Stripe balance check failed:", err);
      throw err;
    }
  },
  clubPaymentToMember: async (payload) => {
    try {
      const response = await officerApi.clubPaymentToMember(payload);
      return response?.data;
    } catch (err) {
      console.error("Stripe clubPaymentToMember failed:", err);
      throw err;
    }
  },
  reimbursementRequestList: async () => {
    try {
      const response = await officerApi.reimbursementRequestList();
      return response?.data;
    } catch (err) {
      throw err;
    }
  },
  reimbursementRequestReject: async (payload) => {
    try {
      await officerApi.reimbursementRequestReject(payload);
    } catch (e) {
      const status = e?.response?.status;

      const message =
        status === 409
          ? "Request cannot be rejected."
          : status === 403
            ? "Not authorized."
            : status === 404
              ? "Request not found."
              : status
                ? "Something went wrong."
                : "Network error.";

      throw new Error(message);
    }
  },

  reimbursementRequestApprove: async (payload) => {
    try {
      await officerApi.reimbursementRequestApprove(payload);
    } catch (e) {
      const status = e?.response?.status;

      const message =
        status === 409
          ? "Request cannot be approved."
          : status === 403
            ? "Not authorized."
            : status === 404
              ? "Request not found."
              : status
                ? "Something went wrong."
                : "Network error.";

      throw new Error(message);
    }
  },
  reimbursementReceiptDownload: async (payload) => {
    try {
      return await officerApi.reimbursementReceiptDownload(payload);
    } catch (err) {
      throw err;
    }
  },

  saveTransaction: async (payload) => {
    try {
      const response = await officerApi.saveTransaction(payload);
      return response;
    } catch (err) {
      throw err;
    }
  },

  getTransactionHistory: async (payload) => {
    try {
      const response = await officerApi.getTransactionHistory(payload);
      return response;
    } catch (err) {
      console.error("transaction history check failed:", err);
      throw err;
    }
  },

  downloadTransactionHistoryPdf: async (payload) => {
    try {
      const response = await officerApi.downloadTransactionHistoryPdf(payload);
      return response;
    } catch (err) {
      console.error("download transaction history pdf failed:", err);
      throw err;
    }
  },

  addTransaction: async (payload) => {
    try {
      const response = await officerApi.addTransaction(payload);
      return response?.data;
    } catch (err) {
      console.error("transaction addition failed:", err);
      throw err;
    }
  },

  createInvoiceAndDue: async (payload) => {
    try {
      const response = await officerApi.createInvoiceAndDue(payload);
      return response?.data;
    } catch (err) {
      console.error("invoice creation failed:", err);
      throw err;
    }
  },

  getDuesList: async (payload) => {
    try {
      const response = await officerApi.getDuesList(payload);
      return response?.data;
    } catch (err) {
      console.error("get dues failed:", err);
      throw err;
    }
  },

  getDuesSummary: async () => {
    try {
      const response = await officerApi.getDuesSummary();
      return response;
    } catch (err) {
      console.error("get dues summary failed:", err);
      throw err;
    }
  },

  getFinanceSummary: async () => {
    try {
      const response = await officerApi.getFinanceSummary();
      return response?.data;
    } catch (err) {
      console.error("get finance summary failed:", err);
      throw err;
    }
  },

  sentDueReminder: async (payload) => {
    try {
      const response = await officerApi.sentDueReminder(payload);
      return response?.data;
    } catch (err) {
      console.error("sent due reminder failed:", err);
      throw err;
    }
  },

  sentDueReminders: async (payload) => {
    try {
      const response = await officerApi.sentDueReminders(payload);
      return response?.data;
    } catch (err) {
      console.error("sent due reminders failed:", err);
      throw err;
    }
  },

  getPendingActions: async () => {
    try {
      const response = await officerApi.getPendingActions();
      return response?.data;
    } catch (err) {
      console.error("get pending actions failed:", err);
      throw err;
    }
  },

  getClubStripeInfo: async () => {
    try {
      const response = await officerApi.getClubStripeInfo();
      return response?.data;
    } catch (err) {
      console.error("get club stripe info failed:", err);
      throw err;
    }
  },
  getRecentActivity: async () => {
    try {
      const response = await officerApi.getRecentActivity();
      return response?.data;
    } catch (err) {
      console.error("get recent activity failed:", err);
      throw err;
    }
  },
  addMembersCSV: async (payload) => {
    try {
      const response = await officerApi.addMembersCSV(payload);
      return response;
    } catch (err) {
      console.error("Adding members through CSV failed:", err);
      throw err;
    }
  },

  getSpendingCategory: async () => {
    try {
      const response = await officerApi.getSpendingCategory();
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  getMonthlySpending: async () => {
    try {
      const response = await officerApi.getMonthlySpending();
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  addBudget: async (payload) => {
    try {
      const response = await officerApi.addBudget(payload);
      return response?.data;
    } catch (err) {
      console.error("add budget failed:", err);
      throw err;
    }
  },

  updateBudget: async (payload) => {
    try {
      const response = await officerApi.updateBudget(payload);
      return response?.data;
    } catch (err) {
      console.error("update budget failed:", err);
      throw err;
    }
  },

  getClubBudgetSummary: async () => {
    try {
      const response = await officerApi.getClubBudgetSummary();
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  downloadDuesListPdf: async (payload) => {
    try {
      const response = await officerApi.downloadDuesListPdf(payload);
      return response;
    } catch (err) {
      console.error("download dues pdf failed:", err);
      throw err;
    }
  },

  createBudgetCategories: async (payload) => {
    try {
      await officerApi.budgetCategories.create(payload);
    } catch (err) {
      console.error("create budget categories failed:", err);
      throw err;
    }
  },

  getBudgetCategories: async () => {
    try {
      const response = await officerApi.budgetCategories.getAll();
      return response?.data;
    } catch (err) {
      console.error("get budget categories failed:", err);
      throw err;
    }
  },
};
