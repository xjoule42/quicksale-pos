import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerDialog, CustomerFormData } from "@/components/CustomerDialog";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  total_purchases: number;
  last_purchase_at: string | null;
}

const Customers = () => {
  const { logAction } = useAuditLog();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name");

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (data: CustomerFormData) => {
    try {
      const { data: newCustomer, error } = await supabase
        .from("customers")
        .insert({
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
        })
        .select()
        .single();

      if (error) throw error;

      await logAction({
        actionType: "usuario_creado",
        tableName: "customers",
        recordId: newCustomer.id,
        newValues: data,
        description: `Cliente "${data.name}" creado`,
      });

      toast.success("Cliente creado correctamente");
      fetchCustomers();
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Error al crear cliente");
    }
  };

  const handleUpdateCustomer = async (data: CustomerFormData) => {
    if (!editingCustomer) return;

    try {
      const { error } = await supabase
        .from("customers")
        .update({
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
        })
        .eq("id", editingCustomer.id);

      if (error) throw error;

      await logAction({
        actionType: "usuario_actualizado",
        tableName: "customers",
        recordId: editingCustomer.id,
        oldValues: editingCustomer,
        newValues: data,
        description: `Cliente "${data.name}" actualizado`,
      });

      toast.success("Cliente actualizado correctamente");
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Error al actualizar cliente");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerToDelete.id);

      if (error) throw error;

      await logAction({
        actionType: "usuario_eliminado",
        tableName: "customers",
        recordId: customerToDelete.id,
        oldValues: customerToDelete,
        description: `Cliente "${customerToDelete.name}" eliminado`,
      });

      toast.success("Cliente eliminado correctamente");
      setCustomerToDelete(null);
      setDeleteDialogOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Error al eliminar cliente");
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerBadge = (purchases: number) => {
    if (purchases > 20) return <Badge className="bg-primary">VIP</Badge>;
    if (purchases > 10) return <Badge className="bg-success">Frecuente</Badge>;
    return <Badge variant="secondary">Regular</Badge>;
  };

  const formatLastPurchase = (date: string | null) => {
    if (!date) return "Sin compras";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Hoy";
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;
    return `Hace ${Math.floor(days / 7)} semana(s)`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
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

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron clientes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="p-5 hover:shadow-medium transition-smooth">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{customer.name}</h3>
                      {getCustomerBadge(customer.total_purchases)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCustomer(customer);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCustomerToDelete(customer);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email || "Sin email"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone || "Sin teléfono"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Compras</p>
                    <p className="font-bold text-primary">{customer.total_purchases}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Última Compra</p>
                    <p className="font-medium text-sm">{formatLastPurchase(customer.last_purchase_at)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingCustomer(null);
        }}
        onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
        defaultValues={editingCustomer ? {
          name: editingCustomer.name,
          email: editingCustomer.email || "",
          phone: editingCustomer.phone || "",
        } : undefined}
        isEditing={!!editingCustomer}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente "{customerToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomer} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Customers;
