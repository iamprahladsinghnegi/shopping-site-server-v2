import { Min } from "class-validator";
import { ObjectType, Field, Int, InputType } from "type-graphql";

@InputType('availableInput')
@ObjectType('availableObject')
export class Available {
    @Field(() => String)
    name: string;

    @Field(() => Int, { defaultValue: 0 })
    @Min(0)
    quantity: number
}

@ObjectType('inentory')
export class Inventory {
    @Field(() => String)
    inventoryId: string;

    @Field(() => [Available])
    available: Available[];

    @Field(() => Int)
    price: number;

    @Field(() => Int, { defaultValue: 0 })
    @Min(0)
    discount: number;
}

@InputType('inventoryInput')
export class InventoryImput {
    @Field(() => [Available])
    available: Available[];

    @Field(() => Int)
    price: number;

    @Field(() => Int, { defaultValue: 0 })
    @Min(0)
    discount: number;
}