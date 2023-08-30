import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
  handleStripeEvent,
  checkStripeSignatureAndReturnEvent,
} from './customer.functions';
import { ConfigService } from '@nestjs/config';
import { Model } from 'dynamoose/dist/Model';
import { Customer } from './entities/customer.entity';
import { ChargeCustomerTokensDTO } from './dto/recharge-customer-tokens.dto';

@Injectable()
export class CustomerService {
  private dbInstance: Model<Customer>;

  constructor(private readonly configService: ConfigService) {}

  public async chargeAccountTokenBalance({
    request,
    headers,
  }: ChargeCustomerTokensDTO) {
    const stripeSignature = headers['stripe-signature'];
    const endpointSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_ENDPOINT_SECRET',
    );
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-08-16' });

    const event = checkStripeSignatureAndReturnEvent({
      stripe,
      request,
      stripeSignature,
      endpointSecret,
    });

    // Successfully constructed event
    console.log('✅ Success:', event.id);

    handleStripeEvent(event);
  }
}
