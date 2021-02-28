import { Schema } from 'mongoose';
// import { Gender } from '../types/user';

export const UserSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    // Gets the Mongoose enum from the TypeScript enum
    // gender: { type: String, enum: Object.values(Gender) },
    tokenNumber: { type: Number, default: 0 },
    cart: { type: Schema.Types.ObjectId, ref: 'carts' },
    staredItems: [{ type: Schema.Types.ObjectId, ref: 'items' }]
});
