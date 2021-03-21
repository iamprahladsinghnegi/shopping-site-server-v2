import { Schema } from 'mongoose';
export const CartSchema: Schema = new Schema({
    cartId: { type: String, required: true, unique: true },
    items: [{ _id: false, size: { type: String, required: true }, quantity: { type: Number, required: true }, itemId: { type: String, required: true }, item: { type: Schema.Types.ObjectId, ref: 'items' } }]
});

//https://stackoverflow.com/questions/20863441/why-is-an-id-with-objectid-added-to-when-using-mongodbs-push-to-add-new-objec