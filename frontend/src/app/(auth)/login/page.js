"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../../services/auth/auth.service";
import Image from "next/image";
import icon from "@/assets/images/EXCHKR Golden Bull.png";
import { Eye, EyeOff, Heart, PlusCircle, KeyRound } from "lucide-react";

const OFFICER_ROLES = [
  "Officer",
  "President",
  "Vice President",
  "Treasurer",
  "Secretary",
  "Event Coordinator",
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // UI state kept
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginResponse = await authService.login(email, password);
      const { availableClubs, userId, roles } = loginResponse;

      // Cookie logic removed from here

      if (availableClubs && availableClubs.length > 0) {
        const defaultClubId = availableClubs[0].clubId;
        const user = await authService.selectClub(userId, defaultClubId);
        routeByRoles(user.roles);
      } else {
        routeByRoles(roles);
      }
    } catch (err) {
      switch (err.message) {
        case "INVALID_CREDENTIALS":
          setError("Invalid email or password.");
          break;
        case "CLUB_ACCESS_RESTRICTED":
          setError("You don’t have access to this club.");
          break;
        case "ACCOUNT_BLOCKED":
          setError("Your account has been blocked.");
          break;
        default:
          setError("Something went wrong. Please try again later.");
      }
      setLoading(false);
    }
  };

  const routeByRoles = (roles) => {
    if (roles?.some((role) => OFFICER_ROLES.includes(role))) {
      router.replace("/choose-dashboard");
    } else if (roles?.includes("Member")) {
      router.replace("/club-member");
    } else {
      router.replace("/");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--brand-navy)" }}
    >
      <div className="w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        {/* Upper Part */}
        <div
          className="flex flex-col items-center justify-center p-8"
          style={{ backgroundColor: "var(--primary)", height: "180px" }}
        >
          <Image
            src={icon}
            alt="Logo"
            width={48}
            height={48}
            className="mb-2"
          />
          <h1
            className="text-3xl font-bold mb-3"
            style={{
              color: "var(--accent)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            EXCHKR
          </h1>
          <p
            className="text-xl font-normal mb-2 text-center"
            style={{
              color: "var(--brand-white)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Welcome back!
          </p>

          <p className="text-sm font-normal text-[#B8DFFF]">
            Sign in to your organization's financial hub
          </p>
        </div>

        {/* Bottom Part */}
        <div className="p-8" style={{ backgroundColor: "var(--brand-white)" }}>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div
                className="p-4 rounded-lg animate-slide-in"
                style={{
                  backgroundColor: "var(--btn-destructive-bg)",
                  border: "1px solid rgba(251,44,54,0.5)",
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color: "var(--btn-destructive-text)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {error}
                </p>
              </div>
            )}

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full px-3 py-3 border rounded-lg transition-all focus:ring-2 focus:border-transparent outline-none"
                style={{
                  backgroundColor: "var(--space-0-5)",
                  color: "var(--text-primary)",
                  borderColor: "rgba(18,43,91,0.2)",
                  fontFamily: "var(--font-sans)",
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-3 pr-12 py-3 border rounded-lg transition-all focus:ring-2 focus:border-transparent outline-none"
                  style={{
                    backgroundColor: "var(--space-0-5)",
                    color: "var(--text-primary)",
                    borderColor: "rgba(18,43,91,0.2)",
                    fontFamily: "var(--font-sans)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* UI Only: Remember Me */}
            {/* <div className="flex justify-items-start items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#122B5B] cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 text-sm font-medium cursor-pointer select-none"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Remember me
              </label>
            </div> */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium transition-all shadow-lg flex items-center justify-center"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--brand-white)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          {/* Donate Section */}

          <div className="mt-6 flex justify-center gap-6">
            {/* Donate */}
            <button
              onClick={() => router.push("/club-donation")}
              className="flex items-center gap-2 transition-opacity hover:opacity-80 group"
              style={{
                color: "var(--primary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <Heart
                size={18}
                className="transition-all duration-300 group-hover:text-red-500 group-hover:fill-red-500"
              />
              <span className="font-semibold text-sm">Donate</span>
            </button>

            {/* Create Club */}
            <button
              onClick={() => router.push("/club-creation")}
              className="flex items-center gap-2 transition-opacity hover:opacity-80 group"
              style={{
                color: "var(--primary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <PlusCircle
                size={18}
                className="transition-all duration-300 group-hover:text-green-500"
              />
              <span className="font-semibold text-sm">Create Club</span>
            </button>

            {/* Update Password */}
            <button
              onClick={() => router.push("/update-password")}
              className="flex items-center gap-2 transition-opacity hover:opacity-80 group"
              style={{
                color: "var(--primary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <KeyRound
                size={18}
                className="transition-all duration-300 group-hover:text-yellow-500"
              />
              <span className="font-semibold text-sm">Update Password</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
