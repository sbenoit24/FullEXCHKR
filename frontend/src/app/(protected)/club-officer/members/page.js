import MembersHeader from "./components/MembersHeader";
import CardsContainer from "./components/CardsContainer";
import TableContainer from "./components/TableContainer";
import StripeContainer from "./components/StripeContainer";

export default function MembersPage() {
  return (
    <div className="">
      <MembersHeader />
      <CardsContainer />
      <TableContainer />
      <StripeContainer />
    </div>
  );
}
