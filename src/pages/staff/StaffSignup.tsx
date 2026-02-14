import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Users, ArrowLeft } from "lucide-react";

const StaffSignup = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteValid, setInviteValid] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Here you could validate the token with backend
    if (!token) {
      setInviteValid(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // This endpoint needs to be created
      const res = await fetch("http://localhost:5000/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email: form.email,
          password: form.password,
          name: form.name
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      // Auto login
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/staff/dashboard");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!inviteValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Invalid Invitation</h1>
          <p className="text-sm text-muted-foreground mb-6">
            No invitation token provided. Please contact your admin for a valid invite link.
          </p>
          <Button onClick={() => navigate("/staff/login")}>Go to Staff Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/" className="text-xl font-bold text-primary tracking-tight">CareOps</Link>
      </nav>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <button 
            onClick={() => navigate("/staff/login")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Complete Registration</h1>
            <p className="text-sm text-muted-foreground">
              You've been invited to join as staff
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label>Work Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Staff Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffSignup;