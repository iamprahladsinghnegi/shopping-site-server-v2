import { Schema } from 'mongoose';
export const OfferSchema: Schema = new Schema({
    offerId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
});