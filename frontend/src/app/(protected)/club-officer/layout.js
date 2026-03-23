"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  DollarSign,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import icon from "@/assets/images/EXCHKR Blue Bull.png";
import { AlertProvider } from "@/hooks/useAlert";
import PlaidLinkManager from "@/components/Plaid/PlaidLinkManager";

export default function ClubOfficerLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  const navItems = [
    { name: "Dashboard", href: "/club-officer/dashboard", icon: Home },
    { name: "Finance", href: "/club-officer/finance", icon: DollarSign },
    { name: "Members", href: "/club-officer/members", icon: Users },
  ];

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/login");
  };

  return (
    <AlertProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`flex flex-col p-4 justify-between transition-all duration-300 z-20 relative`}
          style={{
            backgroundColor: "var(--brand-white)",
            width: sidebarOpen ? "265px" : "64px",
            // Refined shadow: only projects to the right
            boxShadow:
              "2px 0 24px -3px rgba(0, 0, 0, 0.1), 2px 0 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div>
            {/* Header with toggle */}
            <div className="flex items-center justify-between mb-6 h-8">
              <div
                className={`flex items-center gap-2 overflow-hidden transition-all duration-300`}
                style={{
                  width: sidebarOpen ? "auto" : "0",
                  opacity: sidebarOpen ? 1 : 0,
                }}
              >
                <Image src={icon} alt="Logo" width={185} />
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 rounded hover:bg-gray-200 shrink-0"
              >
                {sidebarOpen ? (
                  <ChevronLeft
                    className="w-6 h-6"
                    style={{ color: "var(--primary)" }}
                  />
                ) : (
                  <ChevronRight
                    className="w-6 h-6"
                    style={{ color: "var(--primary)" }}
                  />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center p-2.5 rounded-full
    transition-all duration-300 ease-out
    hover:scale-105 hover:shadow-xl
    cursor-pointer
    ${!isActive ? "hover:bg-gray-100" : ""}
    ${sidebarOpen ? "justify-start gap-4" : "justify-center"}
  `}
                    style={
                      isActive
                        ? {
                            backgroundColor: "var(--primary)",
                            border: "2px solid var(--accent)",
                          }
                        : {}
                    }
                  >
                    <Icon
                      className="w-5 h-5 shrink-0"
                      style={{
                        color: isActive
                          ? "var(--brand-white)"
                          : "var(--primary)",
                      }}
                    />
                    {sidebarOpen && (
                      <span
                        className="whitespace-nowrap transition-opacity duration-300"
                        style={{
                          color: isActive
                            ? "var(--brand-white)"
                            : "var(--primary)",
                        }}
                      >
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center p-2 rounded-md hover:bg-red-50 transition-colors ${
              sidebarOpen ? "justify-start gap-2" : "justify-center"
            }`}
            style={{ color: "var(--destructive)" }}
          >
            <LogOut
              className="w-5 h-5 shrink-0"
              style={{ color: "var(--destructive)" }}
            />
            {sidebarOpen && <span className="whitespace-nowrap">Sign Out</span>}
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-gray-50 p-8 overflow-y-auto h-screen relative z-10">
          {children}
        </main>

        <PlaidLinkManager />
      </div>
    </AlertProvider>
  );
}
