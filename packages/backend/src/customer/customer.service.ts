import { BadRequestException, Injectable, InternalServerErrorException, RawBodyRequest, ServiceUnavailableException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Model } from 'dynamoose/dist/Model';
import { Customer } from './entities/customer.entity';
import { ChargeCustomerTokensDTO } from './dto/recharge-customer-tokens.dto';
import * as dynamoose from 'dynamoose'
import { CustomerSchema } from './customer.schema';
import { CloudWatchLogsService } from '../providers/cloudwatch-logs.service';
import { UtilityService } from '../providers/utility.provider';
import { CustomerRepository } from './customer.repository';


@Injectable()
export class CustomerService {
  private dbInstance: Model<Customer>;
  constructor(
    private readonly configService: ConfigService,
    private readonly utilityService: UtilityService,
    private readonly cloudWatchLogsService: CloudWatchLogsService,
    private readonly customerRepository: CustomerRepository
  ) {
    this.dbInstance = dynamoose.model<Customer>('VueConverterTable2', CustomerSchema)
  }

  public async getCustomerById(id: string): Promise<Customer> {
    const customerId = this.utilityService.removeAuth0Prefix(id)
    return await this.customerRepository.getById(customerId)
  }


  public async createCustomerFromAuth0(customer: Customer): Promise<Customer> {
    try {
      const customerId = this.utilityService.removeAuth0Prefix(customer.id)
      const customerExisting = await this.getCustomerById(customerId)
      if (customerExisting) {
        return customerExisting
      }
      const data = await this.dbInstance.create({ ...customer, id: customerId, finishedProcesses: [] })
      return data
    } catch (e) {
      console.log(e)
      throw new InternalServerErrorException()
    }
  }

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

    const event = this.checkStripeSignatureAndReturnEvent({
      stripe,
      request,
      stripeSignature,
      endpointSecret,
    });

    // Successfully constructed event
    console.log('✅ Success:', event.id);

    this.handleStripeEvent(event);
  }


  private handleStripeEvent(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      this.handleCheckoutSessionCompleted(event)
    } else {
      console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
    }
  };

  private async handleCheckoutSessionCompleted(event: Stripe.Event) {
    const eventDataObject = event.data.object as Stripe.Checkout.Session
    if (!eventDataObject.client_reference_id) {
      this.logErrorToCloudwatch(`Stripe hook didn't provide a client_reference_id: ${eventDataObject.toString()}`)
      throw new BadRequestException('Charging the account with tokens went wrong')
    }
    const customerId = eventDataObject.client_reference_id
    const tokenAmount = eventDataObject.amount_total

    await this.writeTokensToCustomerDB({ customerId, purchasedTokenCount: tokenAmount })
  }

  private checkStripeSignatureAndReturnEvent({
    stripe,
    request,
    stripeSignature,
    endpointSecret,
  }: {
    stripe: Stripe;
    request: RawBodyRequest<any>;
    stripeSignature: string;
    endpointSecret: string;
  }) {
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

  private async writeTokensToCustomerDB({ customerId, purchasedTokenCount }: { customerId: string, purchasedTokenCount: number }) {
    if (!customerId || !purchasedTokenCount) {
      this.logErrorToCloudwatch('writeTokensToCustomerDB: Couldnt update token count in customer db due to either missing customer Id or token count')
    }
    const customer = await this.getCustomerById(customerId)

    try {
      const newTokenCount = customer.aiCredits + purchasedTokenCount
      await this.dbInstance.update({ id: customerId }, {
        aiCredits: newTokenCount
      })
    } catch (error) {
      this.logErrorToCloudwatch(`writeTokensToCustomerDB: Something went wrong writing to customer ${customerId}, purchasedTokenCount: ${purchasedTokenCount}`)
      throw new InternalServerErrorException(error)
    }

  }

  private logErrorToCloudwatch(message: string) {
    this.cloudWatchLogsService.logMessage(message)
  }
}
