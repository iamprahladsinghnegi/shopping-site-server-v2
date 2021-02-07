import { Min } from "class-validator";
import { ObjectType, Field, Int, InputType } from "type-graphql";

@ObjectType()
@InputType()
export class Inventory {
    @Field(() => Int)
    available: number;

    @Field(() => Int)
    price: number;

    @Field(() => Int, { defaultValue: 0 })
    @Min(0)
    discount: number;
}