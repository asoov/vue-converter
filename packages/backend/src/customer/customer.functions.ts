import { BadRequestException, RawBodyRequest } from '@nestjs/common';
import Stripe from 'stripe';

export const checkStripeSignatureAndReturnEvent = ({
  stripe,
  request,
  stripeSignature,
  endpointSecret,
}: {
  stripe: Stripe;
  request: RawBodyRequest<any>;
  stripeSignature: string;
  endpointSecret: string;
}) => {
  try {
    return stripe.webhooks.constructEvent(
      request.rawBody,
      stripeSignature,
      endpointSecret,
    );
  } catch (err) {
    console.log(`❌ Error message: ${err.message}`);
    throw new BadRequestException(err.message);
  }
};

export const handleStripeEvent = (event: Stripe.Event) => {
  // Cast event data to Stripe object
  if (event.type === 'payment_intent.succeeded') {
    const stripeObject: Stripe.PaymentIntent = event.data
      .object as Stripe.PaymentIntent;
    console.log(`💰 PaymentIntent status: ${stripeObject.status}`);
  } else if (event.type === 'charge.succeeded') {
    const charge = event.data.object as Stripe.Charge;
    console.log(`💵 Charge id: ${charge.id}`);
  } else {
    console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
  }
};
