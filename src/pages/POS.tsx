import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Barcode, Trash2, Plus, Minus, Package, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadingButton } from "@/components/LoadingButton";
import { EmptyCart, EmptySearch } from "@/components/EmptyState";
import { SessionIndicator } from "@/components/SessionIndicator";
import { useKeyboardShortcuts, useFocusInput } from "@/hooks/useKeyboardShortcuts";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/useSettings";
import { generateTicketHTML, printTicket } from "@/lib/generateTicketPDF";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
}

const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { logAction } = useAuditLog();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [clearCartOpen, setClearCartOpen] = useState(false);
  const [cancelSaleOpen, setCancelSaleOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const focusInput = useFocusInput(searchInputRef);
  const { settings } = useSettings();

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, stock, sku")
        .gt("stock", 0)
        .order("name");

      if (error) {
        console.error("Error fetching products:", error);
        toast.error("Error al cargar productos");
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onEscape: () => {
      if (cart.length > 0) {
        setCancelSaleOpen(true);
      }
    },
    inputRef: searchInputRef,
  });

  // Focus input on mount
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    const currentQty = existing?.quantity || 0;

    // Validate stock
    if (currentQty >= product.stock) {
      toast.error(`Stock insuficiente. Solo quedan ${product.stock} unidades de "${product.name}"`);
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        quantity: 1 
      }]);
    }
    
    toast.success(`${product.name} agregado`);
    focusInput();
  };

  const updateQuantity = (id: string, change: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const newQty = item.quantity + change;

    // Validate stock on increase
    if (change > 0 && newQty > item.stock) {
      toast.error(`Stock insuficiente. Solo hay ${item.stock} unidades disponibles`);
      return;
    }

    if (newQty <= 0) {
      setCart(cart.filter(i => i.id !== id));
    } else {
      setCart(cart.map(i => 
        i.id === id ? { ...i, quantity: newQty } : i
      ));
    }
  };

  const removeItem = (id: string) => {
    const item = cart.find(i => i.id === id);
    setCart(cart.filter(i => i.id !== id));
    if (item) {
      toast.success(`${item.name} eliminado del carrito`);
    }
    focusInput();
  };

  const clearCart = () => {
    setCart([]);
    setClearCartOpen(false);
    toast.success("Carrito vaciado");
    focusInput();
  };

  const cancelSale = () => {
    setCart([]);
    setCancelSaleOpen(false);
    toast.warning("Venta cancelada");
    focusInput();
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckout = async () => {
    // Validations
    if (cart.length === 0) {
      toast.error("El carrito está vacío. Agrega productos para continuar.");
      return;
    }

    setCheckoutLoading(true);

    try {
      const saleData = {
        items: cart,
        subtotal: total,
        tax: total * 0.16,
        total: total * 1.16,
        timestamp: new Date().toISOString(),
      };

      // Update stock for each product
      for (const item of cart) {
        const { error } = await supabase
          .from("products")
          .update({ stock: item.stock - item.quantity })
          .eq("id", item.id);

        if (error) {
          console.error("Error updating stock:", error);
        }
      }

      await logAction({
        actionType: "venta_creada",
        tableName: "sales",
        newValues: saleData,
        description: `Venta realizada por $${(total * 1.16).toFixed(2)} con ${cart.length} productos`,
      });

      // Generate and print ticket if printer is enabled
      if (settings.printer_enabled) {
        const ticketHTML = generateTicketHTML(cart, settings);
        printTicket(ticketHTML);
      }

      setCart([]);
      toast.success("Venta registrada exitosamente");
      focusInput();

      // Refresh products to get updated stock
      const { data } = await supabase
        .from("products")
        .select("id, name, price, category, stock, sku")
        .gt("stock", 0)
        .order("name");
      
      if (data) setProducts(data);
    } catch (error) {
      console.error("Error processing sale:", error);
      toast.error("Error al procesar la venta");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Handle barcode/enter key search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      const exactMatch = products.find(
        p => p.sku.toLowerCase() === searchTerm.toLowerCase() ||
             p.name.toLowerCase() === searchTerm.toLowerCase()
      );
      
      if (exactMatch) {
        addToCart(exactMatch);
        setSearchTerm("");
      } else if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        setSearchTerm("");
      } else if (filteredProducts.length === 0) {
        toast.error("Producto no encontrado");
      }
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-foreground">Punto de Venta</h1>
        <SessionIndicator />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 shadow-soft">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  ref={searchInputRef}
                  placeholder="Buscar productos o escanear código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <Button variant="outline" size="icon" title="Escanear código de barras (F1)">
                <Barcode className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Presiona Enter para agregar producto • Esc para cancelar venta
            </p>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Cargando productos...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 && searchTerm ? (
            <EmptySearch term={searchTerm} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-auto max-h-[calc(100vh-16rem)] pb-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="p-4 cursor-pointer hover:shadow-medium transition-smooth active:scale-[0.98]"
                  onClick={() => addToCart(product)}
                >
                  <div className="aspect-square bg-accent rounded-lg mb-3 flex items-center justify-center">
                    <Package className="w-12 h-12 text-accent-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1 truncate">{product.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{product.category}</Badge>
                    <Badge variant="outline" className="text-xs">
                      Stock: {product.stock}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-primary">${Number(product.price).toFixed(2)}</p>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="p-6 shadow-medium flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Carrito
            </h2>
            {cart.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive"
                onClick={() => setClearCartOpen(true)}
              >
                Vaciar
              </Button>
            )}
          </div>
          
          <div className="flex-1 overflow-auto space-y-3 mb-4">
            {cart.length === 0 ? (
              <EmptyCart />
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${Number(item.price).toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 ml-2"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Impuesto (16%):</span>
              <span className="font-semibold">${(total * 0.16).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-primary">${(total * 1.16).toFixed(2)}</span>
            </div>
            <LoadingButton 
              className="w-full h-12 text-lg font-semibold" 
              disabled={cart.length === 0}
              loading={checkoutLoading}
              loadingText="Procesando..."
              onClick={handleCheckout}
            >
              Cobrar
            </LoadingButton>
          </div>
        </Card>
      </div>

      {/* Clear cart confirmation */}
      <ConfirmDialog
        open={clearCartOpen}
        onOpenChange={setClearCartOpen}
        title="¿Vaciar carrito?"
        description="Se eliminarán todos los productos del carrito. Esta acción no se puede deshacer."
        confirmLabel="Vaciar carrito"
        onConfirm={clearCart}
        variant="destructive"
      />

      {/* Cancel sale confirmation */}
      <ConfirmDialog
        open={cancelSaleOpen}
        onOpenChange={setCancelSaleOpen}
        title="¿Cancelar venta?"
        description="Se descartarán todos los productos del carrito actual. Esta acción no se puede deshacer."
        confirmLabel="Cancelar venta"
        onConfirm={cancelSale}
        variant="destructive"
      />
    </div>
  );
};

export default POS;
