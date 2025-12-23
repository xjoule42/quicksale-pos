import { useAuth } from "@/contexts/AuthContext";
import { useSessionStore } from "@/stores/sessionStore";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionIndicatorProps {
  className?: string;
}

export const SessionIndicator = ({ className }: SessionIndicatorProps) => {
  const { user, userRole } = useAuth();
  const { isOnline } = useSessionStore();

  // Mock user for when there's no authenticated user
  const displayName = user?.email?.split("@")[0] || "Cajero";
  const role = userRole || "vendedor";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Online/Offline indicator */}
      <Badge 
        variant={isOnline ? "secondary" : "destructive"}
        className={cn(
          "gap-1.5 px-2 py-1",
          isOnline ? "bg-success/10 text-success border-success/30" : ""
        )}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            <span className="text-xs">En línea</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span className="text-xs">Sin conexión</span>
          </>
        )}
      </Badge>

      {/* User indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground capitalize">{displayName}</span>
          <span className="text-[10px] text-muted-foreground capitalize">{role}</span>
        </div>
      </div>
    </div>
  );
};
