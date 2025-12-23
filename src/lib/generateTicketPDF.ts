interface TicketItem {
  name: string;
  quantity: number;
  price: number;
}

interface TicketData {
  businessName: string;
  rfc: string;
  address: string;
  phone: string;
  email: string;
  items: TicketItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  date: Date;
  ticketNumber: string;
}

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

interface Settings {
  business_name: string;
  rfc: string;
  address: string;
  phone: string;
  email: string;
}

// Generate ticket number
const generateTicketNumber = (): string => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timePart = now.getTime().toString().slice(-6);
  return `T${datePart}-${timePart}`;
};

// Generate HTML for printing
export const generateTicketHTML = (cart: CartItem[], settings: Settings): string => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;
  const ticketNumber = generateTicketNumber();
  const date = new Date();

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (d: Date) => d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket de Compra - ${ticketNumber}</title>
  <style>
    @page { size: 80mm auto; margin: 5mm; }
    body { 
      font-family: 'Courier New', monospace; 
      font-size: 12px; 
      line-height: 1.4;
      margin: 0;
      padding: 10px;
      max-width: 280px;
    }
    .header { text-align: center; margin-bottom: 15px; }
    .header h1 { font-size: 16px; margin: 0 0 5px 0; }
    .header p { margin: 2px 0; font-size: 11px; }
    .divider { border-top: 1px dashed #000; margin: 10px 0; }
    .item { display: flex; justify-content: space-between; margin: 5px 0; }
    .item-name { flex: 1; }
    .item-qty { width: 30px; text-align: center; }
    .item-price { width: 60px; text-align: right; }
    .totals { margin-top: 10px; }
    .total-row { display: flex; justify-content: space-between; }
    .total-row.grand { font-weight: bold; font-size: 14px; margin-top: 5px; }
    .footer { text-align: center; margin-top: 15px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${settings.business_name || 'Mi Negocio'}</h1>
    ${settings.rfc ? `<p>RFC: ${settings.rfc}</p>` : ''}
    ${settings.address ? `<p>${settings.address}</p>` : ''}
    ${settings.phone ? `<p>Tel: ${settings.phone}</p>` : ''}
    ${settings.email ? `<p>${settings.email}</p>` : ''}
  </div>
  
  <div class="divider"></div>
  
  <p><strong>Ticket:</strong> ${ticketNumber}</p>
  <p><strong>Fecha:</strong> ${formatDate(date)}</p>
  <p><strong>Pago:</strong> Efectivo</p>
  
  <div class="divider"></div>
  
  <div class="items">
    ${cart.map(item => `
      <div class="item">
        <span class="item-name">${item.name}</span>
        <span class="item-qty">x${item.quantity}</span>
        <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
      </div>
    `).join('')}
  </div>
  
  <div class="divider"></div>
  
  <div class="totals">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>${formatCurrency(subtotal)}</span>
    </div>
    <div class="total-row">
      <span>IVA (16%):</span>
      <span>${formatCurrency(tax)}</span>
    </div>
    <div class="total-row grand">
      <span>TOTAL:</span>
      <span>${formatCurrency(total)}</span>
    </div>
  </div>
  
  <div class="footer">
    <p>¡Gracias por su compra!</p>
    <p>Conserve este ticket para cualquier aclaración</p>
  </div>
</body>
</html>
  `;
};

// Print ticket
export const printTicket = (html: string): void => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

export const generateTicketPDF = (data: TicketData): void => {
  const {
    businessName,
    rfc,
    address,
    phone,
    email,
    items,
    subtotal,
    tax,
    total,
    paymentMethod,
    date,
    ticketNumber,
  } = data;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (d: Date) => d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket de Compra - ${ticketNumber}</title>
  <style>
    @page { size: 80mm auto; margin: 5mm; }
    body { 
      font-family: 'Courier New', monospace; 
      font-size: 12px; 
      line-height: 1.4;
      margin: 0;
      padding: 10px;
      max-width: 280px;
    }
    .header { text-align: center; margin-bottom: 15px; }
    .header h1 { font-size: 16px; margin: 0 0 5px 0; }
    .header p { margin: 2px 0; font-size: 11px; }
    .divider { border-top: 1px dashed #000; margin: 10px 0; }
    .item { display: flex; justify-content: space-between; margin: 5px 0; }
    .item-name { flex: 1; }
    .item-qty { width: 30px; text-align: center; }
    .item-price { width: 60px; text-align: right; }
    .totals { margin-top: 10px; }
    .total-row { display: flex; justify-content: space-between; }
    .total-row.grand { font-weight: bold; font-size: 14px; margin-top: 5px; }
    .footer { text-align: center; margin-top: 15px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${businessName || 'Mi Negocio'}</h1>
    ${rfc ? `<p>RFC: ${rfc}</p>` : ''}
    ${address ? `<p>${address}</p>` : ''}
    ${phone ? `<p>Tel: ${phone}</p>` : ''}
    ${email ? `<p>${email}</p>` : ''}
  </div>
  
  <div class="divider"></div>
  
  <p><strong>Ticket:</strong> ${ticketNumber}</p>
  <p><strong>Fecha:</strong> ${formatDate(date)}</p>
  <p><strong>Pago:</strong> ${paymentMethod}</p>
  
  <div class="divider"></div>
  
  <div class="items">
    ${items.map(item => `
      <div class="item">
        <span class="item-name">${item.name}</span>
        <span class="item-qty">x${item.quantity}</span>
        <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
      </div>
    `).join('')}
  </div>
  
  <div class="divider"></div>
  
  <div class="totals">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>${formatCurrency(subtotal)}</span>
    </div>
    <div class="total-row">
      <span>IVA (16%):</span>
      <span>${formatCurrency(tax)}</span>
    </div>
    <div class="total-row grand">
      <span>TOTAL:</span>
      <span>${formatCurrency(total)}</span>
    </div>
  </div>
  
  <div class="footer">
    <p>¡Gracias por su compra!</p>
    <p>Conserve este ticket para cualquier aclaración</p>
  </div>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

export const downloadTicketPDF = (data: TicketData): void => {
  const {
    businessName,
    rfc,
    address,
    phone,
    email,
    items,
    subtotal,
    tax,
    total,
    paymentMethod,
    date,
    ticketNumber,
  } = data;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (d: Date) => d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  let ticketText = `
========================================
${(businessName || 'Mi Negocio').toUpperCase()}
========================================
${rfc ? `RFC: ${rfc}` : ''}
${address ? `${address}` : ''}
${phone ? `Tel: ${phone}` : ''}
${email ? `${email}` : ''}
----------------------------------------
Ticket: ${ticketNumber}
Fecha: ${formatDate(date)}
Pago: ${paymentMethod}
----------------------------------------
PRODUCTOS:
`;

  items.forEach(item => {
    ticketText += `${item.name}\n  ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}\n`;
  });

  ticketText += `----------------------------------------
Subtotal:            ${formatCurrency(subtotal)}
IVA (16%):           ${formatCurrency(tax)}
----------------------------------------
TOTAL:               ${formatCurrency(total)}
========================================
     ¡Gracias por su compra!
     Conserve este ticket
========================================
`;

  const blob = new Blob([ticketText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ticket-${ticketNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
