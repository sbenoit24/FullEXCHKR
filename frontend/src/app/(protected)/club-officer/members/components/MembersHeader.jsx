"use client";

import { useState, useEffect } from "react";
import { UserPlus, FileText, Mail } from "lucide-react";
import AddMemberModal from "./modals/AddMemberModal";
import CreateInvoiceOverlay from "../../../../../components/Modal/CreateInvoiceOverlay";
import SendDuesReminders from "@/components/Modal/SendDuesReminder";
import { useAlert } from "@/hooks/useAlert";
import { officerService } from "@/services/officer/officer.service";

export default function MembersHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showAlert = useAlert();
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showSendDuesModal, setShowSendDuesModal] = useState(false);
  const [duesReminderList, setDuesReminderLIst] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
  });

  const [activeMembers, setActiveMembers] = useState(null);

  // dues reminder list pagination states
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(4);

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

  const getDuesList = async (newPage = page) => {
    try {
      const response = await officerService.getDuesList({
        page: newPage,
        size,
      });

      const filteredDues =
        response?.content?.filter((item) => Number(item.amountOwed) > 0) || [];

      console.log("dueslist", filteredDues);

      setDuesReminderLIst({
        ...response,
        content: filteredDues,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to get dues list";
      showAlert(message, "error");
      console.log("dues list get error", error);
    }
  };

  const handleDuesRemindersSend = async (payload) => {
    try {
      const sendDuesList = (payload || []).map((item) => ({
        memberId: item.memberId,
        dueId: item.dueId,
      }));

      await officerService.sentDueReminders(sendDuesList);

      showAlert("Due reminders sent!", "success");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to get dues list";
      showAlert(message, "error");
      console.log("dues list get error", error);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    console.log("Page changed to:", newPage);
    getDuesList(newPage);
  };

  useEffect(() => {
    getActiveMembers();
    getDuesList();
  }, []);

  return (
    <>
      <div className="p-8 md:py-9 rounded-3xl bg-[#0D214A]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          {/* Left section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-normal text-white">
                Member Management 👥
              </h2>
            </div>
          </div>

          {/* Right section: Buttons */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            <button
              className="flex items-center justify-center gap-2 bg-white text-[#122B5B] font-normal text-[14px] leading-5 rounded-[14px] w-[139px] h-9 hover:opacity-80 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <UserPlus size={16} />
              Add Member
            </button>

            <button
              onClick={() => setShowCreateInvoice(true)}
              className="flex items-center justify-center gap-2 bg-[#C39A4E] text-white font-normal text-[14px] leading-5 rounded-[14px] w-[139px] h-9 hover:opacity-80 cursor-pointer"
            >
              <FileText size={16} />
              Create Invoice
            </button>

            <button
              onClick={() => {
                setShowSendDuesModal(true);
                setPage(1);
              }}
              className="flex items-center justify-center gap-2.5 border text-white font-normal text-[14px] leading-5 rounded-[14px] w-[139px] h-9 hover:opacity-80 cursor-pointer"
              style={{ backgroundColor: "#FFFFFF4D", borderColor: "#FFFFFF4D" }}
            >
              <Mail size={16} />
              Send Reminders
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mt-3">
          <p className="text-base md:text-lg font-normal text-[#DBEAFE]">
            Track members and manage dues collection
          </p>
        </div>
      </div>

      {/* Call the split modal */}
      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/*Create Invoice Modal */}
      {showCreateInvoice && (
        <CreateInvoiceOverlay
          onClose={() => setShowCreateInvoice(false)}
          members={activeMembers || []}
          onSend={(invoiceData) => createInvoice(invoiceData)}
        />
      )}

      {/*Send Dues Reminder Modal */}
      {showSendDuesModal && (
        <SendDuesReminders
          isOpen={showSendDuesModal}
          onClose={() => setShowSendDuesModal(false)}
          onSend={(payload) => {
            setShowSendDuesModal(false);
            handleDuesRemindersSend(payload);
          }}
          recipients={duesReminderList.content}
          currentPage={page}
          onPageChange={handlePageChange}
          totalPages={duesReminderList.totalPages}
          totalElements={
            Array.isArray(duesReminderList?.content)
              ? duesReminderList.content.length
              : 0
          }
        />
      )}
    </>
  );
}
