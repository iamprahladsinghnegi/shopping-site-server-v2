import { Schema } from 'mongoose';
export const InventorySchema: Schema = new Schema({
    inventoryId: { type: String, required: true, unique: true },
    discount: { type: Number, default: 0 },
    available: [{ name: { type: String, required: true }, quantity: { type: Number, default: 0 } }],
    price: { type: Number, default: 0 }
});