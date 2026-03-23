import { create } from "zustand";
import { officerService } from "@/services/officer/officer.service";

export const useOfficersDashboardStore = create((set) => ({
  linkToken: null,
  isLinked: null,
  needsRepair: false,
  bankStatus: null,
  isBankLinking: false,
  loading: false,
  clubBudgetSummary: null,

  userClubData: {
    clubBalance: null,
    balanceDifference: null,
  },

  setLinkToken: (token) => set({ linkToken: token }),
  setIsLinked: (status) => set({ isLinked: status }),
  setNeedsRepair: (value) => set({ needsRepair: value }),
  setBankStatus: (status) => set({ bankStatus: status }),
  setIsBankLinking: (value) => set({ isBankLinking: value }),
  setLoading: (loading) => set({ loading }),

  setUserClubData: (updater) =>
    set((state) => ({
      userClubData:
        typeof updater === "function" ? updater(state.userClubData) : updater,
    })),

  setClubBudgetSummary: (summary) => set({ clubBudgetSummary: summary }),

  clearStore: () =>
    set({
      linkToken: null,
      isLinked: null,
      needsRepair: false,
      bankStatus: null,
      isBankLinking: false,
      clubBudgetSummary: null, // clear the new state as well
      userClubData: { clubBalance: null, balanceDifference: null },
    }),

  // ----------------------------------------
  // Updated Refresh logic
  // ----------------------------------------
  refreshBankStatus: async () => {
    try {
      const response = await officerService.bankConnectionStatus();
      const { isLinked, needsRepair, institutionName, defaultAccountId } =
        response;

      set({
        isLinked,
        needsRepair: needsRepair ?? false,
        bankStatus: isLinked
          ? {
              institutionName,
              primaryAccountId: defaultAccountId,
            }
          : null,
      });

      return response;
    } catch (error) {
      console.error("Error refreshing bank connection status:", error);
      set({ isLinked: null, bankStatus: null, needsRepair: false });
      return null;
    }
  },
}));
