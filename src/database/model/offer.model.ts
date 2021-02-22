import mongoose, { Document } from "mongoose";
import { OfferSchema } from "../schema/offer";
import { IOffers } from "../types/offers";

export interface OfferDocument extends IOffers, Document { }
export const OfferModel = mongoose.model<OfferDocument>('offers', OfferSchema)