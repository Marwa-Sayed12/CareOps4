import { useEffect, useState } from "react";
import { AlertTriangle, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type InventoryItem = {
  _id: string;
  name: string;
  qty: number;
  threshold: number;
  unit: string;
};

const Inventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/inventory", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch inventory");

      const data = await res.json();
      console.log("Inventory from backend:", data);

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Inventory fetch error:", err);
      setItems([]);
    } finally {
      setLoading(false); // 🔥 THIS WAS MISSING
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchInventory();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Inventory</h1>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No inventory items yet.
        </p>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {items.map((item) => {
            const low = item.qty < item.threshold;

            return (
              <div
                key={item._id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.qty} {item.unit} remaining
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {low && (
                    <span className="flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="h-3 w-3" /> Low Stock
                    </span>
                  )}

                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        low ? "bg-warning" : "bg-primary"
                      }`}
                      style={{
                        width: `${Math.min(
                          (item.qty / item.threshold) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Inventory;
