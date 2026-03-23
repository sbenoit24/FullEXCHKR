"use client";

import { useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import { LogOut } from "lucide-react";
import { AlertProvider } from "@/hooks/useAlert";
import Image from "next/image";
import icon from "@/assets/images/EXCHKR Golden Bull.png";

export default function ClubMemberLayout({ children }) {
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/login");
  };

  return (
    <AlertProvider>
      <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
        {/* ------------------ HEADER ------------------ */}
        <header
          className="border-b"
          style={{
            backgroundColor: "var(--brand-white)",
            borderColor: "rgba(18, 43, 91, 0.125)",
          }}
        >
          {/* Inner wrapper to match children padding */}
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src={icon} alt="Logo" width={48} height={48} />
              <div className="flex flex-col">
                <h1
                  className="text-2xl font-bold text-[#122B5B]"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  EXCHKR
                </h1>
                <span
                  className="text-sm"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Members Portal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="px-3 py-1 rounded-md text-sm"
                style={{
                  backgroundColor: "var(--secondary)",
                  color: "var(--primary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Club Member
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1 rounded-md transition-colors"
                style={{
                  backgroundColor: "var(--brand-white)",
                  color: "var(--primary)",
                  border: "1px solid rgba(18,43,91,0.125)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--badge-destructive-bg)";
                  e.currentTarget.style.color = "var(--brand-white)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--brand-white)";
                  e.currentTarget.style.color = "var(--primary)";
                }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* ------------------ Page ------------------ */}
        <div className="flex-1 bg-[#F9FAFB] px-8 pt-4 pb-8">{children}</div>
      </div>
    </AlertProvider>
  );
}
