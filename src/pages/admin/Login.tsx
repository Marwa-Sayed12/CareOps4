import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Coffee } from "lucide-react"; // Coffee icon for cozy feel

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isServerError, setIsServerError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsServerError(false);
    
    const success = await login(email, password);
    
    if (success) {
      navigate("/admin/dashboard");
    } else {
      // Check if it's a network/server error
      const lastError = localStorage.getItem("lastLoginError");
      if (lastError && lastError.includes("Failed to fetch")) {
        setIsServerError(true);
        setError("Unable to connect to server. Please try again in a few moments.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/" className="text-xl font-bold text-primary tracking-tight">CareOps</Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8">Sign in to your workspace</p>
          
          {/* Friendly Free Tier Message */}
          {isServerError && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Coffee className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Taking a quick nap 😴</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Our server is on a free tier and goes to sleep when inactive. 
                    We're working to wake it up!
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    <span className="font-medium">🔄 Please refresh the page in 30-60 seconds</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-3">
                    We're upgrading soon so this won't happen again! 🚀
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Regular Error Message */}
          {error && !isServerError && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                disabled={isServerError}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                disabled={isServerError}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isServerError}
            >
              {isServerError ? "Server is waking up..." : "Sign In"}
            </Button>
          </form>

          <p className="text-sm text-center mt-6 text-muted-foreground">
            Don't have an account? <Link to="/admin/signup" className="text-primary hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;