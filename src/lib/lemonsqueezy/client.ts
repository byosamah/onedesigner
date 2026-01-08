// Removed unused LemonsqueezyClient to prevent initialization errors
// The checkout API uses direct fetch calls to the Lemon Squeezy API

// Product configuration - Update variant IDs when you create products
export const PRODUCTS = {
  // Client match packages
  STARTER_PACK: {
    name: '3 Designer Matches',
    price: 5,
    credits: 3,
    variantId: '937250',
  },
  GROWTH_PACK: {
    name: '10 Designer Matches',
    price: 15,
    credits: 10,
    variantId: '937256',
  },
  SCALE_PACK: {
    name: '25 Designer Matches',
    price: 30,
    credits: 25,
    variantId: '937257',
  },
} as const

export type ProductKey = keyof typeof PRODUCTS