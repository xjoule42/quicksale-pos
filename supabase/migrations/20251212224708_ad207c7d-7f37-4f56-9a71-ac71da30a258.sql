-- Add image_url field to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create settings table for business configuration
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT DEFAULT 'Mi Negocio',
  rfc TEXT DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  printer_enabled BOOLEAN DEFAULT false,
  scanner_enabled BOOLEAN DEFAULT false,
  payment_cash BOOLEAN DEFAULT true,
  payment_card BOOLEAN DEFAULT true,
  payment_transfer BOOLEAN DEFAULT false,
  low_stock_alerts BOOLEAN DEFAULT true,
  daily_reports BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  total_purchases INTEGER DEFAULT 0,
  last_purchase_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_movements table
CREATE TABLE public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'salida', 'ajuste')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  notes TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Settings policies
CREATE POLICY "Users can view their own settings" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.settings FOR UPDATE USING (auth.uid() = user_id);

-- Customers policies (admins and sellers can manage)
CREATE POLICY "Staff can view customers" ON public.customers FOR SELECT USING (has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'vendedor'));
CREATE POLICY "Staff can insert customers" ON public.customers FOR INSERT WITH CHECK (has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'vendedor'));
CREATE POLICY "Staff can update customers" ON public.customers FOR UPDATE USING (has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'vendedor'));
CREATE POLICY "Admins can delete customers" ON public.customers FOR DELETE USING (has_role(auth.uid(), 'administrador'));

-- Inventory movements policies
CREATE POLICY "Staff can view movements" ON public.inventory_movements FOR SELECT USING (has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'vendedor'));
CREATE POLICY "Staff can insert movements" ON public.inventory_movements FOR INSERT WITH CHECK (has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'vendedor'));

-- Triggers for updated_at
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();