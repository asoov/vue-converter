import { Schema } from 'dynamoose';

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
