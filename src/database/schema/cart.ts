import { Schema } from 'mongoose';
export const CartSchema: Schema = new Schema({
    items: [{ quantity: Number, item: { type: Schema.Types.ObjectId, ref: 'items' } }]
});