import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Signup = () => {
  const [form, setForm] = useState({
    businessName: "",
    email: "",
    password: "",
    timezone: "",
    address: ""
  });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signup(form);
    if (success) navigate("/admin/onboarding");
    else alert("Signup failed");
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/" className="text-xl font-bold text-primary tracking-tight">CareOps</Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-foreground mb-1">Create your workspace</h1>
          <p className="text-sm text-muted-foreground mb-8">Set up your business on CareOps</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Business Name</Label>
              <Input value={form.businessName} onChange={e => update("businessName", e.target.value)} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={e => update("password", e.target.value)} required />
            </div>
            <div>
              <Label>Time Zone</Label>
              <Input value={form.timezone} onChange={e => update("timezone", e.target.value)} required />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={e => update("address", e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Create Workspace</Button>
          </form>
          <p className="text-sm text-center mt-6 text-muted-foreground">
            Already have an account? <Link to="/admin/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
