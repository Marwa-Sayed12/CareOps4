// src/pages/staff/StaffInvite.tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Copy, CheckCircle } from "lucide-react";

const StaffInvite = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState({
    inbox: true,
    bookings: false,
    forms: false,
    inventory: false,
    customers: false,
    reports: false
  });
  const [loading, setLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInviteSent(false);

    try {
      const res = await fetch(`${API_URL}/staff/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ email, permissions })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send invite");
      }

      const link = `${window.location.origin}/staff-signup?token=${data.invite?.token || 'demo-token'}`;
      setInviteLink(link);
      setInviteSent(true);
      setEmail("");

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Invite Staff Member</h2>
        <p className="text-sm text-muted-foreground">
          Send an invitation email to add a new staff member to your workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
          />
        </div>

        <div>
          <Label className="mb-2 block">Permissions</Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(permissions).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, [key]: checked === true }))
                  }
                />
                <label
                  htmlFor={key}
                  className="text-sm capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {key}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send Invitation"}
        </Button>
      </form>

      {inviteSent && (
        <div className="mt-4 p-4 bg-primary/10 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Mail className="h-4 w-4" />
            <span className="text-sm font-medium">Invitation Sent!</span>
          </div>
          
          {inviteLink && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Development Mode - Share this link:
              </p>
              <div className="flex gap-2">
                <code className="flex-1 p-2 bg-background rounded text-xs break-all">
                  {inviteLink}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffInvite;