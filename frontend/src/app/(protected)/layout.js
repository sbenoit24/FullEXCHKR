import UserProvider from "@/providers/UserProvider";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");

  // If no token → login. 
  if (!accessToken) {
    redirect("/login");
  }

  // Wrap children with polling updater
  return <UserProvider>{children}</UserProvider>;
}
