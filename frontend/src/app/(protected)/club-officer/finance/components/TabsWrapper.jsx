"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import PendingExpenses from "./PendingExpenses";
import BudgetOverview from "./BudgetOverview";
import BudgetCategories from "./BudgetCategories";
import { TabNavigation } from "./TabNavigation";
import { CheckCircle2, Inbox, Clock, AlertCircle } from "lucide-react";
import { useAlert } from "@/hooks/useAlert";
import { officerService } from "@/services/officer/officer.service";
import { SpendingByCategory } from "./SpendingByCategory";
import { MonthlySpendingChart } from "./MonthlySpendingChart";
import { useOfficersDashboardStore } from "@/stores/officer/officerDashboardStore";

export default function TabsWrapper() {
  const showAlert = useAlert();
  const [activeTab, setActiveTab] = useState("Transactions");
  const [transactionHistory, setTransactionHistory] = useState(null);
  const [filteredTransactionHistory, setFilteredTransactionHistory] =
    useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilterOption, setSelectedFilterOption] = useState("All");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const { loading, setLoading } = useOfficersDashboardStore();
  const [monthlyData, setMonthlyData] = useState([]);
  const [spendingData, setSpendingData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const clubBudgetSummary = useOfficersDashboardStore(
    (s) => s.clubBudgetSummary,
  );
  const setClubBudgetSummary = useOfficersDashboardStore(
    (s) => s.setClubBudgetSummary,
  );

  const columns = [
    { key: "date", label: "Date", width: "10%" },
    { key: "description", label: "Description", width: "30%" },
    {
      key: "category",
      label: "Category",
      width: "15%",
      render: (value) => (
        <span className="px-3 py-1 bg-white text-gray-700 rounded-full text-xs font-medium border border-[#E2E4EB]">
          {value}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      width: "12%",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === "Income"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      width: "12%",
      render: (value) => (
        <span
          className={`font-semibold ${
            value.startsWith("+") ? "text-green-600" : "text-red-600"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "15%",
      render: (value) => (
        <span
          className={`inline-flex items-center justify-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full leading-none ${
            value === "completed"
              ? "bg-green-100 text-green-700"
              : value === "processing"
                ? "bg-[#C39A4E]/20 text-[#C39A4E]"
                : "bg-red-100 text-red-700"
          }`}
        >
          {value === "processing" ? (
            <Clock className="w-4 h-4" />
          ) : value === "failed" ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}

          {value}
        </span>
      ),
    },
  ];

  // const data = [
  //   {
  //     date: "Oct 24",
  //     description: "Alex Rodriguez - Fall Dues",
  //     category: "Dues",
  //     type: "Income",
  //     amount: "+$150",
  //     status: "completed",
  //   },
  //   {
  //     date: "Oct 23",
  //     description: "Film Festival Venue Deposit",
  //     category: "Events",
  //     type: "Expense",
  //     amount: "$3,500",
  //     status: "completed",
  //   },
  //   {
  //     date: "Oct 23",
  //     description: "Luca - Fall Dues",
  //     category: "Dues",
  //     type: "Income",
  //     amount: "+$150",
  //     status: "completed",
  //   },
  //   {
  //     date: "Oct 22",
  //     description: "Film Licensing for Documentary Screening",
  //     category: "Philanthropy",
  //     type: "Expense",
  //     amount: "$1,500",
  //     status: "completed",
  //   },
  //   {
  //     date: "Oct 21",
  //     description: "Jamie Park - Partial Dues",
  //     category: "Dues",
  //     type: "Income",
  //     amount: "+$75",
  //     status: "completed",
  //   },
  //   {
  //     date: "Oct 20",
  //     description: "Cinematography Workshop Guest Speaker",
  //     category: "Events",
  //     type: "Expense",
  //     amount: "$1,000",
  //     status: "completed",
  //   },
  //   {
  //     date: "Oct 19",
  //     description: "Emily Davis - Fall Dues",
  //     category: "Dues",
  //     type: "Income",
  //     amount: "+$150",
  //     status: "completed",
  //   },
  //   {
  //     date: "Oct 18",
  //     description: "Camera Equipment Storage",
  //     category: "Supplies",
  //     type: "Expense",
  //     amount: "$85",
  //     status: "completed",
  //   },
  //   {
  //     date: "Oct 17",
  //     description: "Michael Brown - Fall Dues",
  //     category: "Dues",
  //     type: "Income",
  //     amount: "+$150",
  //     status: "completed",
  //   },
  //   {
  //     date: "Oct 16",
  //     description: "Film Festival Posters",
  //     category: "Marketing",
  //     type: "Expense",
  //     amount: "$200",
  //     status: "completed",
  //   },
  // ];

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);

    if (!searchValue) {
      setFilteredTransactionHistory(transactionHistory);
      return;
    }

    const filtered = transactionHistory?.filter((item) =>
      item.description.toLowerCase().includes(searchValue.toLowerCase()),
    );

    setFilteredTransactionHistory(filtered);
  };

  const handleFilterSelect = (filterOption) => {
    setSelectedFilterOption(filterOption);

    if (!transactionHistory || filterOption === "All") {
      setFilteredTransactionHistory(transactionHistory);
      return;
    }

    const filtered = transactionHistory.filter(
      (item) => item.category?.toLowerCase() === filterOption.toLowerCase(),
    );

    setFilteredTransactionHistory(filtered);
  };

  const handleDownloadPdf = async (payload) => {
    try {
      setLoading(true);

      const response =
        await officerService.downloadTransactionHistoryPdf(payload);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "transactions.pdf";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const message = error?.response?.data?.message || "pdf download error";
      showAlert(message, "error");
      console.error("pdf download error", error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = async () => {
    try {
      const results = await Promise.allSettled([
        officerService.getSpendingCategory(),
        officerService.getMonthlySpending(),
      ]);
      const [spending, monthly] = results;

      console.log("chart data got", spending, monthly);

      if (spending.status === "fulfilled") {
        setSpendingData(spending.value);
      }

      if (monthly.status === "fulfilled") {
        setMonthlyData(monthly.value);
      }
    } catch (error) {
      const message = error?.response?.data?.message || "chart data error";
      console.error("chart data error", error);
    }
  };

  const getTransactionHistory = async () => {
    try {
      setLoading(true);
      const response = await officerService.getTransactionHistory({
        page,
        size,
      });

      const processedData = response?.data?.content?.map((item) => ({
        date: formatDate(item.transDate),
        description: item.description,
        category: item.category,
        type: item.type === "Income" ? "Income" : "Expense",
        amount: item.type === "Income" ? `+$${item.amount}` : `$${item.amount}`,
        status: item.status.toLowerCase(),
      }));

      setTransactionHistory(processedData);
      setFilteredTransactionHistory(processedData);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to get transaction history";
      showAlert(message, "error");
      console.log("transaction history error", error);
    } finally {
      setLoading(false);
    }
  };

  const getClubBudgetSummary = async () => {
    try {
      const response = await officerService.getClubBudgetSummary();
      setBudgetData(response?.categories || []);
    } catch (error) {
      setBudgetData([]);
      console.log("budget summary error", error);
    }
  };

  useEffect(() => {
    getTransactionHistory();
    getClubBudgetSummary();
    getChartData();
  }, [page, size, clubBudgetSummary]);


  // const monthlyData = [
  //   { month: "Jul", amount: 2400 },
  //   { month: "Aug", amount: 1800 },
  //   { month: "Sep", amount: 3200 },
  //   { month: "Oct", amount: 4800 },
  // ];

  // const categoryData = [
  //   { name: "Events", value: 72, color: "#0F172A" },
  //   { name: "Philanthropy", value: 18, color: "#BAE6FD" },
  //   { name: "Marketing", value: 5, color: "#D97706" },
  //   { name: "Supplies", value: 4, color: "#E0E7FF" },
  //   { name: "Other", value: 3, color: "#F3F4F6" },
  // ];

  return (
    <div className="w-full space-y-1 mt-8">
      <TabNavigation
        tabs={["Overview", "Transactions", "Budget", "Pending Expenses"]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "Transactions" &&
        (transactionHistory && transactionHistory.length > 0 ? (
          <DataTable
            title="Transaction History"
            subtitle="All income and expenses"
            columns={columns}
            data={filteredTransactionHistory}
            searchPlaceholder="Search transactions..."
            filterLabel="All Categories"
            selectedFilterOption={selectedFilterOption}
            filterOptions={[
              "All",
              "Dues",
              "Events",
              "Philanthropy",
              "Marketing",
              "Supplies",
            ]}
            onFilter={handleFilterSelect}
            searchTerm={searchTerm}
            onSearch={handleSearch}
            page={page}
            size={size}
            setPage={setPage}
            setSize={setSize}
            loading={loading}
            onExport={handleDownloadPdf}
            showExport={!!transactionHistory?.length}
          />
        ) : (
          <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-24 text-gray-500">
            <Inbox className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium">No transaction history</p>
            <p className="text-sm text-gray-400">
              Transactions will appear here once available
            </p>
          </div>
        ))}

      {activeTab === "Overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpendingByCategory data={spendingData} />
            <MonthlySpendingChart data={monthlyData} />
          </div>
          <div className="my-6">
            <BudgetCategories budgetData={budgetData} />
          </div>
        </>
      )}

      {activeTab === "Pending Expenses" && <PendingExpenses />}

      {activeTab === "Budget" && <BudgetOverview budgetData={budgetData} />}
    </div>
  );
}
