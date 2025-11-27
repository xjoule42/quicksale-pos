import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Barcode, Trash2, Plus, Minus, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

const products = [
  { id: 1, name: "Café Americano", price: 3.50, category: "Bebidas" },
  { id: 2, name: "Croissant", price: 2.80, category: "Panadería" },
  { id: 3, name: "Jugo Natural", price: 4.20, category: "Bebidas" },
  { id: 4, name: "Sandwich Mixto", price: 5.50, category: "Comida" },
  { id: 5, name: "Té Verde", price: 2.90, category: "Bebidas" },
  { id: 6, name: "Ensalada César", price: 7.80, category: "Comida" },
];

const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)]">
      <h1 className="text-4xl font-bold text-foreground mb-6">Punto de Venta</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 shadow-soft">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Barcode className="w-5 h-5" />
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-auto max-h-[calc(100vh-16rem)] pb-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="p-4 cursor-pointer hover:shadow-medium transition-smooth"
                onClick={() => addToCart(product)}
              >
                <div className="aspect-square bg-accent rounded-lg mb-3 flex items-center justify-center">
                  <Package className="w-12 h-12 text-accent-foreground" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">{product.name}</h4>
                <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6 shadow-medium flex flex-col">
          <h2 className="text-2xl font-bold text-foreground mb-4">Carrito</h2>
          
          <div className="flex-1 overflow-auto space-y-3 mb-4">
            {cart.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Carrito vacío</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
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
            <Button 
              className="w-full h-12 text-lg font-semibold" 
              disabled={cart.length === 0}
            >
              Cobrar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default POS;
