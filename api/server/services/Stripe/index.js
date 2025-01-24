const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(priceId, userId, userEmail) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  if (!process.env.DOMAIN_CLIENT) {
    throw new Error('DOMAIN_CLIENT is not configured');
  }

  try {
    console.log('Creating checkout session for user:', userId, 'email:', userEmail);

    // Create or get customer
    let customer;
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customer = customers.data[0];
      // Update customer metadata if it doesn't have userId
      if (!customer.metadata.userId) {
        customer = await stripe.customers.update(customer.id, {
          metadata: { userId },
        });
      }
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });
    }

    console.log('Using customer:', customer.id, 'with metadata:', customer.metadata);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.DOMAIN_CLIENT}/#/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN_CLIENT}/#/subscription/cancel`,
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    });

    console.log('Checkout session created:', session.id);
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.error('Invalid price ID or other Stripe configuration issue:', error);
    }
    throw error;
  }
}

module.exports = {
  createCheckoutSession,
}; 