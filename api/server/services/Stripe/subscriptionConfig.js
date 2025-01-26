const SUBSCRIPTION_TIERS = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  PRO: 'PRO',
  PROPLUS: 'PROPLUS',
};

const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  ACTIVE_UNTIL_END: 'ACTIVE_UNTIL_END', // For subscriptions that are cancelled but still active until end date
  CANCELED: 'CANCELED',
  EXPIRED: 'EXPIRED',
};

// Map Stripe products/prices to our subscription tiers
const STRIPE_PRODUCT_MAPPING = {
  [process.env.STRIPE_PRICE_BASIC_EN]: {
    tier: SUBSCRIPTION_TIERS.BASIC,
    tokenCredits: 350000,
    durationMonths: 1,
  },
  [process.env.STRIPE_PRICE_PRO_EN]: {
    tier: SUBSCRIPTION_TIERS.PRO,
    tokenCredits: 1000000,
    durationMonths: 1,
  },
  [process.env.STRIPE_PRICE_PROPLUS_EN]: {
    tier: SUBSCRIPTION_TIERS.PROPLUS,
    tokenCredits: 3000000,
    durationMonths: 1,
  },
  // Add other product mappings here as needed
};

module.exports = {
  SUBSCRIPTION_TIERS,
  SUBSCRIPTION_STATUS,
  STRIPE_PRODUCT_MAPPING,
}; 