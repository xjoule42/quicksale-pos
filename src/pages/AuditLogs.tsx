import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, User, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  description: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

const getActionBadgeVariant = (actionType: string) => {
  if (actionType.includes("creado") || actionType.includes("creada")) {
    return "default";
  }
  if (actionType.includes("actualizado") || actionType.includes("actualizada")) {
    return "secondary";
  }
  if (actionType.includes("eliminado") || actionType.includes("eliminada") || actionType.includes("cancelada")) {
    return "destructive";
  }
  return "outline";
};

const getActionLabel = (actionType: string) => {
  const labels: Record<string, string> = {
    venta_creada: "Venta Creada",
    venta_cancelada: "Venta Cancelada",
    producto_creado: "Producto Creado",
    producto_actualizado: "Producto Actualizado",
    producto_eliminado: "Producto Eliminado",
    ajuste_inventario: "Ajuste de Inventario",
    usuario_creado: "Usuario Creado",
    usuario_actualizado: "Usuario Actualizado",
    usuario_eliminado: "Usuario Eliminado",
    configuracion_actualizada: "Configuración Actualizada",
  };
  return labels[actionType] || actionType;
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data: logsData, error: logsError } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Fetch profiles separately for users
      const userIds = [...new Set(logsData?.map(log => log.user_id).filter(Boolean))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      // Merge profiles with logs
      const logsWithProfiles = logsData?.map(log => ({
        ...log,
        profiles: profilesData?.find(p => p.id === log.user_id) || null
      }));

      setLogs(logsWithProfiles || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action_type.toLowerCase().includes(searchLower) ||
      log.table_name.toLowerCase().includes(searchLower) ||
      log.description?.toLowerCase().includes(searchLower) ||
      log.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      log.profiles?.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Registro de Auditoría</h1>
        <p className="text-muted-foreground mt-2">
          Historial completo de acciones realizadas en el sistema
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar en registros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha y Hora
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Usuario
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Acción
                </div>
              </TableHead>
              <TableHead>Tabla</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Cargando registros...
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No se encontraron registros
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {log.profiles?.full_name || "Usuario desconocido"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {log.profiles?.email || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action_type)}>
                      {getActionLabel(log.action_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.table_name}
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {log.description || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
