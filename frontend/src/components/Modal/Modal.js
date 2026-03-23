import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";
import { AlertCircle } from "lucide-react";

const Modal = forwardRef(({ isOpen, onClose, children }, ref) => {
  const [alerts, setAlerts] = useState([]);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Expose addAlert method to parent
  useImperativeHandle(ref, () => ({
    addAlert: (message) => {
      const id = Date.now() + Math.random();
      setAlerts((prev) => {
        const newAlerts = [...prev, { id, message }];
        return newAlerts.slice(-3);
      });

      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, 5000);
    },
  }));

  // Handle mount/unmount with animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Trigger animation after mount
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Clear all alerts when modal closes
      setAlerts([]);
      // Wait for animation to finish before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return createPortal(
    <>
      {/* Overlay with fade animation */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: "#00000080",
          opacity: isAnimating ? 1 : 0,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content with scale and fade animation */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 transition-all duration-300"
        style={{
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating ? "scale(1)" : "scale(0.95)",
        }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}

        {/* Stacked Alerts */}
        <div className="fixed bottom-10 right-5 z-50">
          {alerts.map((alert, index) => {
            const offset = (alerts.length - 1 - index) * 8;
            const scale = 1 - (alerts.length - 1 - index) * 0.05;
            const opacity = 1 - (alerts.length - 1 - index) * 0.15;

            return (
              <div
                key={alert.id}
                className="flex items-center gap-3 px-6 py-3 rounded shadow-lg animate-slideIn absolute bottom-0 right-0"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#122B5B",
                  transform: `translateY(-${offset}px) scale(${scale})`,
                  opacity: opacity,
                  transformOrigin: "bottom right",
                  transition: "all 0.3s ease-out",
                  whiteSpace: "nowrap",
                }}
              >
                <AlertCircle size={22} color="#122B5B" />
                <span className="text-lg font-medium">{alert.message}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-in animation */}
      <style jsx>{`
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>,
    document.body
  );
});

export default Modal;


/*
This modal component supports animated open/close behavior and exposes
an alert modal to display temporary messages inside the modal.
*/
