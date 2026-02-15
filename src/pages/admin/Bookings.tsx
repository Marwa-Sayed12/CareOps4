// src/pages/admin/Bookings.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext"; // ✅ ADD THIS IMPORT
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Booking {
  _id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status?: string;
}

const Bookings = () => {
  const { user } = useAuth(); // ✅ Get user from context
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // ✅ Get token from user object, not localStorage
        const token = user?.token;
        
        if (!token) {
          console.log("No token found");
          setError("Not logged in");
          setLoading(false);
          return;
        }

        console.log("Fetching bookings with token");

        const res = await fetch(`${API_URL}/bookings`, {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Session expired - please login again");
          }
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch bookings");
        }

        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchBookings();
    } else {
      setError("Not logged in");
      setLoading(false);
    }
  }, [user]); // ✅ Re-run when user changes

  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter(b => b.date?.split("T")[0] === today);
  const upcomingBookings = bookings.filter(b => b.date?.split("T")[0] > today);

  if (loading) return <div className="p-6">Loading bookings...</div>;
  
  if (error) return (
    <div className="p-6">
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
        <p className="font-semibold">Error: {error}</p>
        <p className="text-sm mt-2">Please try logging in again.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Bookings</h1>

      {/* Today's bookings */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Today's Bookings ({todayBookings.length})
          </h3>
        </div>
        <div className="divide-y divide-border">
          {todayBookings.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No bookings today</p>
          ) : todayBookings.map(b => (
            <div key={b._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{b.customerName}</p>
                <p className="text-xs text-muted-foreground">{b.service} — {b.time || "N/A"}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs">Mark Completed</Button>
                <Button size="sm" variant="ghost" className="text-xs text-destructive">No-show</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming bookings */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Upcoming Bookings ({upcomingBookings.length})</h3>
        </div>
        <div className="divide-y divide-border">
          {upcomingBookings.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No upcoming bookings</p>
          ) : upcomingBookings.map(b => (
            <div key={b._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{b.customerName}</p>
                <p className="text-xs text-muted-foreground">{b.service} — {new Date(b.date).toLocaleDateString()} {b.time || ""}</p>
              </div>
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Confirmed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bookings;