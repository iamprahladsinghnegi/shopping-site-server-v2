import { Min } from "class-validator";
import { ObjectType, Field, Int, InputType } from "type-graphql";

@ObjectType('inentory')
@InputType('inventoryInput')
export class Inventory {
    @Field(() => Int)
    available: number;

    @Field(() => Int)
    price: number;

    @Field(() => Int, { defaultValue: 0 })
    @Min(0)
    discount: number;
}