import FinanceHeader from "./components/FinanceHeader";
import CardsContainer from "./components/CardsContainer";
import ConnectBank from "./components/ConnectBank";
import TabsWrapper from "./components/TabsWrapper";

export default function FinancePage() {
  return (
    <div className="">
      <FinanceHeader />
      <CardsContainer />
      <TabsWrapper />
      <ConnectBank />
    </div>
  );
}
