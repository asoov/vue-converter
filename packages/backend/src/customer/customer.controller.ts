import { Controller, Headers, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { AuthorizationGuard } from 'src/authorization/authorization.guard';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Post('get-customer')
  @UseGuards(AuthorizationGuard)
  public async getCustomer(): Promise<any> {
    return new Promise(res => setTimeout(() => res({
      name: 'Donald Trump'
    }), 10))
  }

  @Post('charge-tokens')
  public async chargeAccountTokenBalance(
    @Req() request: RawBodyRequest<Request>,
    @Headers() headers,
  ) {
    return this.customerService.chargeAccountTokenBalance({ request, headers });
  }
}
