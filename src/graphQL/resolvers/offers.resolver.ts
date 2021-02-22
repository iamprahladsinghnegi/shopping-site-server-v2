import { generateRendomString } from "../../utils/generateId";
import { Resolver, Query, Mutation, Args } from "type-graphql";
import { OfferDocument, OfferModel } from "../../database/model/offer.model";
import { OfferResponse, OfferImput } from "../types/offer.types";

@Resolver()
export class OfferResolver {

    @Query(() => OfferResponse)
    async getLatestOffers(): Promise<OfferResponse> {
        let offerResponse: OfferResponse = { offers: [], count: 0 }
        const offers: OfferDocument[] = await OfferModel.find({})
        if (!offers) {
            throw new Error('Unable to get offers!')
        }
        offerResponse.offers = offers
        offerResponse.count = offerResponse.offers.length
        return offerResponse
    }


    @Mutation(() => String)
    async addOffer(
        @Args() { title, image, startAt, endAt }: OfferImput,
    ): Promise<string> {
        console.log(title, image, startAt, endAt)
        //create inventory for offerId
        const offerId: string = generateRendomString();

        const isInventoryUpdated = await OfferModel.create({ offerId, title, image, startAt, endAt })
        if (!isInventoryUpdated) {
            throw new Error('Unable to create offer!')
        }
        return offerId
    }

}


