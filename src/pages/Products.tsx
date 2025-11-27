import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Package as PackageIcon } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
}

const initialProducts: Product[] = [
  { id: 1, name: "Café Americano", category: "Bebidas", price: 3.50, stock: 150, sku: "BEB-001" },
  { id: 2, name: "Croissant", category: "Panadería", price: 2.80, stock: 80, sku: "PAN-001" },
  { id: 3, name: "Jugo Natural", category: "Bebidas", price: 4.20, stock: 60, sku: "BEB-002" },
  { id: 4, name: "Sandwich Mixto", category: "Comida", price: 5.50, stock: 45, sku: "COM-001" },
  { id: 5, name: "Té Verde", category: "Bebidas", price: 2.90, stock: 120, sku: "BEB-003" },
  { id: 6, name: "Ensalada César", category: "Comida", price: 7.80, stock: 30, sku: "COM-002" },
];

const Products = () => {
  const [products] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockBadge = (stock: number) => {
    if (stock > 100) return <Badge className="bg-success">Alto Stock</Badge>;
    if (stock > 30) return <Badge variant="secondary">Stock Normal</Badge>;
    return <Badge variant="destructive">Stock Bajo</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Button>
      </div>

      <Card className="p-6 shadow-soft">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Producto</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">SKU</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Categoría</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Precio</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Stock</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Estado</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                        <PackageIcon className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{product.sku}</td>
                  <td className="py-4 px-4">
                    <Badge variant="outline">{product.category}</Badge>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-primary">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-medium">{product.stock}</td>
                  <td className="py-4 px-4 text-center">
                    {getStockBadge(product.stock)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Products;
