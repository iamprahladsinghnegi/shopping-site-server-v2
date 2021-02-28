import mongoose, { Document } from "mongoose";
import { IUser } from "../types/user";
import { UserSchema } from "../schema/user";
import { CartDocument } from "./cart.model";
import { ItemDocument } from "./item.model";

// Create the Mongoose document type
// (merge with Mongoose.Document and erase `items` with its Mongoose-array version)

// export type UserDocument = IUser & Document & { items: Types.Array<IItem> } & { address: Types.Array<IAddress> }  //type 1
export interface UserDocument extends IUser, Document {
    cart: CartDocument['_id'];
    staredItems: Array<ItemDocument['_id']>;
}
export const UserModel = mongoose.model<UserDocument>('users', UserSchema)
