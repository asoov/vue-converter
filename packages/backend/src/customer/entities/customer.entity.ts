import { Item } from "dynamoose/dist/Item"

export class Customer extends Item {
  id: string
  firstName: string
  lastName: string
  paid: boolean
  aiCredits: number
}
