// ============================================
//   TopinStock Security & Transaction Logic
//   - Input Sanitization (XSS & Injection Protection)
//   - Strict Server-Side Financial Calculations
//   - Promo Codes & Vouchers Engine with Expiry Rules
//   - Anti-Race-Condition Stock Manager
// ============================================

export const STANDARD_VAT_RATE = 0.19; // 19% TVA in Romania
export const FLAT_DELIVERY_FEE = 19; // Flat 19 LEI delivery fee
export const FREE_DELIVERY_THRESHOLD = 300; // Free delivery for orders >= 300 LEI
export const MINIMUM_ORDER_AMOUNT = 50; // Valoare minimă comandă: 50 LEI

export interface PromoCodeDefinition {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number; // e.g. 10 for 10%, 15 for 15 LEI
  minOrderAmount: number;
  maxDiscount?: number;
  validUntil: string; // ISO date string YYYY-MM-DD
  description: string;
  isActive: boolean;
}

// Active and test promo codes catalog
export const PROMO_CODES: Record<string, PromoCodeDefinition> = {
  TOP10: {
    code: 'TOP10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 100,
    maxDiscount: 50,
    validUntil: '2026-12-31',
    description: '10% reducere pentru comenzi de minim 100 LEI (max. 50 LEI)',
    isActive: true,
  },
  WELCOME15: {
    code: 'WELCOME15',
    type: 'fixed',
    value: 15,
    minOrderAmount: 120,
    validUntil: '2026-12-31',
    description: '15 LEI reducere cadou de bun venit la comenzi peste 120 LEI',
    isActive: true,
  },
  LIVRAREGRATIS: {
    code: 'LIVRAREGRATIS',
    type: 'free_shipping',
    value: FLAT_DELIVERY_FEE,
    minOrderAmount: 150,
    validUntil: '2026-12-31',
    description: 'Livrare gratuită pentru comenzi de minim 150 LEI',
    isActive: true,
  },
  EXPIREDTEST: {
    code: 'EXPIREDTEST',
    type: 'fixed',
    value: 20,
    minOrderAmount: 50,
    validUntil: '2023-01-01', // Expired
    description: 'Cod promoțional expirat pentru teste de securitate',
    isActive: true,
  },
  DISABLEDTEST: {
    code: 'DISABLEDTEST',
    type: 'fixed',
    value: 20,
    minOrderAmount: 50,
    validUntil: '2026-12-31',
    description: 'Cod promoțional dezactivat',
    isActive: false,
  },
};

// ── 1. Input Sanitization Helpers ──────────────

/**
 * Sanitizes generic user text inputs by stripping HTML tags,
 * dangerous javascript pseudo-protocols, and limiting string length.
 */
export function sanitizeText(input: unknown, maxLength = 255): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip script protocol
    .replace(/[<>'"&]/g, (char) => {
      // Basic entity escaping for critical characters
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes and validates an email address.
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  const cleaned = email.toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned) || cleaned.length > 120) {
    return '';
  }
  return cleaned;
}

/**
 * Sanitizes and validates Romanian and international phone numbers.
 */
export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== 'string') return '';
  // Keep only digits and leading plus sign
  const cleaned = phone.replace(/[^\d+]/g, '').trim();
  if (cleaned.length < 8 || cleaned.length > 16) {
    return '';
  }
  return cleaned;
}

// ── 2. Server-Side Promo Code Validation ────────

export interface PromoValidationResult {
  isValid: boolean;
  code?: string;
  discountAmount: number;
  freeShipping: boolean;
  message: string;
}

export function validatePromoCode(rawCode: unknown, subtotal: number): PromoValidationResult {
  if (!rawCode || typeof rawCode !== 'string') {
    return { isValid: false, discountAmount: 0, freeShipping: false, message: '' };
  }

  const normalized = rawCode.trim().toUpperCase();
  const promo = PROMO_CODES[normalized];

  if (!promo) {
    return {
      isValid: false,
      discountAmount: 0,
      freeShipping: false,
      message: 'Codul promoțional introdus nu este valid.',
    };
  }

  if (!promo.isActive) {
    return {
      isValid: false,
      discountAmount: 0,
      freeShipping: false,
      message: 'Acest cod promoțional a fost dezactivat.',
    };
  }

  // Check expiration date
  const now = new Date();
  const expiryDate = new Date(`${promo.validUntil}T23:59:59.999Z`);
  if (now > expiryDate) {
    return {
      isValid: false,
      discountAmount: 0,
      freeShipping: false,
      message: 'Acest cod promoțional a expirat.',
    };
  }

  // Check minimum order amount
  if (subtotal < promo.minOrderAmount) {
    return {
      isValid: false,
      discountAmount: 0,
      freeShipping: false,
      message: `Comanda minimă pentru a aplica codul ${promo.code} este de ${promo.minOrderAmount} LEI (totalul curent: ${subtotal.toFixed(2)} LEI).`,
    };
  }

  let discountAmount = 0;
  let freeShipping = false;

  if (promo.type === 'percentage') {
    discountAmount = Math.round((subtotal * (promo.value / 100)) * 100) / 100;
    if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
      discountAmount = promo.maxDiscount;
    }
  } else if (promo.type === 'fixed') {
    discountAmount = Math.min(promo.value, subtotal);
  } else if (promo.type === 'free_shipping') {
    freeShipping = true;
  }

  return {
    isValid: true,
    code: promo.code,
    discountAmount: Math.round(discountAmount * 100) / 100,
    freeShipping,
    message: `Codul ${promo.code} a fost aplicat cu succes!`,
  };
}

// ── 3. Strict Server-Side Financials & TVA ───────

export interface OrderFinancials {
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  taxBase: number; // Valoare fără TVA (baza impozabilă)
  vatAmount: number; // TVA 19% inclusă
  isFreeDelivery: boolean;
}

export function calculateOrderFinancials(
  serverSubtotal: number,
  promoDiscount = 0,
  promoFreeShipping = false
): OrderFinancials {
  const cleanSubtotal = Math.max(0, Math.round(serverSubtotal * 100) / 100);
  const cleanDiscount = Math.min(cleanSubtotal, Math.max(0, Math.round(promoDiscount * 100) / 100));
  
  const discountedSubtotal = Math.max(0, cleanSubtotal - cleanDiscount);

  // Delivery fee rules: free if subtotal >= threshold or promo free shipping
  const isFreeDelivery = cleanSubtotal >= FREE_DELIVERY_THRESHOLD || promoFreeShipping || cleanSubtotal === 0;
  const deliveryFee = isFreeDelivery ? 0 : FLAT_DELIVERY_FEE;

  const totalAmount = Math.round((discountedSubtotal + deliveryFee) * 100) / 100;

  // TVA calculation (19% standard Romanian VAT included in final consumer price)
  // totalAmount = taxBase * 1.19  ==>  taxBase = totalAmount / 1.19
  const taxBase = Math.round((totalAmount / (1 + STANDARD_VAT_RATE)) * 100) / 100;
  const vatAmount = Math.round((totalAmount - taxBase) * 100) / 100;

  return {
    subtotal: cleanSubtotal,
    deliveryFee,
    discountAmount: cleanDiscount,
    totalAmount,
    taxBase,
    vatAmount,
    isFreeDelivery,
  };
}
