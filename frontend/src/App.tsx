import { Route, BrowserRouter, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "@/pages/Home";
import RoleBasedLanding from "./pages/RoleBasedLanding";
import InvestorPortal from "@/pages/InvestorPortal";
import CompanyDetail from "@/pages/CompanyDetail";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import FounderPitch from "./pages/FounderPitch";
import Header from "./components/Header";
import { Sidebar } from "./components/Sidebar";

function AppLayout({
  children,
  user,
  setUser,
}: {
  children: React.ReactNode;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header user={user} setUser={setUser} />
      <div className="flex">
        {user && <Sidebar />}
        <main
          className={`flex-1 ${
            user ? "md:ml-0" : ""
          } transition-all duration-300`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function Router({ user }: { user: any }) {
  return (
    <Routes>
      <Route path="/" element={<RoleBasedLanding user={user} />} />
      <Route path="/pitch/:founderName" element={<FounderPitch />} />
      <Route path="/home" element={<Home />} />
      <Route path="/investor" element={<InvestorPortal />} />
      <Route path="/company/:company_id" element={<CompanyDetail />} />
      <Route element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState(null);
  return (
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppLayout user={user} setUser={setUser}>
              <Router user={user} />
            </AppLayout>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
