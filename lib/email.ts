// lib/email.ts
// Serviciu de Notificări Email pentru Comenzi TopinStock
// - Trimite email de confirmare către client cu sumarul complet al comenzii
// - Trimite alertă de comandă nouă către administrator
// - Suportă SMTP real (SmarterMail, Gmail, Sendgrid, Resend) sau mod simulat de dezvoltare/logare

import nodemailer from 'nodemailer';

interface OrderItemEmailData {
  title: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

interface OrderEmailPayload {
  orderId: string;
  orderNumber: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shipping: {
    county: string;
    city: string;
    address: string;
    notes?: string;
  };
  paymentMethod: 'ramburs' | 'card';
  items: OrderItemEmailData[];
  totalAmount: number;
  deliveryFee?: number;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = port === 465;

  if (!host || !user || !pass) {
    return null; // SMTP neconfigurat încă în .env
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Generează șablonul HTML profesional în stil eMAG pentru confirmarea comenzii
 */
function buildCustomerEmailHtml(payload: OrderEmailPayload): string {
  const { orderNumber, customer, shipping, paymentMethod, items, totalAmount } = payload;
  const deliveryFee = payload.deliveryFee ?? 19;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const paymentMethodLabel = paymentMethod === 'card' ? 'Plată online cu cardul' : 'Plată la livrare (Ramburs la curier)';

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7;">
          <strong style="color: #1a202c; font-size: 14px; display: block;">${item.title}</strong>
          ${item.size ? `<span style="font-size: 12px; color: #718096;">Mărime: ${item.size} </span>` : ''}
          ${item.color ? `<span style="font-size: 12px; color: #718096;">Culoare: ${item.color}</span>` : ''}
        </td>
        <td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #edf2f7; color: #4a5568; font-size: 14px;">
          ${item.quantity} buc.
        </td>
        <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #edf2f7; color: #1a202c; font-weight: bold; font-size: 14px;">
          ${(item.price * item.quantity).toFixed(2)} LEI
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmare Comandă ${orderNumber} - TOPinStock</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 24px 0; color: #2d3748;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background-color: #004f61; padding: 28px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">
        TOPin<span style="color: #F5436A;">Stock</span>
      </h1>
      <p style="color: rgba(255, 255, 255, 0.85); font-size: 13px; margin: 6px 0 0 0;">
        Marketplace-ul tău de încredere
      </p>
    </div>

    <!-- Hero Status -->
    <div style="padding: 32px 24px 20px 24px; text-align: center; border-bottom: 1px solid #edf2f7;">
      <div style="display: inline-block; background-color: #def7ec; color: #03543f; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px;">
        ✓ Comandă Confirmată
      </div>
      <h2 style="font-size: 22px; font-weight: 800; color: #1a202c; margin: 0 0 8px 0;">
        Îți mulțumim pentru comandă, ${customer.fullName}!
      </h2>
      <p style="font-size: 14px; color: #718096; margin: 0; line-height: 1.5;">
        Comanda ta cu numărul <strong style="color: #004f61;">${orderNumber}</strong> a fost preluată. Pregătim coletul pentru predare către curierul rapid.
      </p>
    </div>

    <!-- Products Table -->
    <div style="padding: 24px;">
      <h3 style="font-size: 15px; font-weight: bold; color: #1a202c; margin: 0 0 12px 0;">
        Produse comandate
      </h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid #edf2f7;">
            <th style="padding: 8px 8px; font-size: 12px; color: #a0aec0; text-transform: uppercase;">Produs</th>
            <th style="padding: 8px 8px; font-size: 12px; color: #a0aec0; text-transform: uppercase; text-align: center;">Cantitate</th>
            <th style="padding: 8px 8px; font-size: 12px; color: #a0aec0; text-transform: uppercase; text-align: right;">Preț</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #edf2f7;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0; color: #718096;">Subtotal produse:</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #1a202c;">${subtotal.toFixed(2)} LEI</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #718096;">Livrare prin curier rapid:</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #1a202c;">${deliveryFee.toFixed(2)} LEI</td>
          </tr>
          <tr style="border-top: 1px solid #edf2f7;">
            <td style="padding: 12px 0 4px 0; font-size: 17px; font-weight: 800; color: #1a202c;">Total de plată:</td>
            <td style="padding: 12px 0 4px 0; text-align: right; font-size: 20px; font-weight: 900; color: #004f61;">${totalAmount.toFixed(2)} LEI</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Shipping & Payment Details -->
    <div style="background-color: #f8fafc; padding: 20px 24px; border-top: 1px solid #edf2f7;">
      <h3 style="font-size: 14px; font-weight: bold; color: #1a202c; margin: 0 0 10px 0;">
        Detalii livrare & plată
      </h3>
      <p style="font-size: 13px; color: #4a5568; margin: 4px 0;">
        <strong>Adresă livrare:</strong> ${shipping.address}, ${shipping.city}, Jud. ${shipping.county}
      </p>
      <p style="font-size: 13px; color: #4a5568; margin: 4px 0;">
        <strong>Telefon destinatar:</strong> ${customer.phone}
      </p>
      <p style="font-size: 13px; color: #4a5568; margin: 4px 0;">
        <strong>Metodă de plată:</strong> ${paymentMethodLabel}
      </p>
      ${shipping.notes ? `<p style="font-size: 13px; color: #4a5568; margin: 4px 0;"><strong>Observații:</strong> ${shipping.notes}</p>` : ''}
    </div>

    <!-- Footer Help -->
    <div style="padding: 24px; text-align: center; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0; line-height: 1.5;">
      <p style="margin: 0 0 8px 0;">
        Ai întrebări despre comanda ta? Răspunde direct la acest email sau scrie-ne la <a href="mailto:contact@topinstock.ro" style="color: #004f61; font-weight: bold; text-decoration: none;">contact@topinstock.ro</a>.
      </p>
      <p style="margin: 0;">
        © ${new Date().getFullYear()} TOPinStock S.R.L. • Toate drepturile rezervate.
      </p>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Trimite emailul de confirmare către cumpărător
 */
export async function sendOrderConfirmationEmail(payload: OrderEmailPayload): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || '"TOPinStock" <comenzi@topinstock.ro>';

    const html = buildCustomerEmailHtml(payload);
    const subject = `Confirmare Comandă ${payload.orderNumber} - TOPinStock`;

    if (!transporter) {
      // Mod simulat de siguranță când SMTP nu este încă setat în variabilele de mediu
      console.log(`[EMAIL SIMULAT] Trimitere confirmare comandă către ${payload.customer.email} (${subject})`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from,
      to: payload.customer.email,
      subject,
      html,
    });

    console.log(`[EMAIL TRIMIS] Confirmare livrată cu succes către ${payload.customer.email}. MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[EMAIL ERROR] Eroare la trimiterea confirmării:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Trimite alertă către administrator când se plasează o comandă nouă
 */
export async function sendAdminOrderAlert(payload: OrderEmailPayload): Promise<{ success: boolean; simulated?: boolean }> {
  try {
    const transporter = getTransporter();
    const adminEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'admin@topinstock.ro';
    const from = process.env.SMTP_FROM || '"TOPinStock Alerte" <noreply@topinstock.ro>';

    const subject = `🔔 Comandă nouă ${payload.orderNumber} - ${payload.customer.fullName} (${payload.totalAmount} LEI)`;
    const html = `
      <h2>Comandă nouă pe TOPinStock!</h2>
      <p><strong>Număr comandă:</strong> ${payload.orderNumber}</p>
      <p><strong>Client:</strong> ${payload.customer.fullName} (${payload.customer.phone}, ${payload.customer.email})</p>
      <p><strong>Destinație:</strong> ${payload.shipping.city}, ${payload.shipping.address}</p>
      <p><strong>Total de încasat:</strong> ${payload.totalAmount} LEI (${payload.paymentMethod})</p>
      <p><strong>Articole:</strong> ${payload.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}</p>
      <br/>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://topinstock.ro'}/admin/comenzi" style="background-color: #004f61; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        Vezi comanda în panoul de administrare
      </a>
    `;

    if (!transporter) {
      console.log(`[EMAIL SIMULAT ADMIN] Notificare trimisă către ${adminEmail}: ${subject}`);
      return { success: true, simulated: true };
    }

    await transporter.sendMail({
      from,
      to: adminEmail,
      subject,
      html,
    });

    return { success: true };
  } catch (err) {
    console.error('[EMAIL ERROR ADMIN] Eroare la trimiterea alertei:', err);
    return { success: false };
  }
}
