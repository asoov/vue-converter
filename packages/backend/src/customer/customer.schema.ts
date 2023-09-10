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
});
