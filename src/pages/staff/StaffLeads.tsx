// src/pages/staff/StaffLeads.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Calendar } from "lucide-react";

type Lead = {
  _id: string;
  name: string;
  email: string;
  source: string;
  createdAt: string;
  status: string;
};

const StaffLeads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch(`${API_URL}/leads`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchLeads();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Leads</h1>
      <p className="text-sm text-muted-foreground">View only - Contact admin to add new leads</p>

      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="p-4 text-muted-foreground">No leads yet.</div>
        ) : (
          leads.map((lead) => (
            <div key={lead._id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{lead.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {lead.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                lead.status === "New" ? "bg-info/10 text-info" :
                lead.status === "Active" ? "bg-primary/10 text-primary" :
                "bg-muted text-muted-foreground"
              }`}>
                {lead.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffLeads;