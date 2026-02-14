import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Staff = () => {
  const { user } = useAuth();

  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ===============================
  // Fetch Staff
  // ===============================
  const fetchStaff = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/staff", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!res.ok) {
        setStaffMembers([]);
        return;
      }

      const data = await res.json();
      setStaffMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchStaff();
    }
  }, [user]);

  // ===============================
  // Invite Staff
  // ===============================
  const handleInvite = async () => {
    if (!email || !businessName) {
      setError("All fields are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/users/create-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          email,
          businessName,
          password: "123456", // default password (can improve later)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create staff.");
        return;
      }

      // Clear form
      setEmail("");
      setBusinessName("");

      // Refresh list
      fetchStaff();
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this staff?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/users/staff/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to delete staff.");
      return;
    }

    // Refresh list
    fetchStaff();
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
};


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff</h1>

      {/* ================= Invite Section ================= */}
      <div className="bg-card border rounded-xl p-4 space-y-4">
        <h2 className="font-semibold">Invite Staff</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <Input
            placeholder="Staff Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <Button onClick={handleInvite} disabled={submitting}>
            {submitting ? "Adding..." : "Add Staff"}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* ================= Staff List ================= */}
      <div className="bg-card border rounded-xl divide-y">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : staffMembers.length === 0 ? (
          <div className="p-4 text-muted-foreground">
            No staff added yet.
          </div>
        ) : (
          staffMembers.map((staff) => (
            <div key={staff._id} className="p-4 flex justify-between">
              <div>
                <p className="font-medium">{staff.email}</p>
                <p className="text-xs text-muted-foreground">
                  {staff.businessName}
                </p>
              </div>
              <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-muted rounded-full">
                {staff.role}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(staff._id)}
              >
                Delete
              </Button>
            </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Staff;
