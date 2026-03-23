import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

// Officer-equivalent roles
const OFFICER_ROLES = [
  "Officer",
  "President",
  "Vice President",
  "Treasurer",
  "Secretary",
  "Event Coordinator",
];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // 0. ALLOW PUBLIC & INTERNAL FILES
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname === "/login" ||
    pathname === "/club-creation" ||
     pathname === "/club-donation" ||
    pathname === "/update-password" ||
    pathname === "/unauthorized"
  ) {
    return NextResponse.next();
  }

  // 1. GET ACCESS TOKEN
  const cookie = request.cookies.get("accessToken");
  const accessToken = cookie?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. DECODE TOKEN
  let role;

  try {
    const decoded = jwtDecode(accessToken);

    // Expected: roles: ["Officer"] OR ["Member"] OR other officer-level roles
    const roles = decoded?.roles;

    if (!roles || roles.length === 0) {
      throw new Error("Roles missing");
    }

    // Backend sends single role
    role = roles[0];

    if (!role) {
      throw new Error("Invalid role");
    }
  } catch (err) {
    console.log("JWT decode failed:", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. LOGIN & ROOT REDIRECT BASED ON ROLE
  if (pathname === "/login" || pathname === "/") {
    if (OFFICER_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/club-officer", request.url));
    }

    if (role === "Member") {
      return NextResponse.redirect(new URL("/club-member", request.url));
    }
  }

  // 4. ROLE-BASED ACCESS CONTROL

  // Officer-only areas
  if (
    (pathname.startsWith("/club-officer") ||
      pathname.startsWith("/choose-dashboard")) &&
    !OFFICER_ROLES.includes(role)
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Member area (Member + Officer roles allowed)
  if (
    pathname.startsWith("/club-member") &&
    !["Member", ...OFFICER_ROLES].includes(role)
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // 5. ALLOW OTHER ROUTES
  return NextResponse.next();
}


/*
This middleware validates JWT roles and enforces role-based route access
by redirecting users to the correct dashboard or unauthorized page.
*/

