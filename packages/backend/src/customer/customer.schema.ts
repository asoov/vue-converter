import { Schema } from 'dynamoose';
import { Process } from './entities/customer.entity';
export const CustomerSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  aiCredits: {
    type: Number,
  },
  finishedProcesses: {
    type: Array<Process>
  }
});
