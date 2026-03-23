"use client";

import { useRef } from "react";
import Modal from "@/components/Modal/Modal.js";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export default function MessageButtonModal({
  isOpen,
  onClose,
  onOk, // optional parent callback
  message,
  type = "info", // "success" | "error" | "warning" | "info"
}) {
  const modalRef = useRef(null);

  const handleOk = () => {
    // 1. Execute parent action if exists
    if (typeof onOk === "function") {
      onOk();
    }

    // 2. Always close modal
    onClose();
  };

  const config = {
    success: {
      Icon: CheckCircle,
      iconColor: "text-green-600",
      textColor: "text-green-700",
    },
    error: {
      Icon: XCircle,
      iconColor: "text-red-600",
      textColor: "text-red-600",
    },
    warning: {
      Icon: AlertTriangle,
      iconColor: "text-yellow-500",
      textColor: "text-yellow-600",
    },
    info: {
      Icon: Info,
      iconColor: "text-blue-600",
      textColor: "text-blue-600",
    },
  };

  const { Icon, iconColor, textColor } = config[type];

  return (
    <Modal ref={modalRef} isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E7EB] shadow px-6 py-6 flex flex-col gap-5 items-center text-center">
        {/* Icon */}
        <Icon size={48} className={iconColor} />

        {/* Message */}
        <div className={`text-sm leading-relaxed ${textColor}`}>{message}</div>

        {/* OK Button */}
        <div className="pt-3 w-full flex justify-center">
          <button
            onClick={handleOk}
            className="w-full max-w-xs py-2.5 rounded-xl text-sm font-medium cursor-pointer bg-[#122B5B] text-white"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
}
