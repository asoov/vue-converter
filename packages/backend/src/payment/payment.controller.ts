import { Body, Controller, Headers, Post, RawBodyRequest, Req } from "@nestjs/common";
import { PaymentService } from "./payment.service";

@Controller('webhook')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post()
  public async handlePayment(@Req() req: RawBodyRequest<Request>, @Headers() headers) {
    return this.paymentService.chargeAccountBalance(req, headers)
  }
}