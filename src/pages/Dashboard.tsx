import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de tu negocio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas de Hoy"
          value="$12,450"
          icon={DollarSign}
          trend={{ value: "12.5%", isPositive: true }}
        />
        <StatCard
          title="Transacciones"
          value="145"
          icon={ShoppingBag}
          trend={{ value: "8.2%", isPositive: true }}
        />
        <StatCard
          title="Productos en Stock"
          value="1,234"
          icon={Package}
          trend={{ value: "3.1%", isPositive: false }}
        />
        <StatCard
          title="Ticket Promedio"
          value="$85.86"
          icon={TrendingUp}
          trend={{ value: "5.4%", isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-soft">
          <h3 className="text-lg font-bold text-foreground mb-4">Ventas Recientes</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">Venta #{1000 + i}</p>
                  <p className="text-sm text-muted-foreground">Hace {i * 10} minutos</p>
                </div>
                <p className="font-bold text-primary">${(Math.random() * 200 + 50).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <h3 className="text-lg font-bold text-foreground mb-4">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {["Café Americano", "Croissant", "Jugo Natural", "Sandwich Mixto", "Té Verde"].map((product, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{product}</p>
                  <div className="mt-1 bg-muted rounded-full h-2 w-full">
                    <div 
                      className="bg-primary h-2 rounded-full transition-smooth"
                      style={{ width: `${100 - i * 15}%` }}
                    />
                  </div>
                </div>
                <p className="ml-4 font-bold text-muted-foreground">{50 - i * 8}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
