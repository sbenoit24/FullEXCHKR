"use client";
import { useEffect, useState } from "react";
import { Import, AlertCircle, CheckCircle, Clock, Mail } from "lucide-react";
import { useMembersDashboardStore } from "@/stores/officer/membersDashboardStore";
import { officerService } from "@/services/officer/officer.service";
import { useAlert } from "@/hooks/useAlert";

export default function TrackingList() {
  const showAlert = useAlert();
  const [search, setSearch] = useState("");
  const { duesData, loading, error, setDuesData, setLoading, setError } =
    useMembersDashboardStore();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(8);
  const [statusFilter, setStatusFilter] = useState("All");
  const [filteredData, setFilteredData] = useState([]);

  const renderStatusIcon = (status) => {
    const iconProps = {
      size: 14,
      className: "shrink-0",
    };

    switch (status) {
      case "Unpaid":
        return <AlertCircle {...iconProps} className="text-[#991B1B]" />;

      case "Paid":
        return <CheckCircle {...iconProps} className="text-[#00A63E]" />;

      case "Partial":
        return <Clock {...iconProps} className="text-yellow-500" />;

      default:
        return null;
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);

    if (status === "All") {
      setFilteredData(duesData);
      return;
    }

    setFilteredData(duesData.filter((item) => item.status === status));
  };

  const handleDownloadPdf = async () => {
    try {
      setLoading(true);

      const payload = {
        status: statusFilter,
      };

      const response = await officerService.downloadDuesListPdf(payload);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "dues.pdf";

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

  const fetchDuesList = async () => {
    try {
      setLoading(true);
      const data = await officerService.getDuesList({ page, size });
      setDuesData(data?.content || []); // <- fallback to empty array
      setFilteredData(data?.content || []); // default = All
      setStatusFilter("All"); // reset filter on fetch
      setError(null);
    } catch (error) {
      console.log("dues fetching failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sentDueReminder = async (memberId, dueId) => {
    try {
      const sentDuePayload = {
        memberId: memberId,
        dueId: dueId,
      };
      // console.log("daya got", sentDuePayload);
      await officerService.sentDueReminder(sentDuePayload);
      showAlert("Dues reminder sent!", "success");
    } catch (error) {
      console.log("sent due reminder failed:", error);
      showAlert("Failed to send the due reminder. Please try again.", "error");
    }
  };

  useEffect(() => {
    fetchDuesList();
  }, [page, size]);

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      {/* Top section */}
      <div className="flex items-start justify-between mb-6">
        {/* Left */}
        <div>
          <h3 className="text-[16px] leading-4 font-normal text-[#122B5B]">
            Dues Payment Status
          </h3>
          <p className="mt-1 text-[16px] leading-6 font-normal text-[#122B5B70]">
            Track and manage member dues payments
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-[#122B5B20] bg-white text-[14px] text-[#122B5B] focus:outline-none"
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
          </select>

          {/* Export */}
          {filteredData.length > 0 && (
            <button
              className="flex items-center gap-2 h-9 px-3 border border-[#122B5B20] rounded-md text-[#122B5B] text-[14px] font-normal"
              onClick={handleDownloadPdf}
            >
              <Import size={16} />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-[#122B5B70]">
            Loading dues...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">Error: {error}</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 text-[#122B5B70]">No dues found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-[14px] font-normal text-[#122B5B]">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-[14px] font-normal text-[#122B5B]">
                  Contact
                </th>
                <th className="px-4 py-2 text-left text-[14px] font-normal text-[#122B5B]">
                  Payment Status
                </th>
                <th className="px-4 py-2 text-left text-[14px] font-normal text-[#122B5B]">
                  Amount Paid
                </th>
                <th className="px-4 py-2 text-left text-[14px] font-normal text-[#122B5B]">
                  Amount Owed
                </th>
                <th className="px-4 py-2 text-left text-[14px] font-normal text-[#122B5B]">
                  Last Payment
                </th>
                <th className="px-4 py-2 text-left text-[14px] font-normal text-[#122B5B]">
                  Actions
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredData.map((row) => (
                <tr key={row.dueId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-[14px] text-[#122B5B]">
                    {row.fullName}
                  </td>

                  <td className="px-4 py-3 text-[14px] text-[#122B5B]">
                    {row.email}
                  </td>

                  <td className="px-4 py-3 text-[14px] text-[#122B5B]">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-normal ${
                        row.status === "Paid"
                          ? "bg-[#DCFCE7] text-[#00A63E]"
                          : "bg-[#FEE2E2] text-[#991B1B]"
                      }`}
                    >
                      {renderStatusIcon(row.status)}
                      {row.status || "Unknown"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-[#00A63E]">
                    {`$${row.amountPaid}`}
                  </td>

                  <td className="px-4 py-3 text-[14px] text-[#122B5B]">
                    {`$${row.amountOwed}`}
                  </td>

                  <td className="px-4 py-3 text-[14px] text-[#122B5B]">
                    {row.lastPaymentDate ? row.lastPaymentDate : ""}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {row.status === "Unpaid" || row.amountOwed > 0 ? (
                      <button
                        onClick={() => sentDueReminder(row.memberId, row.dueId)}
                        className="flex items-center gap-2 px-3 h-8 border border-[#122B5B20] rounded-md text-[#122B5B] text-[14px] hover:bg-[#122B5B08]"
                      >
                        <Mail size={14} />
                        Remind
                      </button>
                    ) : row.status === "Paid" || row.amountOwed === 0 ? (
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-normal ${
                          row.status === "Paid"
                            ? "bg-[#DCFCE7] text-[#00A63E]"
                            : "bg-[#FEE2E2] text-[#991B1B]"
                        }`}
                      >
                        {renderStatusIcon(row.status)}
                        {"Complete"}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {/* <span className="text-sm text-[#122B5B70]">Rows per page:</span>
            <select
              value={size}
              onChange={(e) => {
                setPage(0);
                setSize(Number(e.target.value));
              }}
              className="border border-[#122B5B20] rounded-md h-9 px-3 text-sm text-[#122B5B] bg-white hover:border-[#122B5B40] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#122B5B20]"
            >
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
            </select> */}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-[#122B5B] font-medium">
              Page {page + 1}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 0 || loading}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                className="flex items-center gap-1 px-4 h-9 border border-[#122B5B20] rounded-md text-sm text-[#122B5B] font-medium bg-white hover:bg-[#122B5B08] hover:border-[#122B5B40] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-[#122B5B20] transition-all"
              >
                <span>←</span>
                <span>Previous</span>
              </button>

              <button
                disabled={loading || filteredData.length < size}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-4 h-9 border border-[#122B5B20] rounded-md text-sm text-[#122B5B] font-medium bg-white hover:bg-[#122B5B08] hover:border-[#122B5B40] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-[#122B5B20] transition-all"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
