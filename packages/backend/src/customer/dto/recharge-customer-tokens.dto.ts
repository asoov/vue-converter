import { RawBodyRequest } from '@nestjs/common';

export class ChargeCustomerTokensDTO {
  request: RawBodyRequest<any>;
  headers: Headers;
}
