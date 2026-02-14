// src/pages/admin/Forms.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "text-warning bg-warning/10" },
  overdue: { label: "Overdue", icon: AlertCircle, color: "text-destructive bg-destructive/10" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-primary bg-primary/10" },
};

const tabs = ["All", "Pending", "Overdue", "Completed"] as const;

const Forms = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<any[]>([]);
  const [tab, setTab] = useState<string>("All");
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!user?.workspace || !user?.token) return;

    fetch(`${API_URL}/forms`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setForms(data);
        else setForms([]);
      })
      .catch(err => console.error(err));
  }, [user]);

  const filtered = tab === "All" ? forms : forms.filter(f => f.status.toLowerCase() === tab.toLowerCase());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Forms</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t} {t !== "All" && `(${forms.filter(f => f.status.toLowerCase() === t.toLowerCase()).length})`}
          </button>
        ))}
      </div>

      {/* Forms list */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No forms yet</p>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {filtered.map(form => {
            const cfg = statusConfig[form.status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;

            return (
              <div key={form._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{form.type}</p>
                    <p className="text-xs text-muted-foreground">
                      Booking ID: {form.booking} — Workspace: {form.workspace}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Forms;