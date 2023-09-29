import { CustomerModel } from "./customer.schema";
import { Customer } from "./entities/customer.entity";


export class CustomerRepository {
  async getById(id: string): Promise<Customer> {
    return await CustomerModel.get(id);
  }

  async create(customer: Partial<Customer>): Promise<Customer> {
    return await CustomerModel.create(customer);
  }

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    return await CustomerModel.update({ id }, updates);
  }
}