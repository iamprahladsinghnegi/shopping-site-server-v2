import mongoose, { Document } from "mongoose";
import { CartSchema } from "../schema/cart";
import { ItemDocument } from "./item.model";

export interface ICart {
    item: ItemDocument['_id'];
    quantity: number;
}
export interface CartDocument extends Document {
    items: Array<ICart>
}
export const CartModel = mongoose.model<CartDocument>('carts', CartSchema)
