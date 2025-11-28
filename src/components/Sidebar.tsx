import { NavLink } from "react-router-dom";
import { LucideIcon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface SidebarProps {
  navItems: NavItem[];
  currentPath: string;
}

export const Sidebar = ({ navItems }: SidebarProps) => {
  const { signOut, user, userRole } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">PV</span>
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-bold text-xl">PuntoVenta</h1>
            <p className="text-sidebar-foreground/60 text-xs">Sistema POS</p>
          </div>
        </div>

        {user && (
          <div className="mb-6 p-3 bg-sidebar-accent rounded-lg">
            <p className="text-xs text-sidebar-foreground/60 mb-1">Usuario</p>
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.email}</p>
            {userRole && (
              <p className="text-xs text-primary mt-1 capitalize">{userRole}</p>
            )}
          </div>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth",
                  "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent text-sidebar-foreground font-medium"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {user && (
        <div className="p-6 border-t border-sidebar-border">
          <Button
            onClick={signOut}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      )}
    </aside>
  );
};
