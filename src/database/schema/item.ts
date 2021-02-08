import { Schema } from 'mongoose';
export const ItemSchema: Schema = new Schema({
    itemId: { type: String, required: true, unique: true },
    url: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    subCategory: { type: String, required: true },
    category: { type: String, required: true },
    inventory: { type: Schema.Types.ObjectId, ref: 'inventories' }
});
