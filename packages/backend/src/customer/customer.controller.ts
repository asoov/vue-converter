import {
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('charge-tokens')
  public async chargeAccountTokenBalance(
    @Req() request: RawBodyRequest<Request>,
    @Headers() headers,
  ) {
    return this.customerService.chargeAccountTokenBalance({ request, headers });
  }
}
