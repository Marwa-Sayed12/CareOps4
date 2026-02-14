// src/pages/staff/StaffTeam.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Mail, User } from "lucide-react";

interface StaffMember {
  _id: string;
  email: string;
  businessName: string;
  role: string;
  permissions: {
    inbox: boolean;
    bookings: boolean;
    forms: boolean;
    inventory: boolean;
  };
}

const StaffTeam = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(`${API_URL}/users/staff`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        setStaff(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchStaff();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
      <p className="text-sm text-muted-foreground">View team members and their permissions</p>

      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : staff.length === 0 ? (
          <div className="p-4 text-muted-foreground">No team members yet.</div>
        ) : (
          staff.map((member) => (
            <div key={member._id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.businessName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {member.email}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-muted rounded-full">
                  {member.role}
                </span>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {member.permissions?.inbox && (
                  <span className="text-xs bg-info/10 text-info px-2 py-1 rounded-full">Inbox</span>
                )}
                {member.permissions?.bookings && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Bookings</span>
                )}
                {member.permissions?.forms && (
                  <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">Forms</span>
                )}
                {member.permissions?.inventory && (
                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">Inventory</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffTeam;