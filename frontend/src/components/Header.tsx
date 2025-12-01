import { Link } from "react-router-dom";
import { Settings, Sun, Moon, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false); // for main modal
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [signUpDialogOpen, setSignUpDialogOpen] = useState(false);
  const navigate = useNavigate();

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;

  const getInitials = (user: any) => {
    if (user?.founderName) return user?.founderName[0]?.toUpperCase();
    if (user?.investorName) return user?.investorName[0]?.toUpperCase();
    if (user?.founderEmail || user?.investorEmail) {
      return (user.founderEmail || user.investorEmail)
        .slice(0, 2)
        .toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (user: any) => {
    if (user?.founderName)
      return user?.founderName?.replace(/\b\w/g, (c: string) =>
        c.toUpperCase()
      );
    if (user?.investorName)
      return user?.investorName?.replace(/\b\w/g, (c: string) =>
        c.toUpperCase()
      );
    if (user?.founderEmail || user?.investorEmail) {
      return (user.founderEmail || user.investorEmail).split("@")[0];
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

            <Link to="/">
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
              className="p-2 rounded-md hover:bg-accent transition-colors text-primary"
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
                      navigate("/");
                      localStorage.removeItem("user");
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
                    <LoginModal
                      isOpen={roleDialogOpen}
                      onChange={setRoleDialogOpen}
                      selectedRole={selectedRole}
                      showForgotPassword={showForgotPassword}
                      setShowForgotPassword={setShowForgotPassword}
                      setSignUpDialogOpen={setSignUpDialogOpen}
                      setRoleDialogOpen={setRoleDialogOpen}
                    />

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
                    <SignupModal
                      isOpen={signUpDialogOpen}
                      onChange={setSignUpDialogOpen}
                      setRoleDialogOpen={setRoleDialogOpen}
                      setSelectedRole={setSelectedRole}
                      setSignUpDialogOpen={setSignUpDialogOpen}
                    />
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
