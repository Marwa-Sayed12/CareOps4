import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const AdminSettings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Business Information</h3>
        <div><Label>Business Name</Label><Input defaultValue={user?.businessName || "Sunshine Clinic"} className="mt-1.5" /></div>
        <div><Label>Contact Email</Label><Input defaultValue={user?.email} className="mt-1.5" /></div>
        <div><Label>Address</Label><Input defaultValue="123 Main St, Springfield" className="mt-1.5" /></div>
        <div><Label>Time Zone</Label><Input defaultValue="America/New_York" className="mt-1.5" /></div>
        <Button>Save Changes</Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Communication Channels</h3>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <span className="text-sm text-foreground">Email (IMAP/SMTP)</span>
          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Connected</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <span className="text-sm text-foreground">SMS (Twilio)</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Not Connected</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Booking Settings</h3>
        <div><Label>Default Service Duration</Label><Input defaultValue="30 minutes" className="mt-1.5" /></div>
        <div><Label>Booking Link</Label><Input defaultValue="careops.com/customer/book" readOnly className="mt-1.5 bg-muted" /></div>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

export default AdminSettings;
