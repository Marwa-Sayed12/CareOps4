import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar,
  FileText,
  Package,
  Users,
  LogOut,
  Bell,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Add this import

const StaffDashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/staff/dashboard" },
    { icon: MessageSquare, label: "Inbox", path: "/staff/inbox" },
    { icon: Calendar, label: "Bookings", path: "/staff/bookings" },
    { icon: FileText, label: "Forms", path: "/staff/forms" },
    { icon: Users, label: "Leads", path: "/staff/leads" },
    { icon: Package, label: "Inventory", path: "/staff/inventory" },
    { icon: UserCircle, label: "Team", path: "/staff/team" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/staff/dashboard" className="text-xl font-bold text-primary tracking-tight">
            CareOps
          </Link>
        </div>

        <div className="flex-1 py-6 px-3">
          <div className="mb-6 px-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">STAFF PORTAL</p>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.businessName || "Staff"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors group ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            {menuItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
          </h2>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffDashboardLayout;