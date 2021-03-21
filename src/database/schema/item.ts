import { Schema } from 'mongoose';
export const ItemSchema: Schema = new Schema({
    itemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    subCategory: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    inventory: { type: Schema.Types.ObjectId, ref: 'inventories' },
    images: [{ type: String, required: true, unique: true }],
    description: {
        details: { type: String, required: true },
        size: { type: String, required: true },
        fit: { type: String, required: true },
        materials: { type: String, required: true },
        care: { type: String, required: true },
        specifications: [{ _id: false, key: { type: String, required: true }, value: { type: String, required: true } }],
        extra: { type: String },
    }
});
