import * as dynamoose from 'dynamoose'
import { Customer } from './entities/customer.entity';

export const CustomerSchema = new dynamoose.Schema({
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
    type: Array,
    schema: [{
      type: Object,
      schema: {
        timestamp: String,
        bucketName: String,
        fileCount: Number,
        signedUrls: {
          type: Array,
          schema: [String]
        },
        name: {
          type: String,
          required: false // since it's optional
        }
      }
    }]
  }
});

export const CustomerModel = dynamoose.model<Customer>('VueConverterTable2', CustomerSchema)
