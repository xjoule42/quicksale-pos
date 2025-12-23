import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Package as PackageIcon, Loader2, Upload } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProductDialog, ProductFormData } from "@/components/ProductDialog";
import { CSVImportDialog, CSVProduct } from "@/components/CSVImportDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyProducts, EmptySearch } from "@/components/EmptyState";
import { LoadingButton } from "@/components/LoadingButton";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  description?: string | null;
  image_url?: string | null;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { logAction } = useAuditLog();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvDialogOpen, setCSVDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching products:", error);
      toast.error("Error al cargar productos");
      return;
    }

    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockBadge = (stock: number) => {
    if (stock > 100) return <Badge className="bg-success">Alto Stock</Badge>;
    if (stock > 30) return <Badge variant="secondary">Stock Normal</Badge>;
    if (stock > 0) return <Badge className="bg-warning text-warning-foreground">Stock Bajo</Badge>;
    return <Badge variant="destructive">Sin Stock</Badge>;
  };

  const handleCreateProduct = async (data: ProductFormData) => {
    // Validations
    if (!data.name.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }
    if (data.price <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return;
    }
    if (data.stock < 0) {
      toast.error("El stock no puede ser negativo");
      return;
    }

    // Check for duplicate SKU
    const existingProduct = products.find(p => p.sku.toLowerCase() === data.sku.toLowerCase());
    if (existingProduct) {
      toast.error("Ya existe un producto con ese SKU");
      return;
    }

    setActionLoading("create");
    try {
      const { data: newProduct, error } = await supabase
        .from("products")
        .insert({
          name: data.name.trim(),
          category: data.category,
          price: data.price,
          stock: data.stock,
          sku: data.sku.trim(),
          description: data.description?.trim() || null,
          image_url: data.image_url?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setProducts([...products, newProduct]);
      await logAction({
        actionType: "producto_creado",
        tableName: "products",
        recordId: newProduct.id,
        newValues: newProduct,
        description: `Producto "${newProduct.name}" creado`,
      });
      toast.success("Producto creado exitosamente");
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error al crear producto");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;

    // Validations
    if (!data.name.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }
    if (data.price <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return;
    }
    if (data.stock < 0) {
      toast.error("El stock no puede ser negativo");
      return;
    }

    // Check for duplicate SKU (excluding current product)
    const existingProduct = products.find(
      p => p.sku.toLowerCase() === data.sku.toLowerCase() && p.id !== editingProduct.id
    );
    if (existingProduct) {
      toast.error("Ya existe otro producto con ese SKU");
      return;
    }

    setActionLoading("edit");
    try {
      const { data: updatedProduct, error } = await supabase
        .from("products")
        .update({
          name: data.name.trim(),
          category: data.category,
          price: data.price,
          stock: data.stock,
          sku: data.sku.trim(),
          description: data.description?.trim() || null,
          image_url: data.image_url?.trim() || null,
        })
        .eq("id", editingProduct.id)
        .select()
        .single();

      if (error) throw error;

      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      await logAction({
        actionType: "producto_actualizado",
        tableName: "products",
        recordId: updatedProduct.id,
        oldValues: editingProduct,
        newValues: updatedProduct,
        description: `Producto "${updatedProduct.name}" actualizado`,
      });
      toast.success("Producto actualizado exitosamente");
      setEditingProduct(null);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error al actualizar producto");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setActionLoading("delete");
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productToDelete.id));
      await logAction({
        actionType: "producto_eliminado",
        tableName: "products",
        recordId: productToDelete.id,
        oldValues: productToDelete,
        description: `Producto "${productToDelete.name}" eliminado`,
      });
      toast.success("Producto eliminado exitosamente");
      setProductToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error al eliminar producto");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCSVImport = async (csvProducts: CSVProduct[]) => {
    const { data, error } = await supabase
      .from("products")
      .insert(
        csvProducts.map(p => ({
          name: p.name.trim(),
          category: p.category,
          price: p.price,
          stock: p.stock,
          sku: p.sku.trim(),
          description: p.description?.trim() || null,
        }))
      )
      .select();

    if (error) {
      console.error("Error importing products:", error);
      throw error;
    }

    await logAction({
      actionType: "producto_creado",
      tableName: "products",
      description: `${csvProducts.length} productos importados desde CSV`,
    });

    fetchProducts();
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDialogSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      handleEditProduct(data);
    } else {
      handleCreateProduct(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setCSVDialogOpen(true)}>
            <Upload className="w-4 h-4" />
            Importar CSV
          </Button>
          <Button className="gap-2" onClick={openCreateDialog}>
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </Button>
        </div>
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

        {products.length === 0 ? (
          <EmptyProducts onAction={openCreateDialog} />
        ) : filteredProducts.length === 0 && searchTerm ? (
          <EmptySearch term={searchTerm} />
        ) : (
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
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                            <PackageIcon className="w-5 h-5 text-accent-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{product.sku}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">{product.category}</Badge>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-primary">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right font-medium">{product.stock}</td>
                    <td className="py-4 px-4 text-center">
                      {getStockBadge(product.stock)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditDialog(product)}
                          disabled={actionLoading !== null}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openDeleteDialog(product)}
                          disabled={actionLoading !== null}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!actionLoading) {
            setDialogOpen(open);
            if (!open) setEditingProduct(null);
          }
        }}
        onSubmit={handleDialogSubmit}
        defaultValues={editingProduct ? {
          name: editingProduct.name,
          category: editingProduct.category,
          price: editingProduct.price,
          stock: editingProduct.stock,
          sku: editingProduct.sku,
          description: editingProduct.description || "",
          image_url: editingProduct.image_url || "",
        } : undefined}
        isEditing={!!editingProduct}
      />

      <CSVImportDialog
        open={csvDialogOpen}
        onOpenChange={setCSVDialogOpen}
        onImport={handleCSVImport}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar producto?"
        description={`Esta acción no se puede deshacer. Se eliminará permanentemente el producto "${productToDelete?.name}".`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteProduct}
        variant="destructive"
        loading={actionLoading === "delete"}
      />
    </div>
  );
};

export default Products;
