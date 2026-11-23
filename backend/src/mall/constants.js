/** Slugs that static Next.js routes already own. */
export const RESERVED_SLUGS = [
  'cart',
  'checkout',
  'search',
  'account',
  'track',
  'wishlist',
  'for',
  'age',
  'budget',
  'order',
  'api',
  'blog',
  'admin',
];

export const AUDIENCES = ['baby', 'boys', 'girls', 'unisex'];
export const AGE_BANDS = ['0-1', '1-3', '3-6', '6-12', '12-plus'];
export const YOUNG_AGE_BANDS = ['0-1', '1-3', '3-6', '6-12'];

/** All methods ever stored on orders (legacy included). */
export const PAYMENT_METHODS = ['cod', 'jazzcash', 'easypaisa', 'bank'];

/** Methods currently offered at checkout. */
export const CHECKOUT_PAYMENT_METHODS = ['cod', 'jazzcash', 'easypaisa'];

export function paymentAccounts() {
  return {
    cod: {
      id: 'cod',
      label: 'Cash on delivery',
      hint: 'Pay the rider when your parcel arrives.',
      accent: '#0F766E',
      requiresReceipt: false,
    },
    jazzcash: {
      id: 'jazzcash',
      label: 'JazzCash',
      hint: 'Send payment, then attach your receipt screenshot.',
      accountName: process.env.JAZZCASH_ACCOUNT_NAME || 'Masti Mall',
      accountNumber: process.env.JAZZCASH_ACCOUNT || '03001234567',
      accent: '#E31C79',
      requiresReceipt: true,
    },
    easypaisa: {
      id: 'easypaisa',
      label: 'EasyPaisa',
      hint: 'Send payment, then attach your receipt screenshot.',
      accountName: process.env.EASYPAISA_ACCOUNT_NAME || 'Masti Mall',
      accountNumber: process.env.EASYPAISA_ACCOUNT || '03007654321',
      accent: '#00A838',
      requiresReceipt: true,
    },
  };
}
export const ORDER_STATUSES = ['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

/** Fallback free-delivery threshold (PKR). Live value lives in MallSetting "shipping". */
export const FREE_SHIPPING_AT = 3000;

export const SORTS = {
  popular: { isFeatured: -1, ratingAvg: -1, createdAt: -1 },
  new: { createdAt: -1 },
  'price-asc': { effectivePrice: 1 },
  'price-desc': { effectivePrice: -1 },
};
