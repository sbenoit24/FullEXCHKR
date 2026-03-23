"use client";

import { useState, useEffect } from "react";
import { LoaderIcon, FileText, LinkIcon, AlertCircle } from "lucide-react";
import CreateInvoiceOverlay from "../../../../../components/Modal/CreateInvoiceOverlay";
import BudgetConfigureModal from "./modals/BudgetConfigureModal";
import AddBudgetCategoryModal from "../components/modals/AddBudgetCategoryModal";
import { useAlert } from "@/hooks/useAlert";
import { officerService } from "@/services/officer/officer.service";
import { useOfficersDashboardStore } from "@/stores/officer/officerDashboardStore";

export default function FinanceHeader() {
  const showAlert = useAlert();
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [budgetExists, setBudgetExists] = useState(false);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [activeMembers, setActiveMembers] = useState(null);
  const isLinked = useOfficersDashboardStore((state) => state.isLinked);
  const setIsLinked = useOfficersDashboardStore((state) => state.setIsLinked);
  const needsRepair = useOfficersDashboardStore((state) => state.needsRepair);
  const isBankLinking = useOfficersDashboardStore((s) => s.isBankLinking);
  const setIsBankLinking = useOfficersDashboardStore((s) => s.setIsBankLinking);
  const clubBudgetSummary = useOfficersDashboardStore(
    (s) => s.clubBudgetSummary,
  );
  const setClubBudgetSummary = useOfficersDashboardStore(
    (s) => s.setClubBudgetSummary,
  );
  const [clubBudgetCategories, setClubBudgetCategories] = useState(null);
  const [showAddBudgetCategories, setShowAddBudgetCategories] = useState(false);

  const checkBankConnectionStatus = async () => {
    try {
      const response = await officerService.bankConnectionStatus();
      const { isLinked } = response;
      // console.log("check status response", response);

      setIsLinked(isLinked);

      return response;
    } catch (error) {
      console.error("Error checking bank connection status:", error);
      setIsLinked(null);
      return null;
    }
  };

  const getActiveMembers = async () => {
    try {
      const response = await officerService.fetchMembers();
      console.log("memberss", response);
      setActiveMembers(response);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to get active members";
      showAlert(message, "error");
      console.log("active members get error", error);
    }
  };

  const getClubBudgetSummary = async () => {
    try {
      const response = await officerService.getClubBudgetSummary();
      // console.log("hahaha", response);
      setBudgetExists(true);
      setClubBudgetSummary(response);
    } catch (error) {
      if (error.response?.status === 404) {
        setBudgetExists(false);
        setClubBudgetSummary(null);
      } else {
        console.log("budget summary get error", error);
      }
    }
  };

  const getClubBudgetCategories = async () => {
    try {
      const response = await officerService.getBudgetCategories();
      console.log("category", response);
      setClubBudgetCategories(response || []);
    } catch (error) {
      console.error("get budget categories failed:", error);
      setClubBudgetCategories([]);
    }
  };

  // api call to generate invoice using form data, share it to the selected members, add due, save invoice
  const createInvoice = async (invoiceData) => {
    try {
      await officerService.createInvoiceAndDue(invoiceData);
      setShowCreateInvoice(false);
      showAlert("Invoice sent successfully", "success");
    } catch (error) {
      console.log("send invoices error", error);
      setShowCreateInvoice(false);
      showAlert("Failed to create invoice", "error");
    }
  };

  // api call to generate and get link token to link bank using plaid
  const handleConnectBank = async () => {
    try {
      setIsBankLinking(true);
      await officerService.generateLinkToken();
    } catch (error) {
      setIsBankLinking(false);
      console.error("Error generating link token:", error);
    }
  };

  const handleBudgetSave = async (budgetData) => {
    try {
      if (budgetExists && clubBudgetSummary) {
        const editPayload = {
          totalBudget: budgetData.totalBudget,
          categoryUpdates: budgetData.categories.map((cat) => ({
            categoryId: cat.categoryId, // Will be null for brand new rows
            categoryName: cat.categoryName, // The typed-in name
            totalBudgeted: cat.totalBudgeted,
          })),
        };

        await officerService.updateBudget(editPayload);
        showAlert("Budget updated successfully", "success");
      } else {
        // For brand new budgets, ensure the structure matches your Service layer expectations
        const createPayload = {
          totalBudget: budgetData.totalBudget,
          categories: budgetData.categories.map((cat) => ({
            categoryId: cat.categoryId,
            categoryName: cat.categoryName,
            totalBudgeted: cat.totalBudgeted,
          })),
        };

        await officerService.addBudget(createPayload);
        showAlert("Budget created successfully", "success");
      }

      await getClubBudgetSummary();
      await getClubBudgetCategories();
      setShowAddBudgetModal(false);
    } catch (error) {
      console.error("Save budget error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to save budget. Ensure allocations match total.";
      showAlert(errorMsg, "error");
    }
  };

  const handleBudgetCategorySave = async (categoryData) => {
    try {
      await officerService.createBudgetCategories(categoryData);
      showAlert("Budget categories created successfully", "success");

      setShowAddBudgetCategories(false);

      // Refetch categories so state updates
      await getClubBudgetCategories();

      // Open budget modal after creating categories
      setShowAddBudgetModal(true);
    } catch (error) {
      console.error("create budget categories failed:", error);
      showAlert("Failed to create budget categories", "error");
    }
  };

  const handleBudgetConfigure = () => {
    if (clubBudgetCategories && clubBudgetCategories.length > 0) {
      setShowAddBudgetModal(true);
    } else {
      setShowAddBudgetCategories(true);
    }
  };

  useEffect(() => {
    getActiveMembers();
    getClubBudgetSummary();
    checkBankConnectionStatus();
    getClubBudgetCategories();
  }, []);

  return (
    <>
      <div className="p-8 md:py-9 rounded-3xl bg-[#0D214A]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          {/* Left section */}
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-normal text-white">
              Finance Dashboard 💰
            </h2>
          </div>

          {/* Right section */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            <button
              onClick={() => setShowCreateInvoice(true)}
              className="flex items-center justify-center gap-2 bg-white text-[#122B5B] text-[13px] rounded-[14px] w-[139px] h-9 hover:opacity-80"
            >
              <FileText size={16} />
              Create Invoice
            </button>

            <button
              onClick={handleBudgetConfigure}
              className="flex items-center justify-center gap-2 bg-white text-[#122B5B] text-[13px] rounded-[14px] w-[139px] h-9 hover:opacity-80"
            >
              <FileText size={16} />
              {!budgetExists ? "Add Budget" : "Edit Budget"}
            </button>

            {(isLinked === false || needsRepair === true) && (
              <button
                disabled={isBankLinking}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isBankLinking) handleConnectBank?.();
                }}
                className="flex items-center justify-center gap-2 border text-white text-[14px] rounded-[14px] w-[139px] h-9 bg-[#485572]"
              >
                {isBankLinking ? (
                  <>
                    <LoaderIcon size={14} className="animate-spin" />
                    Connecting…
                  </>
                ) : needsRepair === true ? (
                  <>
                    <AlertCircle size={14} />
                    Action Required
                  </>
                ) : (
                  <>
                    <LinkIcon size={14} />
                    Connect Bank
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mt-3">
          <p className="text-base md:text-lg font-normal text-[#DBEAFE]">
            Real-time view of your organization's financial health
          </p>
        </div>
      </div>

      {/* Modals */}
      {showCreateInvoice && (
        <CreateInvoiceOverlay
          onClose={() => setShowCreateInvoice(false)}
          members={activeMembers || []}
          onSend={(invoiceData) => createInvoice(invoiceData)}
        />
      )}

      {showAddBudgetModal && (
        <BudgetConfigureModal
          isOpen={showAddBudgetModal}
          onClose={() => setShowAddBudgetModal(false)}
          onSave={handleBudgetSave}
          availableCategories={clubBudgetCategories || []}
          budgetExists={budgetExists}
          existingBudget={clubBudgetSummary}
        />
      )}

      {showAddBudgetCategories && (
        <AddBudgetCategoryModal
          isOpen={showAddBudgetCategories}
          onClose={() => setShowAddBudgetCategories(false)}
          onSave={handleBudgetCategorySave}
        />
      )}
    </>
  );
}
