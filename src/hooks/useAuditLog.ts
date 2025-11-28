import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type ActionType = 
  | "venta_creada"
  | "venta_cancelada"
  | "producto_creado"
  | "producto_actualizado"
  | "producto_eliminado"
  | "ajuste_inventario"
  | "usuario_creado"
  | "usuario_actualizado"
  | "usuario_eliminado"
  | "configuracion_actualizada";

interface AuditLogParams {
  actionType: ActionType;
  tableName: string;
  recordId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  description?: string;
}

export const useAuditLog = () => {
  const { user } = useAuth();

  const logAction = async ({
    actionType,
    tableName,
    recordId,
    oldValues,
    newValues,
    description,
  }: AuditLogParams) => {
    try {
      const { error } = await supabase.from("audit_logs").insert({
        user_id: user?.id,
        action_type: actionType,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        description,
        user_agent: navigator.userAgent,
      });

      if (error) {
        console.error("Error logging audit action:", error);
      }
    } catch (error) {
      console.error("Error logging audit action:", error);
    }
  };

  return { logAction };
};
