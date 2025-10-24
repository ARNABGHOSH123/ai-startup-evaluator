import { BarChart3, HomeIcon, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export function Sidebar() {
  const location = useLocation();

  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: HomeIcon,
      current: location.pathname === "/",
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      current: location.pathname === "/dashboard",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: location.pathname === "/settings",
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
            <Link key={item.name} to={item.href}>
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

          <Link to="/investor">
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
