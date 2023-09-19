import { Body, Controller, Headers, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { AuthorizationGuard } from 'src/authorization/authorization.guard';
import { Customer } from './entities/customer.entity';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Post('get-customer')
  @UseGuards(AuthorizationGuard)
  public async getCustomer(@Body() { id }: Customer): Promise<Customer> {
    console.log(id)
    return await this.customerService.getCustomerById(id)
  }

  @Post('create-customer-from-auth0')
  @UseGuards(AuthorizationGuard)
  public async createCustomer(@Body() customer: Customer): Promise<Customer> {
    return await this.customerService.createCustomerFromAuth0(customer)
  }

  @Post('charge-tokens')
  public async chargeAccountTokenBalance(
    @Req() request: RawBodyRequest<Request>,
    @Headers() headers,
  ) {
    return this.customerService.chargeAccountTokenBalance({ request, headers });
  }
}
