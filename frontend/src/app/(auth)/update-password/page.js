"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import icon from "@/assets/images/EXCHKR Golden Bull.png";
import { authService } from "@/services/auth/auth.service";
import MessageButtonModal from "@/components/Modal/MessageButtonModal";

export default function UpdatePasswordPage() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (newPassword !== confirmNewPassword) {
      setModalType("error");
      setModalMessage("New password and confirmation do not match.");
      setModalOpen(true);
      return;
    }

    setIsLoading(true);

    const payload = { email, currentPassword, newPassword };

    try {
      await authService.updatePassword(payload);

      setModalType("success");
      setModalMessage("Password updated successfully. Please login again.");
      setModalOpen(true);
    } catch (error) {
      console.error("Password update failed:", error);

      setModalType("error");
      setModalMessage("Oops, something went wrong. Please try again.");
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Modal OK button handler
  const handleModalOk = () => {
    if (modalType === "success") {
      router.push("/login");
    }
    setModalOpen(false);
  };

  const renderPasswordField = (
    label,
    value,
    setValue,
    show,
    setShow,
    placeholder,
  ) => (
    <div className="relative">
      <label className="block mb-1 text-xs sm:text-[14px] font-normal text-[#122B5B]">
        {label}
      </label>
      <input
        type={show ? "text" : "password"}
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-8 sm:h-9 rounded-[14px] px-3 sm:px-4
                   bg-[#122B5B08] border border-transparent
                   text-xs sm:text-[14px] leading-5 text-[#122B5B]
                   placeholder:text-[#122B5B99]
                   focus:outline-none focus:ring-2 focus:ring-[#122B5B]
                   transition-all pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#122B5B99] mt-2.5"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-[#0E2249]">
        <div className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#122B5B] px-4 sm:px-6 py-4 sm:py-5 flex flex-col items-center gap-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative shrink-0">
              <Image
                src={icon}
                alt="App Icon"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1
              className="text-2xl sm:text-[30px] leading-8 sm:leading-9 font-bold text-[#C39A4E] text-center"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              EXCHKR
            </h1>
            <p className="text-base sm:text-[18px] leading-6 sm:leading-7 font-normal text-[#B8DFFF] text-center">
              Update Your Password
            </p>
          </div>

          {/* Body */}
          <div className="bg-[#FFFFFFE5] p-5 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Email */}
              <div>
                <label className="block mb-1 text-xs sm:text-[14px] font-normal text-[#122B5B]">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-8 sm:h-9 rounded-[14px] px-3 sm:px-4
                             bg-[#122B5B08] border border-transparent
                             text-xs sm:text-[14px] leading-5 text-[#122B5B]
                             placeholder:text-[#122B5B99]
                             focus:outline-none focus:ring-2 focus:ring-[#122B5B]
                             transition-all"
                />
              </div>

              {/* Password fields with toggle */}
              {renderPasswordField(
                "Current Password",
                currentPassword,
                setCurrentPassword,
                showCurrent,
                setShowCurrent,
                "Enter current password",
              )}
              {renderPasswordField(
                "New Password",
                newPassword,
                setNewPassword,
                showNew,
                setShowNew,
                "Enter new password",
              )}
              {renderPasswordField(
                "Confirm New Password",
                confirmNewPassword,
                setConfirmNewPassword,
                showConfirm,
                setShowConfirm,
                "Confirm new password",
              )}

              {/* Update Button */}
              <div className="mt-5 sm:mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-9 sm:h-10 rounded-[14px]
                             bg-[#122B5B] text-white
                             text-xs sm:text-[14px] font-normal leading-5
                             flex items-center justify-center gap-2
                             transition-all
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Update Password
                  {isLoading && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      <MessageButtonModal
        isOpen={modalOpen}
        type={modalType}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onOk={handleModalOk}
      />
    </>
  );
}
