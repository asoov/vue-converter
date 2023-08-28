import { BadRequestException, Injectable, RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { checkStripeSignatureAndReturnEvent } from './checkStripeSignature';
import { handleStripeEvent } from './handleStripeEvent';

@Injectable()
export class PaymentService {
  constructor(private readonly configService: ConfigService) { }

  public async chargeAccountBalance(request: RawBodyRequest<any>, headers: Headers) {
    const stripeSignature = headers['stripe-signature']
    const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_ENDPOINT_SECRET')
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY')
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-08-16' })


    const event = checkStripeSignatureAndReturnEvent({
      stripe,
      request,
      stripeSignature,
      endpointSecret,
    })

    // Successfully constructed event
    console.log('✅ Success:', event.id);


    handleStripeEvent(event)
  }
}
