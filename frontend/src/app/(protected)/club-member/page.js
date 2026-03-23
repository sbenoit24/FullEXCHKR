import { redirect } from "next/navigation";

export default function ClubOfficerIndex() {
  // Redirect to dashboard (URL hides the (protected) folder)
  redirect("/club-member/payments");
}
