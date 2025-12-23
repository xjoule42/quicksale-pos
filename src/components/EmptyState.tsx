import { LucideIcon, Package, Users, ShoppingCart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon: Icon = Package,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// Pre-configured empty states for common scenarios
export const EmptyProducts = ({ onAction }: { onAction?: () => void }) => (
  <EmptyState
    icon={Package}
    title="Sin productos"
    description="Aún no hay productos registrados. Agrega tu primer producto para comenzar a vender."
    actionLabel="Agregar producto"
    onAction={onAction}
  />
);

export const EmptyCustomers = ({ onAction }: { onAction?: () => void }) => (
  <EmptyState
    icon={Users}
    title="Sin clientes"
    description="No hay clientes registrados. Agrega clientes para llevar un registro de sus compras."
    actionLabel="Agregar cliente"
    onAction={onAction}
  />
);

export const EmptyCart = () => (
  <EmptyState
    icon={ShoppingCart}
    title="Carrito vacío"
    description="Busca productos o escanea códigos de barras para agregarlos al carrito."
    className="py-8"
  />
);

export const EmptySales = () => (
  <EmptyState
    icon={FileText}
    title="Sin ventas"
    description="Aún no se han registrado ventas. Las ventas realizadas aparecerán aquí."
  />
);

export const EmptySearch = ({ term }: { term: string }) => (
  <EmptyState
    icon={Package}
    title="Sin resultados"
    description={`No se encontraron resultados para "${term}". Intenta con otros términos.`}
    className="py-8"
  />
);
