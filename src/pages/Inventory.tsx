import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { Package, AlertTriangle, TrendingDown, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";

interface LowStockItem {
  name: string;
  current: number;
  min: number;
  category: string;
}

const Inventory = () => {
  const { logAction } = useAuditLog();
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([
    { name: "Ensalada César", current: 30, min: 50, category: "Comida" },
    { name: "Sandwich Mixto", current: 45, min: 60, category: "Comida" },
    { name: "Jugo Natural", current: 60, min: 80, category: "Bebidas" },
  ]);

  const handleAdjustStock = async (item: LowStockItem, adjustment: number) => {
    const oldValue = item.current;
    const newValue = item.current + adjustment;
    
    setLowStockItems(items =>
      items.map(i =>
        i.name === item.name ? { ...i, current: newValue } : i
      )
    );

    await logAction({
      actionType: "ajuste_inventario",
      tableName: "inventory",
      oldValues: { stock: oldValue },
      newValues: { stock: newValue },
      description: `Ajuste de inventario para "${item.name}": ${oldValue} → ${newValue} (${adjustment > 0 ? '+' : ''}${adjustment})`,
    });
    
    toast.success(`Stock de ${item.name} ajustado`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Inventario</h1>
        <p className="text-muted-foreground">Control y seguimiento de stock</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Productos"
          value="1,234"
          icon={Package}
        />
        <StatCard
          title="Bajo Stock"
          value="12"
          icon={AlertTriangle}
        />
        <StatCard
          title="Sin Stock"
          value="3"
          icon={TrendingDown}
        />
        <StatCard
          title="Valor Total"
          value="$45,890"
          icon={Archive}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-soft">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Productos con Stock Bajo
          </h3>
          <div className="space-y-4">
            {lowStockItems.map((item, i) => (
              <div key={i} className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <Badge variant="outline" className="mt-1">{item.category}</Badge>
                  </div>
                  <Badge variant="destructive">¡Alerta!</Badge>
                </div>
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-muted-foreground">Stock actual:</span>
                  <span className="font-bold text-warning">{item.current} unidades</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stock mínimo:</span>
                  <span className="font-medium">{item.min} unidades</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => handleAdjustStock(item, 10)}>
                    +10 Stock
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAdjustStock(item, 50)}>
                    +50 Stock
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <h3 className="text-xl font-bold text-foreground mb-4">Movimientos Recientes</h3>
          <div className="space-y-4">
            {[
              { type: "Entrada", product: "Café Americano", qty: 100, date: "Hoy, 10:30 AM" },
              { type: "Salida", product: "Croissant", qty: -25, date: "Hoy, 09:15 AM" },
              { type: "Entrada", product: "Té Verde", qty: 50, date: "Ayer, 04:20 PM" },
              { type: "Ajuste", product: "Jugo Natural", qty: -5, date: "Ayer, 02:10 PM" },
              { type: "Entrada", product: "Sandwich Mixto", qty: 40, date: "Ayer, 11:00 AM" },
            ].map((movement, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={movement.type === "Entrada" ? "secondary" : "outline"}
                      className={movement.type === "Entrada" ? "bg-success/20 text-success border-success/30" : ""}
                    >
                      {movement.type}
                    </Badge>
                    <span className="font-medium text-foreground">{movement.product}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{movement.date}</p>
                </div>
                <span className={`font-bold text-lg ${movement.qty > 0 ? 'text-success' : 'text-destructive'}`}>
                  {movement.qty > 0 ? '+' : ''}{movement.qty}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Inventory;
