import mongoose, { Document } from "mongoose";
import { InventorySchema } from "../schema/inventory";
import { IInvetory } from "../types/inventory";

export interface InventoryDocument extends IInvetory, Document { }
export const InventoryModel = mongoose.model<InventoryDocument>('inventories', InventorySchema)