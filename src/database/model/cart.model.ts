import mongoose, { Document } from "mongoose";
import { CartSchema } from "../schema/cart";
import { ICart } from "../types/cart";
export interface CartDocument extends Document {
    cartId: string;
    items: Array<ICart>
}
export const CartModel = mongoose.model<CartDocument>('carts', CartSchema)
