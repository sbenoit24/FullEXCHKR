// src/services/auth/auth.service.js
import { authApi } from "./auth.api";
import { useAuthStore } from "../../stores/authStore";
import axiosClient from "../axiosClient";

export const authService = {
  login: async (email, password) => {
    try {
      const response = await authApi.login(email, password);

      return response.data;
    } catch (error) {
      const status = error.response?.status;

      if (status === 401) {
        throw new Error("INVALID_CREDENTIALS");
      }

      throw new Error("SERVER_ERROR");
    }
  },

  selectClub: async (userId, clubId) => {
    try {
      const response = await authApi.selectClub(userId, clubId);
      const { user } = response.data;

      if (!user || !user.roles) {
        throw new Error("GENERIC_ERROR");
      }

      const authStore = useAuthStore.getState();
      authStore.setUser(user);

      return user;
    } catch (error) {
      const status = error.response?.status;

      if (status === 403) {
        throw new Error("CLUB_ACCESS_RESTRICTED");
      }

      throw new Error("SERVER_ERROR");
    }
  },

  logout: async () => {
    try {
      // Call Express server to clear httpOnly cookies
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Remove global Authorization header
    delete axiosClient.defaults.headers.common["Authorization"];

    // Clear Zustand state
    useAuthStore.getState().clearUser();
  },

  createClub: async (payload) => {
    try {
      const response = await authApi.createClub(payload);
      return response;
    } catch (err) {
      console.error("Creating club failed:", err);
      throw err;
    }
  },

  updatePassword: async (payload) => {
    try {
      const response = await authApi.updatePassword(payload);
      return response.data;
    } catch (err) {
      console.error("Updating password failed:", err);
      throw err;
    }
  },

  getPlatformUniversities: async () => {
    try {
      const response = await authApi.getPlatformUniversities();
      return response?.data;
    } catch (err) {
      console.error("get platform universities failed:", err);
      throw err;
    }
  },

  getPlatformClubs: async (universityName) => {
    try {
      const response = await authApi.getPlatformClubs(universityName);
      return response?.data;
    } catch (err) {
      console.error("get platform clubs failed:", err);
      throw err;
    }
  },

  donationPaymentToClub: async (payload) => {
    try {
      const response = await authApi.donationPaymentToClub(payload);
      return response?.data;
    } catch (err) {
      console.error("Stripe donationPaymentToClub failed:", err);
      throw err;
    }
  },

  saveTransactionForClubDonation: async (payload) => {
    try {
      const response = await authApi.saveTransactionForClubDonation(payload);
      return response?.data;
    } catch (err) {
      console.error("Failed to save club donation transaction:", err);
      throw err;
    }
  },
};
