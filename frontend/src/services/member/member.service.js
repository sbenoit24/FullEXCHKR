import { memberApi } from "./member.api";

export const memberService = {
  memberPaymentToClub: async (payload) => {
    try {
      const response = await memberApi.memberPaymentToClub(payload);
      return response?.data;
    } catch (err) {
      console.error("Stripe memberPaymentToClub failed:", err);
      throw err;
    }
  },
  stripeOnboarding: async (payload) => {
    try {
      const response = await memberApi.stripeOnboarding(payload);
      return response;
    } catch (err) {
      throw err;
    }
  },

  memberReimbursementRequest: async (payload) => {
    try {
      const response = await memberApi.memberReimbursementRequest(payload);
      return response;
    } catch (err) {
      throw err;
    }
  },
  saveTransactionForDonation: async (payload) => {
    try {
      const response = await memberApi.saveTransactionForDonation(payload);
      return response;
    } catch (err) {
      throw err;
    }
  },

  memberTransactions: async () => {
    try {
      const response = await memberApi.memberTransactions();
      return response?.data;
    } catch (err) {
      throw err;
    }
  },

  getMemberDue: async () => {
    try {
      const response = await memberApi.getMemberDue();
      return response?.data;
    } catch (err) {
      throw err;
    }
  },

  getRecentMemberDue: async () => {
    try {
      const response = await memberApi.getRecentMemberDue();
      return response?.data;
    } catch (err) {
      throw err;
    }
  },

  payDue: async (payload) => {
    try {
      const response = await memberApi.payDue(payload);
      return response;
    } catch (err) {
      throw err;
    }
  },

   dueReceiptDownload: async (payload) => {
    try {
      return await memberApi.dueReceiptDownload(payload);
    } catch (err) {
      throw err;
    }
  },

  getMemberStripeInfo: async () => {
    try {
      const response = await memberApi.getMemberStripeInfo();
      return response?.data;
    } catch (err) {
       console.error("get member stripe info failed:", err);
      throw err;
    }
  },

  getClubBudgetCategories: async () => {
    try {
      const response = await memberApi.getClubBudgetCategories();
      return response?.data;
    } catch (err) {
      throw err;
    }
  },
};
