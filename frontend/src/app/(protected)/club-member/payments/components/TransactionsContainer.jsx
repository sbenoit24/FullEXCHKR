"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Calendar,
  Download,
  Loader2,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import { memberService } from "@/services/member/member.service";
import { useAlert } from "@/hooks/useAlert";
import { formatToReadableDate } from "@/utils/date";

/**
 * Loading Skeleton Component
 * Mimics the structure of TransactionCard with a pulse animation
 */
const TransactionSkeleton = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-1.5">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-100 rounded" />
      </div>
      <div className="h-7 w-16 bg-gray-200 rounded" />
    </div>
    <div className="flex items-center justify-between mb-1">
      <div className="h-4 w-1/2 bg-gray-100 rounded" />
    </div>
    <div className="flex items-center pt-1">
      <div className="h-3 w-20 bg-gray-100 rounded" />
    </div>
  </div>
);

function TransactionCard({
  category,
  description,
  amount,
  status,
  transDate,
  onReceiptDownload,
  dueId,
}) {
  const statusConfig = {
    Completed: {
      container: "bg-green-50 text-green-700",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    Processing: {
      container: "bg-yellow-50 text-yellow-700",
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
    },
    Failed: {
      container: "bg-red-50 text-red-700",
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  const config = statusConfig[status] ?? statusConfig.Completed;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-semibold text-[#122B5B]">{category}</h3>
          <div
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${config.container}`}
          >
            {config.icon}
            <span>{status}</span>
          </div>
        </div>
        <p className="text-xl font-bold text-blue-900">${amount}</p>
      </div>

      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-[#122B5B70]">{description}</p>

        {category === "Dues" && (
          <button
            onClick={() => onReceiptDownload(dueId)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-900 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-5" />
            <span>Receipt</span>
          </button>
        )}
      </div>

      <div className="flex items-center pt-1">
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "#122B5B70" }}
        >
          <Calendar className="w-3 h-3" />
          <span>{formatToReadableDate(transDate)}</span>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsContainer({ paymentVersion }) {
  const showAlert = useAlert();
  const [transactions, setTransactions] = useState([]);

  // Status can be: 'idle', 'loading', 'success', or 'error'
  const [status, setStatus] = useState("idle");

  const fetchTransactions = async () => {
    setStatus("loading");
    try {
      const response = await memberService.memberTransactions();
      const transactionsArray = response.transactions || [];
      setTransactions(transactionsArray);
      setStatus("success");
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [paymentVersion]);

  const handleReceiptDownload = async (dueId) => {
    try {
      const payload = { dueId };
      const response = await memberService.dueReceiptDownload(payload);

      const fileName = `Exchkr Club Due Invoice ${dueId}.pdf`;
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showAlert("Failed to download receipt", "error");
    }
  };

  return (
    <div className="w-full mt-8">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-[#122B5B] mb-4">
        Recent Transactions
        <button
          onClick={fetchTransactions}
          className="p-1 rounded hover:bg-gray-100 transition disabled:opacity-50"
          title="Reload transactions"
          disabled={status === "loading"}
        >
          <RefreshCcw
            className={`w-4 h-4 text-[#122B5B] ${status === "loading" ? "animate-spin" : ""}`}
          />
        </button>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. LOADING STATE */}
        {status === "loading" &&
          Array.from({ length: 10 }).map((_, i) => (
            <TransactionSkeleton key={i} />
          ))}

        {/* 2. ERROR STATE - Added md:col-span-2 and w-full */}
        {status === "error" && (
          <div className="md:col-span-2 w-full py-12 flex flex-col items-center justify-center text-center gap-3">
            <p className="text-sm text-red-600">
              We couldn't load the data. Please try again.
            </p>
            <button
              onClick={fetchTransactions}
              className="flex items-center gap-2 text-xs font-semibold text-[#122B5B] uppercase tracking-wider hover:opacity-70 transition-opacity"
            >
              <RefreshCcw className="w-3 h-3" /> Try Again
            </button>
          </div>
        )}

        {/* 3. EMPTY STATE - Added md:col-span-2 and w-full */}
        {status === "success" && transactions.length === 0 && (
          <div className="md:col-span-2 w-full py-12 flex flex-col items-center justify-center text-center">
            <h3 className="text-base font-semibold text-[#122B5B]">
              No recent transactions
            </h3>
            <p className="text-sm mt-1 text-[#122B5B]">
              Your transaction history is currently empty.
            </p>
          </div>
        )}

        {/* 4. SUCCESS STATE (With Data) */}
        {status === "success" &&
          transactions.map((transaction) => (
            <TransactionCard
              key={transaction.transId}
              {...transaction}
              onReceiptDownload={() =>
                handleReceiptDownload(transaction?.dueId)
              }
            />
          ))}
      </div>
    </div>
  );
}
