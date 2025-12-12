import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { Package, AlertTriangle, TrendingDown, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuditLog } from "@/hooks/useAuditLog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
}

interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  created_at: string;
  products?: { name: string } | null;
}

const MIN_STOCK_THRESHOLD = 50;

const Inventory = () => {
  const { logAction } = useAuditLog();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, movementsRes] = await Promise.all([
        supabase.from("products").select("*").order("stock", { ascending: true }),
        supabase
          .from("inventory_movements")
          .select("*, products(name)")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (movementsRes.error) throw movementsRes.error;

      setProducts(productsRes.data || []);
      setMovements(movementsRes.data || []);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Error al cargar datos de inventario");
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = products.filter(p => p.stock < MIN_STOCK_THRESHOLD && p.stock > 0);
  const outOfStockItems = products.filter(p => p.stock === 0);
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  const handleAdjustStock = async (product: Product, adjustment: number) => {
    const oldValue = product.stock;
    const newValue = Math.max(0, product.stock + adjustment);

    try {
      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: newValue })
        .eq("id", product.id);

      if (updateError) throw updateError;

      const { error: movementError } = await supabase
        .from("inventory_movements")
        .insert({
          product_id: product.id,
          movement_type: adjustment > 0 ? "entrada" : "ajuste",
          quantity: adjustment,
          previous_stock: oldValue,
          new_stock: newValue,
          notes: `Ajuste manual: ${adjustment > 0 ? "+" : ""}${adjustment}`,
        });

      if (movementError) throw movementError;

      await logAction({
        actionType: "ajuste_inventario",
        tableName: "products",
        recordId: product.id,
        oldValues: { stock: oldValue },
        newValues: { stock: newValue },
        description: `Ajuste de inventario para "${product.name}": ${oldValue} → ${newValue}`,
      });

      toast.success(`Stock de ${product.name} ajustado`);
      fetchData();
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error("Error al ajustar stock");
    }
  };

  const getMovementLabel = (type: string) => {
    const labels: Record<string, string> = {
      entrada: "Entrada",
      salida: "Salida",
      ajuste: "Ajuste",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Inventario</h1>
        <p className="text-muted-foreground">Control y seguimiento de stock</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Productos"
          value={products.length.toString()}
          icon={Package}
        />
        <StatCard
          title="Bajo Stock"
          value={lowStockItems.length.toString()}
          icon={AlertTriangle}
        />
        <StatCard
          title="Sin Stock"
          value={outOfStockItems.length.toString()}
          icon={TrendingDown}
        />
        <StatCard
          title="Valor Total"
          value={`$${totalValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
          icon={Archive}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-soft">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Productos con Stock Bajo
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay productos con stock bajo
              </p>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <Badge variant="outline" className="mt-1">{item.category}</Badge>
                    </div>
                    <Badge variant="destructive">¡Alerta!</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-3">
                    <span className="text-muted-foreground">Stock actual:</span>
                    <span className="font-bold text-warning">{item.stock} unidades</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stock mínimo:</span>
                    <span className="font-medium">{MIN_STOCK_THRESHOLD} unidades</span>
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
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <h3 className="text-xl font-bold text-foreground mb-4">Movimientos Recientes</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {movements.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay movimientos registrados
              </p>
            ) : (
              movements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={movement.movement_type === "entrada" ? "secondary" : "outline"}
                        className={movement.movement_type === "entrada" ? "bg-success/20 text-success border-success/30" : ""}
                      >
                        {getMovementLabel(movement.movement_type)}
                      </Badge>
                      <span className="font-medium text-foreground">
                        {movement.products?.name || "Producto desconocido"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(movement.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                  <span className={`font-bold text-lg ${movement.quantity > 0 ? 'text-success' : 'text-destructive'}`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Inventory;
