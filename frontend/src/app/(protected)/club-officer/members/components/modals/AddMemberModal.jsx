"use client";

import { useRef, useState } from "react";
import Modal from "@/components/Modal/Modal.js";
import { X, ChevronDown, Loader2 } from "lucide-react";
import { officerService } from "@/services/officer/officer.service";
import { useMembersDashboardStore } from "@/stores/officer/membersDashboardStore";

const ROLE_OPTIONS = [
  { id: 1, label: "Member" },
  // { id: 2, label: "President" },
  // { id: 3, label: "Vice President" },
  // { id: 4, label: "Treasurer" },
  // { id: 5, label: "Secretary" },
  { id: 6, label: "Officer" },
];

export default function AddMemberModal({ isOpen, onClose }) {
  const modalRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    roleId: 1,
    roleLabel: "Member",
  });

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setMembers, setError } = useMembersDashboardStore();

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      roleId: 1,
      roleLabel: "Member",
    });
    setOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddMember = async () => {
    
    if (loading) return; // extra protection

    if (!form.name || !form.email) {
      modalRef.current?.addAlert("Please fill in all fields");
      return;
    }

    const payload = {
      fullName: form.name,
      email: form.email,
      roleId: form.roleId,
    };

    try {
      setLoading(true);
      await officerService.addMember(payload);

      modalRef.current?.addAlert("Member added successfully");
      fetchMembers();

      handleClose();
    } catch (error) {
      modalRef.current?.addAlert(
        error?.response?.data?.message ||
          "Failed to add member. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await officerService.fetchMembers();
      setMembers(data);
      setError(null);
    } catch (error) {
      console.log("Member fetching failed:", error);
      setError(error.message);
    }
  };

  return (
    <Modal ref={modalRef} isOpen={isOpen} onClose={handleClose}>
      <div className="w-lg bg-white rounded-2xl border border-[#E5E7EB] shadow p-[25px] flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h2 className="text-[#122B5B] font-bold text-[18px]">
              Add New Member
            </h2>
            <p className="text-[#122B5B70] text-[14px] mt-2.5">
              Add a new member to your organization
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-800 -mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={21} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          {/* Full Name */}
          <div>
            <label className="text-[#122B5B] text-[14px] block mb-1">
              Full Name <span className="text-[#122B5B]">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={loading}
              className="w-full px-3 py-2 rounded-[14px] bg-[#122B5B08] text-[#122B5B70] border border-transparent focus:border-[#122B5B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-[#122B5B] text-[14px] block mb-1">
              Email <span className="text-[#122B5B]">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
              className="w-full px-3 py-2 rounded-[14px] bg-[#122B5B08] text-[#122B5B70] border border-transparent focus:border-[#122B5B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter email"
            />
          </div>

          {/* Role */}
          <div className="relative">
            <label className="text-[#122B5B] text-[14px] block mb-1">
              Role
            </label>

            <div
              className={`w-full px-3 py-2 rounded-[14px] border border-[#122B5B20] bg-white text-[#122B5B] cursor-pointer flex justify-between items-center ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => !loading && setOpen(!open)}
            >
              {form.roleLabel}
              <ChevronDown size={18} stroke="#122B5B" />
            </div>

            {open && !loading && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-[#122B5B20] rounded-[5px] overflow-hidden shadow-md">
                {ROLE_OPTIONS.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => {
                      setForm({
                        ...form,
                        roleId: role.id,
                        roleLabel: role.label,
                      });
                      setOpen(false);
                    }}
                    className="px-3 py-2 cursor-pointer text-[#122B5B] hover:bg-[#B8DFFF]"
                  >
                    {role.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleAddMember}
            disabled={loading}
            className="bg-[#122B5B] text-white px-4 py-2 rounded-[14px] w-4/5 text-[14px] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Adding..." : "Add Member"}
          </button>
          <button
            onClick={handleClose}
            disabled={loading}
            className="bg-white text-[#122B5B] px-4 py-2 rounded-[14px] w-1/5 border border-[#122B5B20] text-[14px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
