// src/pages/admin/Onboarding.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Package,
  Users,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const stepTitles = [
  "Create Workspace",
  "Communication Setup",
  "Contact Form",
  "Booking Setup",
  "Post-Booking Forms",
  "Inventory Setup",
  "Add Staff",
  "Activate Workspace",
];

const stepIcons = [
  Zap,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Package,
  Users,
  CheckCircle2,
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const { setIsOnboarded, user } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [workspace, setWorkspace] = useState({
    businessName: "",
    address: "",
    timezone: "",
    contactEmail: "",
  });

  const [communication, setCommunication] = useState({
    emailConnected: true,
    smsConnected: false,
  });

  const [contactForm, setContactForm] = useState({
    fullName: "",
    emailOrPhone: "",
    message: "",
  });

  const [booking, setBooking] = useState({
    serviceName: "",
    duration: 30,
    availableDays: "",
    timeSlots: "",
    location: "",
  });

  const [inventoryList, setInventoryList] = useState([
    { name: "", qty: 0, threshold: 0, unit:""},
  ]);

  const [staffData, setStaffData] = useState<{ email: string; permissions: string[] }[]>([
    { email: "", permissions: [] },
  ]);

  const saveStep = async () => {
    let url = "";
    let body: any = {};

    switch (step) {
      case 0:
        url = `${API_URL}/workspace`;
        body = workspace;
        break;
      case 1:
        url = `${API_URL}/workspace/communication`;
        body = communication;
        break;
      case 2:
        url = `${API_URL}/workspace/contact-form`;
        body = contactForm;
        break;
      case 3:
        url = `${API_URL}/workspace/booking`;
        body = booking;
        break;
      case 4:
        url = `${API_URL}/workspace/post-booking`;
        body = { intake: true, serviceAgreement: true, documentUpload: true };
        break;
      case 5:
        url = `${API_URL}/inventory`;
        body = { items: inventoryList };
        break;
      case 6:
        url = `${API_URL}/workspace/staff`;
        body = { staff: staffData };
        break;
      default:
        return;
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log(`Step ${step} saved response:`, data);

      if (!res.ok) {
        alert(data.message || "Failed to save");
        return false;
      }

      return true;
    } catch (err) {
      console.error(err);
      alert("Server error");
      return false;
    }
  };

  const next = async () => {
    if (step < 7) {
      const ok = await saveStep();
      if (ok) console.log(`Step ${step} saved`, workspace, communication, booking, staffData);
      if (!ok) return;
      setStep(step + 1);
    } else {
      setIsOnboarded(true);
      navigate("/admin/dashboard");
    }
  };

  const prev = () => step > 0 && setStep(step - 1);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="h-16 flex items-center px-6 border-b border-border">
        <span className="text-xl font-bold text-primary tracking-tight">
          CareOps
        </span>
        <span className="ml-4 text-sm text-muted-foreground">
          Setup Wizard
        </span>
      </nav>

      <div className="px-6 py-4 border-b border-border overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {stepTitles.map((title, i) => {
            const Icon = stepIcons[i];
            const done = i < step;
            const active = i === step;

            return (
              <button
                key={i}
                onClick={() => i <= step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{title}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prev} disabled={step === 0}>
              Back
            </Button>
            <Button onClick={next}>
              {step === 7 ? "Activate & Launch" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Create Your Workspace</h2>
            <p className="text-sm text-muted-foreground">
              Basic info about your business.
            </p>

            <div>
              <Label>Business Name</Label>
              <Input
                className="mt-1.5"
                value={workspace.businessName}
                onChange={(e) =>
                  setWorkspace({ ...workspace, businessName: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                className="mt-1.5"
                value={workspace.address}
                onChange={(e) =>
                  setWorkspace({ ...workspace, address: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Time Zone</Label>
              <Input
                className="mt-1.5"
                value={workspace.timezone}
                onChange={(e) =>
                  setWorkspace({ ...workspace, timezone: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Contact Email</Label>
              <Input
                className="mt-1.5"
                value={workspace.contactEmail}
                onChange={(e) =>
                  setWorkspace({ ...workspace, contactEmail: e.target.value })
                }
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Communication Setup</h2>
            <p className="text-sm text-muted-foreground">
              Connect at least one channel.
            </p>

            <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">
                    IMAP / SMTP integration
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                Connected
              </span>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">SMS</p>
                  <p className="text-xs text-muted-foreground">
                    Optional — Twilio
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCommunication({ ...communication, smsConnected: true })
                }
              >
                Connect
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Contact Form</h2>

            <div className="p-6 rounded-xl bg-card border border-border space-y-3">
              <div>
                <Label>Full Name</Label>
                <Input
                  className="mt-1.5"
                  value={contactForm.fullName}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Email or Phone</Label>
                <Input
                  className="mt-1.5"
                  value={contactForm.emailOrPhone}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      emailOrPhone: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Message</Label>
                <Input
                  className="mt-1.5"
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      message: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Booking Setup</h2>

            <div>
              <Label>Service Name</Label>
              <Input
                className="mt-1.5"
                value={booking.serviceName}
                onChange={(e) =>
                  setBooking({ ...booking, serviceName: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                className="mt-1.5"
                value={booking.duration}
                onChange={(e) =>
                  setBooking({ ...booking, duration: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <Label>Available Days</Label>
              <Input
                className="mt-1.5"
                value={booking.availableDays}
                onChange={(e) =>
                  setBooking({ ...booking, availableDays: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Time Slots</Label>
              <Input
                className="mt-1.5"
                value={booking.timeSlots}
                onChange={(e) =>
                  setBooking({ ...booking, timeSlots: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                className="mt-1.5"
                value={booking.location}
                onChange={(e) =>
                  setBooking({ ...booking, location: e.target.value })
                }
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Post-Booking Forms</h2>

            {["Intake Form", "Service Agreement", "Document Upload"].map(
              (name, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-card border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              )
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Inventory Setup</h2>
            <p className="text-sm text-muted-foreground">
              Add all products you want to track in your inventory.
            </p>

            {inventoryList.map((item, index) => (
              <div
                key={index}
                className="space-y-4 border-b border-border pb-4 mb-4 rounded-xl p-4 bg-card"
              >
                <div>
                  <Label>Item Name</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="Latex Gloves"
                    value={item.name}
                    onChange={(e) => {
                      const newList = [...inventoryList];
                      newList[index].name = e.target.value;
                      setInventoryList(newList);
                    }}
                  />
                </div>

                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    className="mt-1.5"
                    placeholder="50"
                    value={item.qty}
                    onChange={(e) => {
                      const newList = [...inventoryList];
                      newList[index].qty = Number(e.target.value);
                      setInventoryList(newList);
                    }}
                  />
                </div>

                <div>
                  <Label>Low-Stock Threshold</Label>
                  <Input
                    type="number"
                    className="mt-1.5"
                    placeholder="10"
                    value={item.threshold}
                    onChange={(e) => {
                      const newList = [...inventoryList];
                      newList[index].threshold = Number(e.target.value);
                      setInventoryList(newList);
                    }}
                  />
                </div>

                <div>
                  <Label>Unit</Label>
                  <Input
                    placeholder="Unit (pcs, boxes)"
                    className="mt-1.5"
                    value={item.unit || ""}
                    onChange={(e) => {
                      const newList = [...inventoryList];
                      newList[index].unit = e.target.value;
                      setInventoryList(newList);
                    }}
                  />
                </div>

                {inventoryList.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newList = inventoryList.filter((_, i) => i !== index);
                      setInventoryList(newList);
                    }}
                  >
                    Remove Item
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setInventoryList([
                  ...inventoryList,
                  { name: "", qty: 0, threshold: 0, unit: "" },
                ])
              }
            >
              + Add Another Item
            </Button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Add Staff</h2>
            {staffData.map((s, i) => (
              <div key={i}>
                <Label>Email Address</Label>
                <Input
                  className="mt-1.5"
                  value={s.email}
                  onChange={(e) => {
                    const newStaff = [...staffData];
                    newStaff[i].email = e.target.value;
                    setStaffData(newStaff);
                  }}
                />
              </div>
            ))}
            <Button
              className="mt-2"
              onClick={() => setStaffData([...staffData, { email: "", permissions: [] }])}
            >
              Add Another Staff
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Permissions: Inbox, Bookings, Forms, Inventory (view only)
            </p>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Activate Workspace</h2>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm">
              🚀 Everything looks good! Click Activate & Launch to go live.
            </div>
          </div>
        );

      default:
        return null;
    }
  }
};

export default Onboarding;