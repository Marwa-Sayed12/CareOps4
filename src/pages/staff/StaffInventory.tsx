import { useEffect, useState } from "react";
import { AlertTriangle, Package, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type InventoryItem = {
  _id: string;
  name: string;
  qty: number;
  threshold: number;
  unit: string;
};

const StaffInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/inventory", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchInventory();
  }, [user]);

  const lowStockItems = items.filter(item => item.qty < item.threshold);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">View Only</span>
        </div>
      </div>

      {/* Alerts Section */}
      {lowStockItems.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-warning mb-2">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">Low Stock Alerts ({lowStockItems.length})</h3>
          </div>
          <div className="space-y-2">
            {lowStockItems.map(item => (
              <div key={item._id} className="text-sm">
                • {item.name}: {item.qty} {item.unit} remaining (Threshold: {item.threshold})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : items.length === 0 ? (
          <p className="p-4 text-muted-foreground">No inventory items.</p>
        ) : (
          items.map((item) => {
            const low = item.qty < item.threshold;
            return (
              <div key={item._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.qty} {item.unit} / Threshold: {item.threshold} {item.unit}
                    </p>
                  </div>
                </div>

                {low && (
                  <span className="flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2.5 py-1 rounded-full">
                    <AlertTriangle className="h-3 w-3" /> Low Stock
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StaffInventory;