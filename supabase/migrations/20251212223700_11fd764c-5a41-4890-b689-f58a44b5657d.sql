-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Sin categoría',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies for products (admins and sellers can manage, customers can view)
CREATE POLICY "Admins can do everything with products"
ON public.products
FOR ALL
USING (public.has_role(auth.uid(), 'administrador'))
WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Sellers can view products"
ON public.products
FOR SELECT
USING (public.has_role(auth.uid(), 'vendedor'));

CREATE POLICY "Sellers can update product stock"
ON public.products
FOR UPDATE
USING (public.has_role(auth.uid(), 'vendedor'));

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial sample products
INSERT INTO public.products (name, category, price, stock, sku) VALUES
  ('Café Americano', 'Bebidas', 3.50, 150, 'BEB-001'),
  ('Croissant', 'Panadería', 2.80, 80, 'PAN-001'),
  ('Jugo Natural', 'Bebidas', 4.20, 60, 'BEB-002'),
  ('Sandwich Mixto', 'Comida', 5.50, 45, 'COM-001'),
  ('Té Verde', 'Bebidas', 2.90, 120, 'BEB-003'),
  ('Ensalada César', 'Comida', 7.80, 30, 'COM-002');