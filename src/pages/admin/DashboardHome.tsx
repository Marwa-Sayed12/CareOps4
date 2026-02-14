import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Mail,
  Phone,
  RefreshCw
} from "lucide-react";

interface DashboardData {
  stats: {
    todaysBookings: number;
    totalBookings: number;
    unreadMessages: number;
    pendingForms: number;
    lowStock: number;
    totalLeads: number;
    totalContacts: number;
  };
  recentActivity: Array<{
    text: string;
    time: string;
    type: string;
  }>;
}

const DashboardHome = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const fetchDashboard = async () => {
    if (!user?.token) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching dashboard data...");
      const res = await fetch("http://localhost:5000/api/dashboard/overview", {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      
      const responseData = await res.json();
      console.log("Dashboard data received:", responseData);
      
      // Ensure the data has the expected structure
      if (!responseData || typeof responseData !== 'object') {
        throw new Error("Invalid data format received");
      }

      // Set default values for missing data
      const formattedData: DashboardData = {
        stats: {
          todaysBookings: responseData.stats?.todaysBookings ?? 0,
          totalBookings: responseData.stats?.totalBookings ?? 0,
          unreadMessages: responseData.stats?.unreadMessages ?? 0,
          pendingForms: responseData.stats?.pendingForms ?? 0,
          lowStock: responseData.stats?.lowStock ?? 0,
          totalLeads: responseData.stats?.totalLeads ?? 0,
          totalContacts: responseData.stats?.totalContacts ?? 0,
        },
        recentActivity: Array.isArray(responseData.recentActivity) 
          ? responseData.recentActivity 
          : []
      };
      
      setData(formattedData);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError(error instanceof Error ? error.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const handleRetry = () => {
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting}! 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading your dashboard...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-5 w-5 bg-muted rounded mb-3"></div>
              <div className="h-8 w-16 bg-muted rounded mb-2"></div>
              <div className="h-3 w-24 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting}! 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening today.</p>
        </div>
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg border border-destructive/20">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">Failed to load dashboard</h3>
          </div>
          <p className="text-sm mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="flex items-center gap-2 text-sm bg-destructive/20 hover:bg-destructive/30 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Welcome! 👋</h1>
        <div className="bg-muted p-6 rounded-lg">
          <p className="text-muted-foreground">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: "Today's Bookings", 
      value: data.stats.todaysBookings.toString(), 
      icon: Calendar, 
      change: data.stats.todaysBookings > 0 ? `${data.stats.todaysBookings} today` : "No bookings yet",
      color: "text-primary"
    },
    { 
      label: "Unread Messages", 
      value: data.stats.unreadMessages.toString(), 
      icon: MessageSquare, 
      change: data.stats.unreadMessages > 0 ? "Need attention" : "All caught up",
      color: "text-info"
    },
    { 
      label: "Pending Forms", 
      value: data.stats.pendingForms.toString(), 
      icon: FileText, 
      change: data.stats.pendingForms > 0 ? "Awaiting completion" : "No pending forms",
      color: "text-warning"
    },
    { 
      label: "Low Stock Items", 
      value: data.stats.lowStock.toString(), 
      icon: Package, 
      change: data.stats.lowStock > 0 ? "Action needed" : "All stocked",
      color: "text-destructive",
      alert: data.stats.lowStock > 0
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting}! 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening today.</p>
        </div>
        <button 
          onClick={handleRetry}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              {stat.alert && <AlertTriangle className="h-4 w-4 text-warning" />}
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </h3>
          {data.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    item.type === "alert" ? "bg-warning" : 
                    item.type === "message" ? "bg-info" : 
                    item.type === "booking" ? "bg-primary" :
                    item.type === "lead" ? "bg-success" : "bg-muted"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                  {item.type === "alert" && (
                    <AlertTriangle className="h-3 w-3 text-warning flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Bookings</p>
              <p className="text-lg font-semibold text-foreground">{data.stats.totalBookings}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Leads</p>
              <p className="text-lg font-semibold text-foreground">{data.stats.totalLeads}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Contacts</p>
              <p className="text-lg font-semibold text-foreground">{data.stats.totalContacts}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Quick Actions
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">New Contact Form</p>
                <p className="text-xs text-muted-foreground mt-0.5">→ Auto-reply enabled</p>
              </div>
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Booking Reminders</p>
                <p className="text-xs text-muted-foreground mt-0.5">→ 24h before</p>
              </div>
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </span>
            </div>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-3">ACTIONS</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="text-xs bg-muted/50 hover:bg-muted text-foreground p-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Mail className="h-3 w-3" />
                New Message
              </button>
              <button className="text-xs bg-muted/50 hover:bg-muted text-foreground p-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                Add Booking
              </button>
              <button className="text-xs bg-muted/50 hover:bg-muted text-foreground p-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Users className="h-3 w-3" />
                New Lead
              </button>
              <button className="text-xs bg-muted/50 hover:bg-muted text-foreground p-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Phone className="h-3 w-3" />
                Call
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="text-xs text-muted-foreground text-right">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default DashboardHome;