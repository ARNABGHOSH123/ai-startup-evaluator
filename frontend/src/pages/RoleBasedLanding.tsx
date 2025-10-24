import React from "react";
import NewLanding from "./NewLanding"; // General landing
import FounderLanding from "./FounderLanding"
import InvestorLanding from "./InvestorLanding";

export default function RoleBasedLanding({ user }: { user: any }) {
  if (!user) return <NewLanding />;
  if (user.role === "Founder") return <FounderLanding user={user} />;
  if (user.role === "Investor") return <InvestorLanding user={user} />;
  return <NewLanding />;
}
