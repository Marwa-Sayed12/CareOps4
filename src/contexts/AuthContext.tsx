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

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      setUser(data); // update user state
      localStorage.setItem("user", JSON.stringify(data));

      const onboarded = data.isOnboarded ?? false;
      setIsOnboarded(onboarded);
      localStorage.setItem("isOnboarded", JSON.stringify(onboarded));

      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  // Signup function
  const signup = async (form: {
    businessName: string;
    email: string;
    password: string;
    timezone: string;
    address: string;
  }) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
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
