import { BadRequestException, RawBodyRequest } from "@nestjs/common";
import Stripe from "stripe";


export const checkStripeSignatureAndReturnEvent = ({
  stripe,
  request,
  stripeSignature,
  endpointSecret
}: {
  stripe: Stripe,
  request: RawBodyRequest<any>,
  stripeSignature: string,
  endpointSecret: string
}) => {
  try {
    return stripe.webhooks.constructEvent(request.rawBody, stripeSignature, endpointSecret);
  } catch (err) {
    console.log(`❌ Error message: ${err.message}`);
    throw new BadRequestException(err.message)
  }
}