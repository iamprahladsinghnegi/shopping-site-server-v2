import mongoose, { Document } from "mongoose";
import { ItemSchema } from "../schema/item";
import { IItem } from "../types/items";
import { InventoryDocument } from './inventory.model'

// export interface ItemDocument extends IItem, Document { } //type 2
export interface ItemDocument extends IItem, Document {
    inventory: InventoryDocument['_id'];
}
export const ItemModel = mongoose.model<ItemDocument>('items', ItemSchema)
