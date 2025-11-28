import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3,
  Settings,
  Users,
  FileText
} from "lucide-react";

export const Layout = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: ShoppingCart, label: "Punto de Venta", path: "/pos" },
    { icon: Package, label: "Productos", path: "/products" },
    { icon: BarChart3, label: "Inventario", path: "/inventory" },
    { icon: Users, label: "Clientes", path: "/customers" },
    { icon: FileText, label: "Auditoría", path: "/audit" },
    { icon: Settings, label: "Configuración", path: "/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={navItems} currentPath={location.pathname} />
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};
