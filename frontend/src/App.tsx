import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
// import { useAuth } from "@/hooks/useAuth";
// import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import InvestorPortal from "@/pages/InvestorPortal";
import CompanyDetail from "@/pages/CompanyDetail";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import {
  Home as HomeIcon,
  BarChart3,
  Settings,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import Landing from "./pages/Landing";

const user = {
  firstName: "John",
  lastName: "Doe",
  email: "abc@example.com",
};

function Header() {
  // const { user, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user?.firstName) {
      return user.firstName.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const getLastLogin = (user: any) => {
    if (user?.lastLogin) {
      const date = new Date(user.lastLogin);
      if (date.toDateString() === new Date().toDateString()) {
        return "Last login: Today";
      }
      return `Last login: ${date.toLocaleDateString()}`;
    }
    return "Last login: Today";
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mr-3 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>

            <Link href="/">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                data-testid="link-logo"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">
                    VL
                  </span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-semibold text-foreground">
                    GenaVentureStartup Capital
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Investment Platform
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              title="Toggle theme"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* User Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors"
                    data-testid="button-profile-menu"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p
                        className="text-sm font-medium text-foreground"
                        data-testid="text-user-name"
                      >
                        {getDisplayName(user)}
                      </p>
                      <p
                        className="text-xs text-muted-foreground"
                        data-testid="text-last-login"
                      >
                        {getLastLogin(user)}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem data-testid="menu-item-settings">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/api/logout")}
                    data-testid="menu-item-logout"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: HomeIcon, current: location === "/" },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      current: location === "/dashboard",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: location === "/settings",
    },
  ];

  return (
    <aside
      className="w-64 bg-card border-r border-border fixed md:static inset-y-0 z-30"
      data-testid="sidebar"
    >
      <div className="flex flex-col h-full pt-6">
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={item.current ? "default" : "ghost"}
                className="w-full justify-start"
                data-testid={`nav-item-${item.name.toLowerCase()}`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Button>
            </Link>
          ))}

          <div className="px-4 py-2 mt-8">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </h3>
          </div>

          <Link href="/investor">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              data-testid="nav-item-analytics"
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Analytics
            </Button>
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">System Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
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

function Router() {
  // const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/investor" component={InvestorPortal} />
      <Route path="/company/:company_id" component={CompanyDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
