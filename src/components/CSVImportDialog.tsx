import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (products: CSVProduct[]) => Promise<void>;
}

export interface CSVProduct {
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  description?: string;
}

export const CSVImportDialog = ({
  open,
  onOpenChange,
  onImport,
}: CSVImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<CSVProduct[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error("Por favor selecciona un archivo CSV");
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setErrors(["El archivo CSV debe tener al menos una fila de encabezados y una de datos"]);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['name', 'sku'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h) && !headers.includes(h === 'name' ? 'nombre' : h));

      if (missingHeaders.length > 0) {
        setErrors([`Faltan columnas requeridas: ${missingHeaders.join(', ')}`]);
        return;
      }

      const products: CSVProduct[] = [];
      const parseErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) {
          parseErrors.push(`Línea ${i + 1}: número incorrecto de columnas`);
          continue;
        }

        const product: Partial<CSVProduct> = {};
        headers.forEach((header, index) => {
          const value = values[index];
          switch (header) {
            case 'name':
            case 'nombre':
              product.name = value;
              break;
            case 'category':
            case 'categoria':
            case 'categoría':
              product.category = value || 'Sin categoría';
              break;
            case 'price':
            case 'precio':
              product.price = parseFloat(value) || 0;
              break;
            case 'stock':
              product.stock = parseInt(value) || 0;
              break;
            case 'sku':
              product.sku = value;
              break;
            case 'description':
            case 'descripcion':
            case 'descripción':
              product.description = value;
              break;
          }
        });

        if (!product.name || !product.sku) {
          parseErrors.push(`Línea ${i + 1}: falta nombre o SKU`);
          continue;
        }

        products.push({
          name: product.name,
          category: product.category || 'Sin categoría',
          price: product.price || 0,
          stock: product.stock || 0,
          sku: product.sku,
          description: product.description,
        });
      }

      setErrors(parseErrors);
      setParsedProducts(products);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedProducts.length === 0) {
      toast.error("No hay productos para importar");
      return;
    }

    setImporting(true);
    try {
      await onImport(parsedProducts);
      toast.success(`${parsedProducts.length} productos importados correctamente`);
      onOpenChange(false);
      setFile(null);
      setParsedProducts([]);
      setErrors([]);
    } catch (error) {
      toast.error("Error al importar productos");
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFile(null);
    setParsedProducts([]);
    setErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Productos desde CSV
          </DialogTitle>
          <DialogDescription>
            Sube un archivo CSV con las columnas: name (o nombre), sku, category (opcional), price (opcional), stock (opcional), description (opcional)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "Haz clic para seleccionar un archivo CSV"}
              </p>
            </label>
          </div>

          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Errores encontrados:</span>
              </div>
              <ul className="text-sm text-destructive space-y-1">
                {errors.slice(0, 5).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
                {errors.length > 5 && (
                  <li>...y {errors.length - 5} errores más</li>
                )}
              </ul>
            </div>
          )}

          {parsedProducts.length > 0 && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-success mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">{parsedProducts.length} productos listos para importar</span>
              </div>
              <div className="max-h-40 overflow-auto text-sm">
                {parsedProducts.slice(0, 5).map((product, i) => (
                  <div key={i} className="py-1 border-b border-border last:border-0">
                    {product.name} - {product.sku} - ${product.price}
                  </div>
                ))}
                {parsedProducts.length > 5 && (
                  <div className="py-1 text-muted-foreground">
                    ...y {parsedProducts.length - 5} productos más
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={parsedProducts.length === 0 || importing}
            >
              {importing ? "Importando..." : `Importar ${parsedProducts.length} productos`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
