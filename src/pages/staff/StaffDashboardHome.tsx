// src/pages/staff/StaffDashboardHome.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  Package,
  Clock,
  ArrowRight 
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface StaffStats {
  todayBookings: number;
  unreadMessages: number;
  pendingForms: number;
  lowStockItems: number;
  newLeads: number;
  recentActivity: Array<{
    text: string;
    time: string;
    type: string;
  }>;
}

const StaffDashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StaffStats>({
    todayBookings: 0,
    unreadMessages: 0,
    pendingForms: 0,
    lowStockItems: 0,
    newLeads: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchStaffDashboard = async () => {
      try {
        const res = await fetch(`${API_URL}/staff/dashboard`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch staff dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-2"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.businessName?.split(' ')[0] || 'Staff'}! 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's your task list for today
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <Calendar className="h-5 w-5 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{stats.todayBookings}</p>
          <p className="text-xs text-muted-foreground mt-1">Today's Bookings</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <MessageSquare className="h-5 w-5 text-info mb-3" />
          <p className="text-2xl font-bold text-foreground">{stats.unreadMessages}</p>
          <p className="text-xs text-muted-foreground mt-1">Unread Messages</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <FileText className="h-5 w-5 text-warning mb-3" />
          <p className="text-2xl font-bold text-foreground">{stats.pendingForms}</p>
          <p className="text-xs text-muted-foreground mt-1">Pending Forms</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <Package className="h-5 w-5 text-destructive mb-3" />
          <p className="text-2xl font-bold text-foreground">{stats.lowStockItems}</p>
          <p className="text-xs text-muted-foreground mt-1">Low Stock Alerts</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Activity
        </h3>
        
        {stats.recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {stats.recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  item.type === 'message' ? 'bg-info' : 
                  item.type === 'booking' ? 'bg-primary' : 
                  item.type === 'form' ? 'bg-warning' : 'bg-destructive'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Link to="/staff/inbox">
          <Button variant="outline" className="w-full justify-between">
            Go to Inbox
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/staff/bookings">
          <Button variant="outline" className="w-full justify-between">
            View Bookings
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/staff/forms">
          <Button variant="outline" className="w-full justify-between">
            Check Forms
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StaffDashboardHome;
