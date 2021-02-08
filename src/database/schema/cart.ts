import { Schema } from 'mongoose';
export const CartSchema: Schema = new Schema({
    cartId: { type: String, required: true, unique: true },
    items: [{ quantity: Number, item: { type: Schema.Types.ObjectId, ref: 'items' }, itemId: String }]
});