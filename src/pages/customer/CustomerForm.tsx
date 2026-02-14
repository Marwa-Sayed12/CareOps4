// src/pages/customer/CustomerForm.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const CustomerForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email) {
      alert("Name and Email are required");
      return;
    }
    
    setLoading(true);

    try {
      console.log("Submitting form...", { fullName, email, phone, message });

      const res = await fetch(`${API_URL}/leads/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          message: message || "Customer submitted a form",
          workspaceId: ""
        }),
      });

      console.log("Response received:", res);

      const data = await res.json();
      console.log("Response JSON:", data);

      if (!res.ok) throw new Error(data.message || "Form submission failed");

      setSubmitted(true);
    } catch (err) {
      console.error("Form submission error:", err);
      alert("Error submitting form. Check console.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="text-xl font-bold text-primary tracking-tight">CareOps</Link>
        </nav>
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Request Received!</h1>
            <p className="text-muted-foreground mb-6">We've received your request. Our team will contact you shortly.</p>
            <Link to="/customer/book">
              <Button variant="outline">Book an Appointment</Button>
            </Link>
          </motion.div>
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
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-1">Contact Us</h1>
          <p className="text-sm text-muted-foreground mb-8">Fill out the form below and we'll get back to you.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input 
                id="fullName"
                placeholder="Jane Smith" 
                required 
                className="mt-1.5" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="jane@email.com" 
                required 
                className="mt-1.5" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                type="tel" 
                placeholder="+1 234 567 8900" 
                className="mt-1.5" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="message">Message / Reason</Label>
              <Input 
                id="message"
                placeholder="I'd like to schedule a consultation..." 
                className="mt-1.5" 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;