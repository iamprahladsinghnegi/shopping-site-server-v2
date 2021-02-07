import { Schema } from 'mongoose';
export const AddressSchema: Schema = new Schema({
    street: { type: String },
    city: { type: String },
    postCode: { type: String }
});
