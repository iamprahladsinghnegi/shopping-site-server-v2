import { Min } from "class-validator";
import { ObjectType, Field, Int, InputType } from "type-graphql";

@ObjectType('inentory')
export class Inventory {
    @Field(() => String)
    inventoryId: string;

    @Field(() => Int)
    available: number;

    @Field(() => Int)
    price: number;

    @Field(() => Int, { defaultValue: 0 })
    @Min(0)
    discount: number;
}

@InputType('inventoryInput')
export class InventoryImput {
    @Field(() => Int)
    available: number;

    @Field(() => Int)
    price: number;

    @Field(() => Int, { defaultValue: 0 })
    @Min(0)
    discount: number;
}