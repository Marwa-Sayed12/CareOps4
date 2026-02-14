import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Booking {
  _id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: string;
}

const StaffBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("API_URL/bookings", {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchBookings();
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date?.split('T')[0] === today);
  const upcomingBookings = bookings.filter(b => b.date?.split('T')[0] > today);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await fetch(`API_URL/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status })
      });
      // Refresh bookings
      const res = await fetch("API_URL/bookings", {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bookings</h1>

      {/* Today's Bookings */}
      <div className="bg-card border rounded-xl">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Today's Bookings ({todayBookings.length})
          </h3>
        </div>
        <div className="divide-y">
          {todayBookings.length === 0 ? (
            <p className="p-4 text-muted-foreground">No bookings today</p>
          ) : (
            todayBookings.map(booking => (
              <div key={booking._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{booking.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.service} at {booking.time}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-green-600"
                    onClick={() => handleStatusUpdate(booking._id, "completed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-red-600"
                    onClick={() => handleStatusUpdate(booking._id, "no-show")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    No-show
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-card border rounded-xl">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Upcoming Bookings ({upcomingBookings.length})
          </h3>
        </div>
        <div className="divide-y">
          {upcomingBookings.length === 0 ? (
            <p className="p-4 text-muted-foreground">No upcoming bookings</p>
          ) : (
            upcomingBookings.map(booking => (
              <div key={booking._id} className="p-4">
                <p className="font-medium">{booking.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.service} - {new Date(booking.date).toLocaleDateString()} at {booking.time}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffBookings;