import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Store, Printer, CreditCard, Bell } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";

const Settings = () => {
  const { settings, loading, saveSettings } = useSettings();
  const { logAction } = useAuditLog();
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveSettings(formData);
      if (success) {
        await logAction({
          actionType: "configuracion_actualizada",
          tableName: "settings",
          oldValues: settings,
          newValues: formData,
          description: "Configuración del sistema actualizada",
        });
        toast.success("Configuración guardada correctamente");
      } else {
        toast.error("Error al guardar la configuración");
      }
    } catch (error) {
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(settings);
    toast.info("Cambios descartados");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

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
              <Input 
                id="businessName" 
                placeholder="Mi Cafetería" 
                value={formData.business_name}
                onChange={(e) => handleInputChange("business_name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rfc">RFC / NIT</Label>
              <Input 
                id="rfc" 
                placeholder="XAXX010101000" 
                value={formData.rfc}
                onChange={(e) => handleInputChange("rfc", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input 
              id="address" 
              placeholder="Calle Principal #123" 
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input 
                id="phone" 
                placeholder="555-1234" 
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="contacto@negocio.com" 
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
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
            <Switch 
              id="printer" 
              checked={formData.printer_enabled}
              onCheckedChange={(checked) => handleInputChange("printer_enabled", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="scanner">Escáner de Código de Barras</Label>
              <p className="text-sm text-muted-foreground">Conectar escáner USB</p>
            </div>
            <Switch 
              id="scanner" 
              checked={formData.scanner_enabled}
              onCheckedChange={(checked) => handleInputChange("scanner_enabled", checked)}
            />
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
            <Switch 
              id="cash" 
              checked={formData.payment_cash}
              onCheckedChange={(checked) => handleInputChange("payment_cash", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="card">Tarjeta de Crédito/Débito</Label>
            <Switch 
              id="card" 
              checked={formData.payment_card}
              onCheckedChange={(checked) => handleInputChange("payment_card", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="transfer">Transferencia Bancaria</Label>
            <Switch 
              id="transfer" 
              checked={formData.payment_transfer}
              onCheckedChange={(checked) => handleInputChange("payment_transfer", checked)}
            />
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
            <Switch 
              id="lowStock" 
              checked={formData.low_stock_alerts}
              onCheckedChange={(checked) => handleInputChange("low_stock_alerts", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dailyReport">Reporte Diario</Label>
              <p className="text-sm text-muted-foreground">Resumen de ventas al finalizar el día</p>
            </div>
            <Switch 
              id="dailyReport" 
              checked={formData.daily_reports}
              onCheckedChange={(checked) => handleInputChange("daily_reports", checked)}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
