import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Store, Printer, CreditCard, Bell } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu sistema de punto de venta</p>
      </div>

      <Card className="p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Información del Negocio</h3>
            <p className="text-sm text-muted-foreground">Datos generales de tu establecimiento</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Nombre del Negocio</Label>
              <Input id="businessName" placeholder="Mi Cafetería" />
            </div>
            <div>
              <Label htmlFor="rfc">RFC / NIT</Label>
              <Input id="rfc" placeholder="XAXX010101000" />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" placeholder="Calle Principal #123" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" placeholder="555-1234" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="contacto@negocio.com" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Printer className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Hardware</h3>
            <p className="text-sm text-muted-foreground">Configuración de dispositivos externos</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="printer">Impresora de Tickets</Label>
              <p className="text-sm text-muted-foreground">Habilitar impresión automática</p>
            </div>
            <Switch id="printer" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="scanner">Escáner de Código de Barras</Label>
              <p className="text-sm text-muted-foreground">Conectar escáner USB</p>
            </div>
            <Switch id="scanner" />
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Métodos de Pago</h3>
            <p className="text-sm text-muted-foreground">Formas de pago aceptadas</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="cash">Efectivo</Label>
            <Switch id="cash" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="card">Tarjeta de Crédito/Débito</Label>
            <Switch id="card" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="transfer">Transferencia Bancaria</Label>
            <Switch id="transfer" />
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Notificaciones</h3>
            <p className="text-sm text-muted-foreground">Alertas y recordatorios</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="lowStock">Stock Bajo</Label>
              <p className="text-sm text-muted-foreground">Alertas cuando el inventario está bajo</p>
            </div>
            <Switch id="lowStock" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dailyReport">Reporte Diario</Label>
              <p className="text-sm text-muted-foreground">Resumen de ventas al finalizar el día</p>
            </div>
            <Switch id="dailyReport" defaultChecked />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button>Guardar Cambios</Button>
      </div>
    </div>
  );
};

export default Settings;
