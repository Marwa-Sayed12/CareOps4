// src/pages/BookingPage.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const timeSlots = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"];

const BookingPage = () => {
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

const handleSubmitBooking = async () => {
  setSubmitting(true);
  try {
    const res = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: fullName,
        email,
        phone,
        service: "General Consultation",
        date: selectedDate,
        time: selectedTime,
      }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Booking failed");
    }
    setStep(2);
  } catch (err: any) {
    console.error(err);
    alert("Booking failed: " + err.message);
  } finally {
    setSubmitting(false);
  }
};


  if (step === 2) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-primary"/>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-2">{selectedDate} at {selectedTime}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {step === 0 && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-1">Book an Appointment</h1>
            <Label>Select Date</Label>
            <Input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} className="mt-1.5"/>
            <Label className="mt-4">Select Time</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {timeSlots.map(t => (
                <button key={t} type="button" onClick={()=>setSelectedTime(t)}
                  className={`py-2 px-3 rounded-lg text-sm border ${selectedTime===t?"bg-primary text-primary-foreground border-primary":"bg-card border-border text-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
            <Button className="w-full mt-6" onClick={()=>selectedDate && selectedTime && setStep(1)} disabled={!selectedDate || !selectedTime}>Continue</Button>
          </>
        )}
        {step === 1 && (
          <>
            <Label>Full Name</Label>
            <Input value={fullName} onChange={e=>setFullName(e.target.value)} className="mt-1.5"/>
            <Label className="mt-2">Email</Label>
            <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1.5"/>
            <Label className="mt-2">Phone</Label>
            <Input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1.5"/>
            <Button className="w-full mt-4" onClick={handleSubmitBooking} disabled={submitting}>{submitting?"Submitting...":"Confirm Booking"}</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
