import { create } from "zustand";

export const useMembersDashboardStore = create((set) => ({
  // Members list state
  membersData: [],

  // dues list state
  duesData: [],

  // UI state
  loading: false,
  error: null,

  // Actions
  setMembers: (members) => set({ membersData: members }),
  setDuesData: (dues) => set({ duesData: dues }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
