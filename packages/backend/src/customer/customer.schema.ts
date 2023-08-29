import { Schema } from "dynamoose";
export const CustomerSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  firstName: {
    type: String,
    hashKey: true
  },
  lastName: {
    type: String,
    hashKey: true,
  },
  paid: {
    type: Boolean,
    default: false,
    hashKey: true
  },
  credits: {
    type: Number,
    hashKey: true
  }
})

