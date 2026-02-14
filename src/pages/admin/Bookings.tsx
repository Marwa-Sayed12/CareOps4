// src/pages/admin/Bookings.tsx
import { useEffect, useState } from "react";
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not logged in");

        const res = await fetch("http://localhost:5000/api/bookings", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch bookings");
        }

        const data = await res.json();
        setBookings(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter(b => b.date?.split("T")[0] === today);
  const upcomingBookings = bookings.filter(b => b.date?.split("T")[0] > today);

  if (loading) return <div className="p-6">Loading bookings...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Bookings</h1>

      {/* Today's bookings */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Today's Bookings
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
          <h3 className="font-semibold text-foreground">Upcoming Bookings</h3>
        </div>
        <div className="divide-y divide-border">
          {upcomingBookings.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No upcoming bookings</p>
          ) : upcomingBookings.map(b => (
            <div key={b._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{b.customerName}</p>
                <p className="text-xs text-muted-foreground">{b.service} — {b.time || "N/A"}</p>
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
