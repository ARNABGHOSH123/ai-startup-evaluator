import { Route, BrowserRouter, Routes } from "react-router-dom";
// import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
// import Home from "@/pages/Home";
// import RoleBasedLanding from "./pages/RoleBasedLanding";
import InvestorPortal from "@/pages/InvestorPortal";
import CompanyDetail from "@/pages/CompanyDetail";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./context/AuthContext";
import FounderPitch from "./pages/FounderPitch";
import Header from "./components/Header";
// import { Sidebar } from "./components/Sidebar";
import Landing from "./pages/Landing";
import FounderLanding from "./pages/FounderLanding";

function AppLayout({
  children,
}: // user,
// setUser,
{
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {/* {user && <Sidebar />} */}
        <main className={`flex-1 transition-all duration-300`}>{children}</main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Routes>
      <Route path="*" element={<Landing />} />
      {/* <Route path="/" element={<RoleBasedLanding user={user} />} /> */}
      <Route path="/founder/:founderId">
        <Route index element={<FounderLanding />} />
        <Route path="pitch" element={<FounderPitch />} />
      </Route>
      {/* <Route path="/home" element={<Home />} /> */}
      <Route path="/investor/:investorId" element={<InvestorPortal />} />
      <Route path="/company/:companyId" element={<CompanyDetail />} />
      <Route element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppLayout>
              <Router />
            </AppLayout>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
