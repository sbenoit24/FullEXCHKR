"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

const AlertContext = createContext(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within AlertProvider");
  return context;
};

const ALERT_TYPES = {
  warning: {
    icon: AlertCircle,
    color: "#122B5B",
  },
  success: {
    icon: CheckCircle2,
    color: "#122B5B",
  },
  error: {
    icon: XCircle,
    color: "#DC2626",
  },
};

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted to true once the component enters the browser
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showAlert = useCallback((message, type = "warning") => {
    const id = Date.now() + Math.random();

    setAlerts((prev) => [...prev, { id, message, type }].slice(-3));

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 2000);
  }, []);

  return (
    <AlertContext.Provider value={showAlert}>
      {children}

      {/* Only render the UI container on the client. 
        This prevents the hydration mismatch caused by styled-jsx 
        and the dynamic positioning of the alert container.
      */}
      {isMounted && (
        <>
          <div className="fixed bottom-10 right-5 z-50 pointer-events-none">
            {alerts.map((alert, index) => {
              const offset = (alerts.length - 1 - index) * 16;
              const scale = 1 - (alerts.length - 1 - index) * 0.05;
              const opacity = 1 - (alerts.length - 1 - index) * 0.15;

              const config = ALERT_TYPES[alert.type] || ALERT_TYPES.warning;
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 px-6 py-3 rounded shadow-lg animate-slideIn absolute bottom-0 right-0 pointer-events-auto"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: config.color,
                    minWidth: "320px",
                    transform: `translateY(-${offset}px) scale(${scale})`,
                    opacity,
                    transformOrigin: "bottom right",
                    transition: "all 0.3s ease-out",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span className="shrink-0">
                    <Icon size={22} color={config.color} />
                  </span>
                  <span className="text-lg font-medium">{alert.message}</span>
                </div>
              );
            })}
          </div>

          <style jsx>{`
            .animate-slideIn {
              animation: slideIn 0.25s ease-out;
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
        </>
      )}
    </AlertContext.Provider>
  );
}
