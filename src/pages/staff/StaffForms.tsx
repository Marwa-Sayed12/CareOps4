import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

const StaffForms = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/forms", {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = await res.json();
        setForms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchForms();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-primary/10 text-primary';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'overdue': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Forms</h1>

      <div className="bg-card border rounded-xl divide-y">
        {forms.length === 0 ? (
          <p className="p-4 text-muted-foreground">No forms found</p>
        ) : (
          forms.map((form: any) => (
            <div key={form._id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(form.status)}
                <div>
                  <p className="font-medium">{form.type || 'Form'}</p>
                  <p className="text-sm text-muted-foreground">
                    Customer: {form.booking?.customerName || 'N/A'}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(form.status)}`}>
                {form.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffForms;