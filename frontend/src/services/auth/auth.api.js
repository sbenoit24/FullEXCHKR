// src/services/auth/auth.api.js
import axiosClient from "../axiosClient";

export const authApi = {
  login: async (email, password) => {
    return axiosClient.post("/auth/login", { email, password });
  },

  selectClub: async (userId, clubId) => {
    return axiosClient.post(
      `/auth/select-club?userId=${userId}&clubId=${clubId}`,
    );
  },

  logout: async () => {
    return axiosClient.post("/auth/logout", {}, { withCredentials: true });
  },

  createClub: async (payload) => {
    return axiosClient.post("/api/admin/onboarding/club", payload);
  },

  updatePassword: async (payload) => {
    return axiosClient.post("/api/password/reset", payload, {
      withCredentials: true,
    });
  },

  getPlatformUniversities: async () => {
    return axiosClient.get("/api/donation/get-universities", {
      withCredentials: true,
    });
  },

  getPlatformClubs: async (universityName) => {
    return axiosClient.get("/api/donation/get-clubs", {
      params: { universityName },
      withCredentials: true,
    });
  },

  donationPaymentToClub: async (payload) => {
    return axiosClient.post("/api/donation/donation-payment-intent", payload, {
      withCredentials: true,
    });
  },

  saveTransactionForClubDonation: async (payload) => {
    return axiosClient.post("/api/donation/save-donation", payload, {
      withCredentials: true,
    });
  },
};
