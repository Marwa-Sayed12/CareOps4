// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

// Define the user type based on your backend response
interface UserType {
  _id: string;
  email: string;
  businessName: string;
  role: string;
  workspace?: string;
  token: string;
  isOnboarded?: boolean; // optional if backend tracks onboarding
}

// Define the context type
interface AuthContextType {
  user: UserType | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (form: {
    businessName: string;
    email: string;
    password: string;
    timezone: string;
    address: string;
  }) => Promise<boolean>;
  logout: () => void;
  isLoggedIn: () => boolean;
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Load user from localStorage safely
  const [user, setUser] = useState<UserType | null>(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Load onboarding status from localStorage safely
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("isOnboarded");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Define API_URL at the top of the component
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Login function
// Login function with better mobile error handling
const login = async (email: string, password: string) => {
  try {
    console.log("🚀 [DEBUG] Login started");
    console.log("📍 Origin:", window.location.origin);
    console.log("🔗 API_URL:", API_URL);
    
    // Test CORS first
    const testRes = await fetch(`${API_URL}/test-cors`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const testData = await testRes.json();
    console.log("✅ [DEBUG] CORS test passed:", testData);
    
    // Now try login
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("📡 Response status:", res.status);
    const data = await res.json();
    console.log("📡 Response data:", data);

    if (!res.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return true;
  } catch (err) {
    console.error("❌ Login failed:", err);
    return false;
  }
};

  // Signup function - FIXED
  const signup = async (form: {
    businessName: string;
    email: string;
    password: string;
    timezone: string;
    address: string;
  }) => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {  // ✅ FIXED: using API_URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Signup failed");

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));

      const onboarded = false;
      setIsOnboarded(onboarded);
      localStorage.setItem("isOnboarded", JSON.stringify(onboarded));

      return true;
    } catch (err) {
      console.error("Signup failed:", err);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsOnboarded(false);
    localStorage.removeItem("user");
    localStorage.removeItem("isOnboarded");
  };

  // Check if logged in
  const isLoggedIn = () => !!user?.token;

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isLoggedIn, isOnboarded, setIsOnboarded }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};