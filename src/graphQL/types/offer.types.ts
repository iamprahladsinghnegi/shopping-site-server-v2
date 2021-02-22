import { Min } from "class-validator";
import { ObjectType, Field, Int, InputType, ArgsType } from "type-graphql";


// @ObjectType('offersItem')
// export class OfferItem {
//     @Field(() => String)
//     offerId: string;

//     @Field(() => String)
//     image: string;

//     @Field(() => String)
//     title: string;

//     @Field(() => Date)
//     startAt: Date;

//     @Field(() => Date)
//     endAt: Date;
// }

@ObjectType('offers')
export class OfferResponse {
    @Field(() => [OfferItem])
    offers: OfferItem[];

    @Field(() => Int, { defaultValue: 0 })
    @Min(0)
    count: number;
}

@ObjectType()
@InputType('offerInput')
@ArgsType()
export class OfferImput {

    @Field(() => String)
    image: string;

    @Field(() => String)
    title: string;

    @Field(() => Date)
    startAt: Date;

    @Field(() => Date)
    endAt: Date;
}

@ObjectType('offersItem')
export class OfferItem extends OfferImput {
    @Field(() => String)
    offerId: string;

}