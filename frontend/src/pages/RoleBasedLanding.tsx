import Landing from "./Landing"; // General landing
import FounderLanding from "./FounderLanding";
import InvestorPortal from "./InvestorPortal";

export default function RoleBasedLanding({ user }: { user: any }) {
  if (!user) return <Landing />;
  if (user.role === "Founder") return <FounderLanding user={user} />;
  if (user.role === "Investor") return <InvestorPortal />;
  return <Landing />;
}
