import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import StaffBookings from "./pages/staff/StaffBookings"; // Fixed: staff not stuff
import StaffForms from "./pages/staff/StaffForms"; // Fixed: staff not stuff
import StaffLeads from "./pages/staff/StaffLeads"; // Fixed: staff not stuff
import StaffInventory from "./pages/staff/StaffInventory"; // Fixed: staff not stuff
import StaffTeam from "./pages/staff/StaffTeam"; // Fixed: staff not stuff
import GetStarted from "./pages/GetStarted";
import Login from "./pages/admin/Login";
import Signup from "./pages/admin/Signup";
import StaffLogin from "./pages/staff/StaffLogin"; // Fixed: staff not stuff
import StaffSignup from "./pages/staff/StaffSignup"; // Fixed: staff not stuff
import Onboarding from "./pages/admin/Onboarding";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import StaffDashboardLayout from "./components/dashboard/StaffDashboardLayout"; // Fixed: staff not stuff
import DashboardHome from "./pages/admin/DashboardHome";
import StaffDashboardHome from "./pages/staff/StaffDashboardHome"; // Fixed: staff not stuff

import Inbox from "./pages/admin/Inbox";
import Bookings from "./pages/admin/Bookings";
import Forms from "./pages/admin/Forms";
import Inventory from "./pages/admin/Inventory";
import Leads from "./pages/admin/Leads";
import Staff from "./pages/admin/Staff";
import AdminSettings from "./pages/admin/Settings";
import CustomerForm from "./pages/customer/CustomerForm";
import BookingPage from "./pages/customer/BookingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles = ["admin", "staff"] }: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/get-started" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === "staff") {
      return <Navigate to="/staff/dashboard" replace />;
    }
    return <Navigate to="/get-started" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Index />} />
    <Route path="/get-started" element={<GetStarted />} />
    
    {/* Admin auth */}
    <Route path="/admin/login" element={<Login />} />
    <Route path="/admin/signup" element={<Signup />} />
    
    {/* Staff auth */}
    <Route path="/staff/login" element={<StaffLogin />} />
    <Route path="/staff/signup" element={<StaffSignup />} />
    
    {/* Customer routes */}
    <Route path="/customer/form" element={<CustomerForm />} />
    <Route path="/customer/book" element={<BookingPage />} />
    
    {/* Protected routes - Admin only */}
    <Route path="/admin/onboarding" element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <Onboarding />
      </ProtectedRoute>
    } />
    
    <Route path="/admin/dashboard" element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout />
      </ProtectedRoute>
    }>
      <Route index element={<DashboardHome />} />
      <Route path="inbox" element={<Inbox />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="forms" element={<Forms />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="leads" element={<Leads />} />
      <Route path="staff" element={<Staff />} />
      <Route path="settings" element={<AdminSettings />} />
    </Route>
    
    {/* Protected routes - Staff only */}
    <Route path="/staff" element={
      <ProtectedRoute allowedRoles={["staff"]}>
        <StaffDashboardLayout />
      </ProtectedRoute>
    }>
      <Route index element={<Navigate to="/staff/dashboard" replace />} />
      <Route path="dashboard" element={<StaffDashboardHome />} />
      <Route path="inbox" element={<Inbox />} />
      <Route path="bookings" element={<StaffBookings />} />
      <Route path="forms" element={<StaffForms />} />
      <Route path="leads" element={<StaffLeads />} />
      <Route path="inventory" element={<StaffInventory />} />
      <Route path="team" element={<StaffTeam />} />
    </Route>
    
    {/* 404 route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

console.log("🔥 Frontend Loaded");

export default App;