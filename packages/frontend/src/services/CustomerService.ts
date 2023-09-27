import { BaseService } from "./BaseService";

export class CustomerService extends BaseService {
  constructor(authToken: string) {
    super(authToken)
  }

  public async getCustomer<T, R>(id?: string) {
    if (!id) throw new Error('CustomerService: No customer id provided')
    return await this.axios.post<T, R>('/customer/get-customer', {
      id
    })
  }
}