"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function UserProvider({ children }) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-data`,
          { credentials: "include" }
        );

        if (res.status === 401) {
          setUser(null);
          router.replace("/login");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data) setUser(data);
        }
      } catch {
        console.error("User fetch failed (network / cold start)");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setUser, router]);

  // Prevent rendering children until user fetch is done
  if (loading) return null;

  return children;
}


/*
This provider fetches the logged-in user on app load, stores it in the auth store,
and redirects to login if the session is invalid.
*/