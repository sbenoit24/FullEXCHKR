import DashboardHeader from "./components/DashboardHeader";
import CardsContainer from "./components/CardsContainer";
import PendingActions from "./components/PendingActions";
import RecentActivity from "./components/RecentActivity";
import { officerService } from "@/services/officer/officer.service";

export default function DashboardPage() {
  return (
    <div className="">
      <DashboardHeader />
      <CardsContainer />
      <PendingActions />
      <RecentActivity />
    </div>
  );
}
