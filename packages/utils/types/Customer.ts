import { Process } from "src/customer/entities/customer.entity";

export class Customer {
  id: string;
  firstName: string;
  lastName: string;
  paid: boolean;
  aiCredits: number;
  finishedProcesses: Array<Process>
}



