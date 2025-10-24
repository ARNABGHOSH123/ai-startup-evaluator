import { Switch, Route, Link, useLocation } from "wouter";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth0 } from "@auth0/auth0-react";
import Home from "@/pages/Home";
import RoleBasedLanding from "./pages/RoleBasedLanding";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTheme } from "@/components/ThemeProvider";
import {
  Home as HomeIcon,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import NewLanding from "./pages/NewLanding";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import FounderPitch from "./pages/FounderPitch";
// import Landing from "./pages/Landing";

function Header({
  user,
  setUser,
}: {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}) {
  // const { user, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false); // for main modal
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [signUpDialogOpen, setSignUpDialogOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  // const handleLogin = (role: string) => {
  //   console.log(`Logging in as ${role}`);
  //   setOpen(false);
  // };
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

            {/* Initial Landing for register or login*/}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-1 p-2 rounded-md hover:bg-accent transition-colors"
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    size="sm"
                    className="bg-white text-blue-500 border-blue-500 border-2"
                    onClick={() => {
                      setUser(null);
                      navigate("/");
                    }}
                  >
                    Logout
                  </Button>{" "}
                </>
              ) : (
                <>
                  <div className="relative">
                    {/* Non-blocking dropdown for role selection */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-white text-blue-500 border-blue-500 border-2"
                        >
                          Login
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-60">
                        {["Pitch as Founder", "Fund as Investor"].map(
                          (label, i) => (
                            <DropdownMenuItem
                              key={i}
                              onClick={() => {
                                setSelectedRole(label);
                                setRoleDialogOpen(true);
                              }}
                            >
                              {label}
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Center modal for login */}
                    {/* Center modal for login */}
                    <Dialog
                      open={roleDialogOpen}
                      onOpenChange={setRoleDialogOpen}
                    >
                      <DialogContent className="sm:max-w-md rounded-xl">
                        <DialogHeader>
                          <DialogTitle>{selectedRole || "Login"}</DialogTitle>
                          <DialogDescription>
                            {showForgotPassword
                              ? "Reset your password by entering your registered email address."
                              : "Sign in using your email and password, or continue with Google."}
                          </DialogDescription>
                        </DialogHeader>

                        {!showForgotPassword ? (
                          <>
                            {/* Email + Password Login */}
                            <form
                              className="flex flex-col gap-3 mt-4"
                              onSubmit={(e) => {
                                e.preventDefault();
                                const email = (
                                  e.currentTarget.elements.namedItem(
                                    "email"
                                  ) as HTMLInputElement
                                ).value;
                                const password = (
                                  e.currentTarget.elements.namedItem(
                                    "password"
                                  ) as HTMLInputElement
                                ).value;
                                console.log("Logging in with:", {
                                  role: selectedRole,
                                  email,
                                  password,
                                });

                                // Fake API logic:
                                const accountExists = false; // TODO: Replace with actual API call to check

                                if (!accountExists) {
                                  alert(
                                    "Account not found. Please create one."
                                  );
                                  setRoleDialogOpen(false);
                                  setSignUpDialogOpen(true);
                                  return;
                                }

                                // ✅ Successful login:
                                setUser({
                                  email,
                                  role: selectedRole,
                                  password,
                                });

                                setRoleDialogOpen(false);
                              }}
                            >
                              <input
                                type="email"
                                name="email"
                                required
                                placeholder="Email address"
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="password"
                                name="password"
                                required
                                placeholder="Password"
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />

                              <div className="flex justify-between items-center text-xs">
                                <button
                                  type="button"
                                  className="text-blue-600 hover:underline"
                                  onClick={() => setShowForgotPassword(true)}
                                >
                                  Forgot password?
                                </button>

                                {/* ✅ Switch to Sign Up */}
                                <button
                                  type="button"
                                  className="text-blue-600 hover:underline"
                                  onClick={() => {
                                    setRoleDialogOpen(false);
                                    setSignUpDialogOpen(true);
                                  }}
                                >
                                  Create account
                                </button>
                              </div>

                              <Button
                                type="submit"
                                size="sm"
                                className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-2"
                              >
                                Sign In
                              </Button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center my-3">
                              <div className="flex-grow h-px bg-gray-200" />
                              <span className="px-2 text-xs text-gray-400 uppercase">
                                or
                              </span>
                              <div className="flex-grow h-px bg-gray-200" />
                            </div>

                            {/* Google Login */}
                            <div className="flex justify-center">
                              <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                  const decoded = jwtDecode(
                                    credentialResponse.credential!
                                  );
                                  console.log("Google Login Success:", decoded);
                                  setRoleDialogOpen(false);
                                }}
                                onError={() =>
                                  console.log("Google Login Failed")
                                }
                              />
                            </div>
                          </>
                        ) : (
                          /* Forgot Password View */
                          <form
                            className="flex flex-col gap-3 mt-4"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const email = (
                                e.currentTarget.elements.namedItem(
                                  "resetEmail"
                                ) as HTMLInputElement
                              ).value;
                              console.log("Sending reset link to:", email);
                              // TODO: call password reset API
                              alert(`Password reset link sent to ${email}`);
                              setShowForgotPassword(false);
                            }}
                          >
                            <input
                              type="email"
                              name="resetEmail"
                              required
                              placeholder="Registered email address"
                              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <Button
                              type="submit"
                              size="sm"
                              className="w-full bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Send Reset Link
                            </Button>

                            <button
                              type="button"
                              className="text-xs text-gray-600 hover:underline mt-1"
                              onClick={() => setShowForgotPassword(false)}
                            >
                              Back to Login
                            </button>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                      onClick={() => setSignUpDialogOpen(true)}
                    >
                      Sign Up
                    </Button>

                    {/* Sign Up Dialog */}
                    {/* Signup Modal */}
                    <Dialog
                      open={signUpDialogOpen}
                      onOpenChange={setSignUpDialogOpen}
                    >
                      <DialogContent className="sm:max-w-md rounded-xl">
                        <DialogHeader>
                          <DialogTitle>Sign Up</DialogTitle>
                          <DialogDescription>
                            Create your account to access the platform.
                          </DialogDescription>
                        </DialogHeader>

                        <form
                          className="flex flex-col gap-3 mt-4"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const firstName = (
                              e.currentTarget.elements.namedItem(
                                "firstName"
                              ) as HTMLInputElement
                            ).value;
                            const lastName = (
                              e.currentTarget.elements.namedItem(
                                "lastName"
                              ) as HTMLInputElement
                            ).value;
                            const email = (
                              e.currentTarget.elements.namedItem(
                                "email"
                              ) as HTMLInputElement
                            ).value;
                            const password = (
                              e.currentTarget.elements.namedItem(
                                "password"
                              ) as HTMLInputElement
                            ).value;
                            const role = (
                              e.currentTarget.elements.namedItem(
                                "role"
                              ) as HTMLSelectElement
                            ).value;

                            console.log("Signing up:", {
                              firstName,
                              lastName,
                              email,
                              password,
                              role,
                            });

                            // ✅ Update user state after signup (or after API call)
                            setUser({ firstName, lastName, email, role });

                            // TODO: Replace with your real signup API call
                            setSignUpDialogOpen(false);
                          }}
                        >
                          <input
                            type="text"
                            name="firstName"
                            required
                            placeholder="First Name"
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            name="lastName"
                            required
                            placeholder="Last Name"
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="Email address"
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="password"
                            name="password"
                            required
                            placeholder="Password"
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />

                          <select
                            name="role"
                            required
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Role</option>
                            <option value="Founder">Founder</option>
                            <option value="Investor">Investor</option>
                          </select>

                          <Button
                            type="submit"
                            size="sm"
                            className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-2"
                          >
                            Sign Up
                          </Button>
                        </form>

                        {/* ✅ "Already have an account?" link */}
                        <div className="text-center mt-3 text-sm text-gray-600">
                          Already have an account?{" "}
                          <button
                            type="button"
                            className="text-blue-600 hover:underline"
                            onClick={() => {
                              // Close Sign Up dialog
                              setSignUpDialogOpen(false);
                              // Open existing Login dialog
                              setRoleDialogOpen(true);
                              // Optionally set a default login role
                              setSelectedRole("Login");
                            }}
                          >
                            Login
                          </button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </div>
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
    <Switch>
      <Route path="/">
        <RoleBasedLanding user={user} />
      </Route>
      <Route path="/pitch/:founderName" component={FounderPitch} />
      <Route path="/home" component={Home} />
      <Route path="/investor" component={InvestorPortal} />
      <Route path="/company/:company_id" component={CompanyDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState(null);
  return (
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <AppLayout user={user} setUser={setUser}>
            <Router user={user}/>
          </AppLayout>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
