import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Users, Mail } from "lucide-react";

const StaffLogin = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(!!token); // Show signup if token exists
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // If token exists, redirect to signup
  useEffect(() => {
    if (token) {
      navigate(`/staff/signup?token=${token}`);
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.role === "staff") {
          navigate("/staff/dashboard");
        } else {
          setError("This login is for staff only. Please use the admin login.");
        }
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/" className="text-xl font-bold text-primary tracking-tight">CareOps</Link>
      </nav>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Staff Login</h1>
            <p className="text-sm text-muted-foreground">
              Access your daily tasks and communications
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in as Staff"}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            {/* Link to signup page */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                New staff member?{" "}
                <Link to="/staff/signup" className="text-primary hover:underline font-medium">
                  Create an account
                </Link>
              </p>
            </div>

            {/* Info box about invites */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">
                    Need an invitation?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Staff accounts can only be created through an invitation from your business owner.
                    <Link to="/get-started" className="text-primary hover:underline block mt-1">
                      Contact your admin →
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="text-center">
              <Link to="/staff/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;