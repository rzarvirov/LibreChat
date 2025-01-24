const { STRIPE_PRODUCT_MAPPING, SUBSCRIPTION_STATUS } = require('./subscriptionConfig');
const User = require('~/models/User');
const Balance = require('~/models/Balance');
const { logger } = require('~/config');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Helper function to reset balance to tier's allowance
async function resetBalanceToTierAllowance(userId, tier) {
  const config = Object.values(STRIPE_PRODUCT_MAPPING).find(p => p.tier === tier);
  if (!config) {
    throw new Error(`Unknown subscription tier: ${tier}`);
  }

  logger.info(`Resetting balance for user ${userId} to ${config.tokenCredits} (${tier} tier allowance)`);
  
  await Balance.findOneAndUpdate(
    { user: userId },
    { tokenCredits: config.tokenCredits },
    { upsert: true, new: true }
  );
}

async function handleSubscriptionCreated(subscription) {
  try {
    logger.info('Processing subscription creation:', subscription.id);
    const { customer: customerId, items, current_period_end, status } = subscription;

    // Skip if subscription is not active
    if (status !== 'active') {
      logger.info(`Skipping subscription ${subscription.id} with status ${status}`);
      return;
    }

    // Fetch the customer to get metadata
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer?.metadata?.userId) {
      throw new Error(`No userId found in customer metadata for customer ${customerId}`);
    }

    const priceId = items.data[0].price.id;
    const subscriptionConfig = STRIPE_PRODUCT_MAPPING[priceId];

    if (!subscriptionConfig) {
      throw new Error(`Unknown price ID: ${priceId}`);
    }

    const userId = customer.metadata.userId;

    // Get current user data to check if this is a downgrade
    const user = await User.findById(userId);
    const currentConfig = Object.values(STRIPE_PRODUCT_MAPPING).find(p => p.tier === user?.subscriptionTier);
    const isDowngrade = currentConfig && currentConfig.tokenCredits > subscriptionConfig.tokenCredits;

    // Update user's subscription status
    const currentDate = new Date();
    const endDate = new Date(current_period_end * 1000);

    await User.findByIdAndUpdate(userId, {
      subscriptionTier: subscriptionConfig.tier,
      subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
      subscriptionStartDate: currentDate,
      subscriptionEndDate: endDate,
      subscriptionCanceled: false,
    });

    // Only reset balance if it's not a downgrade
    if (!isDowngrade) {
      await resetBalanceToTierAllowance(userId, subscriptionConfig.tier);
    }

    logger.info(`Subscription creation completed for user ${userId}`);
  } catch (error) {
    logger.error('Error handling subscription creation:', error);
    logger.error('Subscription data:', JSON.stringify(subscription, null, 2));
    throw error;
  }
}

async function handleSubscriptionRenewal(subscription) {
  try {
    logger.info('Processing subscription renewal:', subscription.id);
    const { customer: customerId, items } = subscription;

    const customer = await stripe.customers.retrieve(customerId);
    if (!customer?.metadata?.userId) {
      throw new Error(`No userId found in customer metadata for customer ${customerId}`);
    }

    const userId = customer.metadata.userId;
    const priceId = items.data[0].price.id;
    const subscriptionConfig = STRIPE_PRODUCT_MAPPING[priceId];

    if (!subscriptionConfig) {
      throw new Error(`Unknown price ID: ${priceId}`);
    }

    // Always reset balance on renewal - this handles downgrades properly
    // as the new period starts with the new tier's allowance
    await resetBalanceToTierAllowance(userId, subscriptionConfig.tier);

    logger.info(`Subscription renewal completed for user ${userId}`);
  } catch (error) {
    logger.error('Error handling subscription renewal:', error);
    logger.error('Subscription data:', JSON.stringify(subscription, null, 2));
    throw error;
  }
}

async function handleSubscriptionCanceled(subscription) {
  try {
    logger.info('Processing subscription cancellation:', subscription.id);
    const { customer: customerId } = subscription;

    const customer = await stripe.customers.retrieve(customerId);
    if (!customer?.metadata?.userId) {
      throw new Error(`No userId found in customer metadata for customer ${customerId}`);
    }

    const userId = customer.metadata.userId;
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: SUBSCRIPTION_STATUS.CANCELED,
      subscriptionCanceled: true,
    });

    // Note: We don't reset balance here - let user keep remaining balance until subscription ends

    logger.info(`Subscription canceled for user ${userId}`);
  } catch (error) {
    logger.error('Error handling subscription cancellation:', error);
    logger.error('Subscription data:', JSON.stringify(subscription, null, 2));
    throw error;
  }
}

async function handleSubscriptionExpired(subscription) {
  try {
    logger.info('Processing subscription expiration:', subscription.id);
    const { customer: customerId } = subscription;

    const customer = await stripe.customers.retrieve(customerId);
    if (!customer?.metadata?.userId) {
      throw new Error(`No userId found in customer metadata for customer ${customerId}`);
    }

    const userId = customer.metadata.userId;
    
    // Update user record to FREE tier
    await User.findByIdAndUpdate(userId, {
      subscriptionTier: 'FREE',
      subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED,
      subscriptionCanceled: false,
      // Clear subscription dates
      subscriptionStartDate: null,
      subscriptionEndDate: null,
    });

    // Reset balance to free tier allowance
    await resetBalanceToTierAllowance(userId, 'FREE');

    logger.info(`Subscription expired for user ${userId}`);
  } catch (error) {
    logger.error('Error handling subscription expiration:', error);
    logger.error('Subscription data:', JSON.stringify(subscription, null, 2));
    throw error;
  }
}

module.exports = {
  handleSubscriptionCreated,
  handleSubscriptionCanceled,
  handleSubscriptionExpired,
  handleSubscriptionRenewal,
}; 