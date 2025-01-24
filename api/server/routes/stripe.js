const express = require('express');
const mainRouter = express.Router();
const webhookRouter = express.Router();
const { requireJwtAuth } = require('~/server/middleware');
const { createCheckoutSession } = require('~/server/services/Stripe');
const { 
  handleSubscriptionCreated, 
  handleSubscriptionCanceled, 
  handleSubscriptionExpired,
  handleSubscriptionRenewal 
} = require('~/server/services/Stripe/subscriptionService');
const cookies = require('cookie');
const jwt = require('jsonwebtoken');
const { getUserById } = require('~/models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { logger } = require('~/config');

const extractToken = (req) => {
  // First try to get token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Then try to get token from cookies
  const refreshToken = req.headers.cookie ? cookies.parse(req.headers.cookie).refreshToken : null;
  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      return jwt.sign({ id: payload.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    } catch (err) {
      return null;
    }
  }

  return null;
};

const authenticateUser = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      logger.error('No token found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.id) {
      logger.error('No user ID in token payload');
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const user = await getUserById(payload.id);
    if (!user) {
      logger.error(`User not found for ID: ${payload.id}`);
      return res.status(401).json({ error: 'User not found' });
    }

    logger.info('Authentication successful for user:', {
      id: user.id || user._id,
      email: user.email
    });

    // Ensure we're using the string version of the ID
    req.user = {
      ...user,
      id: user.id || user._id.toString()
    };
    
    next();
  } catch (err) {
    logger.error('Authentication error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Create checkout session
mainRouter.post('/create-checkout-session', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    logger.info('User object in request:', {
      id: req.user.id,
      email: req.user.email
    });

    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    logger.info(`Creating checkout session with price ID: ${priceId} for user ${req.user.id} with email ${req.user.email}`);
    const session = await createCheckoutSession(priceId, req.user.id, req.user.email);
    res.json({ url: session.url });
  } catch (error) {
    logger.error('Error in create-checkout-session:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

// Cancel subscription
mainRouter.post('/cancel-subscription', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    logger.info('User object in request:', {
      id: req.user.id,
      email: req.user.email
    });

    // Get the customer ID from Stripe
    const customers = await stripe.customers.list({
      email: req.user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const customer = customers.data[0];

    // Get the customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = subscriptions.data[0];

    // Cancel the subscription at period end
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    // Update user's subscription status in our database
    const User = require('~/models/User');
    
    await User.findByIdAndUpdate(req.user.id, {
      subscriptionCanceled: true,
    });

    logger.info(`Updated subscription to canceled for user ${req.user.id}`);
    res.json({ message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error) {
    logger.error('Error in cancel-subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
  }
});

// Reactivate subscription
mainRouter.post('/reactivate-subscription', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    logger.info('User object in request:', {
      id: req.user.id,
      email: req.user.email
    });

    // Get the customer ID from Stripe
    const customers = await stripe.customers.list({
      email: req.user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const customer = customers.data[0];

    // Get the customer's subscriptions including those scheduled for cancellation
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = subscriptions.data[0];

    // If subscription is scheduled to be cancelled, remove the cancellation
    if (subscription.cancel_at_period_end) {
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: false,
      });

      // Update user's subscription status in our database
      const User = require('~/models/User');
      await User.findByIdAndUpdate(req.user.id, {
        subscriptionCanceled: false,
      });

      logger.info(`Reactivated subscription for user ${req.user.id}`);
      res.json({ message: 'Subscription reactivated successfully' });
    } else {
      res.status(400).json({ error: 'Subscription is not scheduled for cancellation' });
    }
  } catch (error) {
    logger.error('Error in reactivate-subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to reactivate subscription' });
  }
});

// Change subscription plan
mainRouter.post('/change-subscription', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    logger.info(`Changing subscription plan for user ${req.user.id} to price ID: ${priceId}`);

    // Get the customer from Stripe
    const customers = await stripe.customers.list({
      email: req.user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'No customer found' });
    }

    const customer = customers.data[0];

    // Get current subscription
    const currentSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (currentSubscriptions.data.length === 0) {
      // If no active subscription, create a new one
      logger.info('No active subscription found, creating new subscription');
      const session = await createCheckoutSession(priceId, req.user.id, req.user.email);
      return res.json({ url: session.url });
    }

    const currentSubscription = currentSubscriptions.data[0];
    const currentPriceId = currentSubscription.items.data[0].price.id;

    // Get the prices to compare
    const [newPrice, currentPrice] = await Promise.all([
      stripe.prices.retrieve(priceId),
      stripe.prices.retrieve(currentPriceId)
    ]);

    const isUpgrade = newPrice.unit_amount > currentPrice.unit_amount;

    // Handle upgrade vs downgrade differently
    if (isUpgrade) {
      // For upgrades, switch immediately with proration
      logger.info('Processing immediate upgrade');
      const subscription = await stripe.subscriptions.update(currentSubscription.id, {
        items: [{
          id: currentSubscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: 'always_invoice', // This will create a prorated invoice
      });

      res.json({ 
        message: 'Subscription upgraded successfully',
        subscription 
      });
    } else {
      // For downgrades, schedule the change for next period
      logger.info('Scheduling downgrade for next period');
      const subscription = await stripe.subscriptions.update(currentSubscription.id, {
        items: [{
          id: currentSubscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: 'none',
        billing_cycle_anchor: 'now',
        cancel_at_period_end: false, // Ensure any pending cancellations are removed
      });

      // Update user's subscription status
      const User = require('~/models/User');
      await User.findByIdAndUpdate(req.user.id, {
        subscriptionCanceled: false, // Reset cancellation status if it was set
      });

      res.json({ 
        message: 'Subscription change scheduled for next billing period',
        subscription 
      });
    }
  } catch (error) {
    logger.error('Error in change-subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to change subscription' });
  }
});

// Webhook handler
webhookRouter.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const rawBody = req.body;

  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      logger.error('STRIPE_WEBHOOK_SECRET is not configured in environment');
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    logger.info('Received webhook request with headers:', {
      'stripe-signature': sig,
      'content-type': req.headers['content-type']
    });
    
    if (!sig) {
      throw new Error('No Stripe signature found in request headers');
    }

    if (!Buffer.isBuffer(rawBody)) {
      logger.error('Webhook body is not a buffer:', typeof rawBody);
      throw new Error('Webhook body must be raw');
    }

    logger.info('Attempting to construct webhook event with:', {
      bodyLength: rawBody.length,
      sigLength: sig.length,
      secretLength: process.env.STRIPE_WEBHOOK_SECRET.length
    });

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    logger.info('Webhook event constructed successfully:', event.type);
  } catch (err) {
    logger.error('Webhook error details:', {
      message: err.message,
      bodyType: typeof rawBody,
      isBuffer: Buffer.isBuffer(rawBody),
      headerKeys: Object.keys(req.headers)
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        logger.info('Processing checkout session completed event:', {
          sessionId: event.data.object.id,
          customerId: event.data.object.customer
        });
        // The subscription will be handled by the customer.subscription.created event
        break;
      case 'customer.subscription.created':
        logger.info('Processing subscription created event:', {
          subscriptionId: event.data.object.id,
          customerId: event.data.object.customer
        });
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        logger.info('Processing subscription deleted event');
        await handleSubscriptionCanceled(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        logger.info('Processing invoice payment succeeded event');
        const invoice = event.data.object;
        // Only handle subscription invoices
        if (invoice.subscription) {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          // Check if this is a renewal (not the first payment)
          if (invoice.billing_reason === 'subscription_cycle') {
            await handleSubscriptionRenewal(subscription);
          }
        }
        break;
      case 'customer.subscription.updated':
        logger.info('Processing subscription updated event');
        const subscription = event.data.object;
        
        // Check if the subscription is marked for cancellation at period end
        if (subscription.cancel_at_period_end) {
          logger.info('Subscription is marked for cancellation at period end');
          // Don't update the subscription status, as it's already handled by the cancel endpoint
          break;
        }

        // Only handle other status changes
        if (subscription.status === 'active' && !subscription.cancel_at_period_end) {
          await handleSubscriptionCreated(subscription);
        } else if (subscription.status === 'canceled') {
          await handleSubscriptionCanceled(subscription);
        } else if (subscription.status === 'unpaid' || subscription.status === 'past_due') {
          await handleSubscriptionExpired(subscription);
        }
        break;
      default:
        logger.info(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Error processing webhook:', err);
    logger.error('Event data:', JSON.stringify(event.data, null, 2));
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = {
  mainRouter,
  webhookRouter
}; 