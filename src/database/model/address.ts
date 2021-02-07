import mongoose, { Document } from "mongoose";
import { AddressSchema } from "../schema/address";
import { IAddress } from "../types/user";

export type AddressDocument = IAddress & Document
export const AddressModel = mongoose.model<AddressDocument>('Address', AddressSchema)