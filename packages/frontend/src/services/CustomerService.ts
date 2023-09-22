import { BaseService } from "./BaseService";

export class CustomerService extends BaseService {
  constructor(authToken: string) {
    super(authToken)
  }

  public async getCustomer(id: string) {
    return await this.axios.post('/customer/get-customer', {
      id
    })
  }
}