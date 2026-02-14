// src/pages/admin/Leads.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Lead = {
  _id?: string;
  name: string;
  email: string;
  source: string;
  date: string;
  status: string;
};

const Leads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_URL}/leads`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) {
        setLeads([]);
        return;
      }
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchLeads();
  }, [user]);

  const handleAddLead = async () => {
    if (!name || !email || !source) {
      setError("All fields are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ name, email, source }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to add lead.");
        return;
      }

      setName("");
      setEmail("");
      setSource("");

      fetchLeads();
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(`${API_URL}/leads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to delete lead.");
        return;
      }

      fetchLeads();
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Leads & Conversations</h1>

      <div className="bg-card border rounded-xl p-4 space-y-4">
        <h2 className="font-semibold">Add New Lead</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Source" value={source} onChange={(e) => setSource(e.target.value)} />
          <Button onClick={handleAddLead} disabled={submitting}>
            {submitting ? "Adding..." : "Add Lead"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="p-4 text-muted-foreground">No leads yet.</div>
        ) : (
          leads.map((lead) => (
            <div key={lead._id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                  {lead.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.email} — {lead.source}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{lead.date}</span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    lead.status === "New" ? "bg-info/10 text-info" :
                    lead.status === "Active" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {lead.status}
                </span>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(lead._id!)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leads;