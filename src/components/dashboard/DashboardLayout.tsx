import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, MessageSquare, Calendar, FileText, Package, Users, Settings, LogOut, Bell, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Inbox", icon: MessageSquare, path: "/admin/dashboard/inbox" },
  { label: "Bookings", icon: Calendar, path: "/admin/dashboard/bookings" },
  { label: "Forms", icon: FileText, path: "/admin/dashboard/forms" },
  { label: "Inventory", icon: Package, path: "/admin/dashboard/inventory" },
  { label: "Leads", icon: Users, path: "/admin/dashboard/leads" },
  { label: "Staff", icon: Users, path: "/admin/dashboard/staff" },
  { label: "Settings", icon: Settings, path: "/admin/dashboard/settings" },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-60"} bg-card border-r border-border flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && <span className="text-lg font-bold text-primary">CareOps</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            const btn = (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : btn;
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={() => { logout(); navigate("/"); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full">
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <h2 className="text-lg font-semibold text-foreground">
            {navItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
          </h2>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" title="Notifications">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setShowAI(!showAI)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>AI Assistant</TooltipContent>
            </Tooltip>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
              {user?.email?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* AI Modal */}
        {showAI && (
          <div className="absolute top-20 right-6 z-50 w-80 bg-card border border-border rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">AI Assistant</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">AI features are limited in free trial. More coming soon.</p>
            <Button variant="outline" size="sm" onClick={() => setShowAI(false)} className="w-full">Close</Button>
          </div>
        )}

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
