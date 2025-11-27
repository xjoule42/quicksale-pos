import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone } from "lucide-react";
import { useState } from "react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalPurchases: number;
  lastPurchase: string;
}

const initialCustomers: Customer[] = [
  { id: 1, name: "Juan Pérez", email: "juan@example.com", phone: "555-0101", totalPurchases: 15, lastPurchase: "Hoy" },
  { id: 2, name: "María García", email: "maria@example.com", phone: "555-0102", totalPurchases: 8, lastPurchase: "Ayer" },
  { id: 3, name: "Carlos López", email: "carlos@example.com", phone: "555-0103", totalPurchases: 23, lastPurchase: "Hace 2 días" },
  { id: 4, name: "Ana Martínez", email: "ana@example.com", phone: "555-0104", totalPurchases: 12, lastPurchase: "Hace 3 días" },
  { id: 5, name: "Luis Rodríguez", email: "luis@example.com", phone: "555-0105", totalPurchases: 31, lastPurchase: "Hace 1 semana" },
];

const Customers = () => {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerBadge = (purchases: number) => {
    if (purchases > 20) return <Badge className="bg-primary">VIP</Badge>;
    if (purchases > 10) return <Badge className="bg-success">Frecuente</Badge>;
    return <Badge variant="secondary">Regular</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card className="p-6 shadow-soft">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="p-5 hover:shadow-medium transition-smooth">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{customer.name}</h3>
                    {getCustomerBadge(customer.totalPurchases)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Total Compras</p>
                  <p className="font-bold text-primary">{customer.totalPurchases}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Última Compra</p>
                  <p className="font-medium text-sm">{customer.lastPurchase}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Customers;
