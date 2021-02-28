import { ObjectType, Field, Int, InputType, ArgsType, registerEnumType } from "type-graphql";
import { Inventory, InventoryImput } from './inventory.types';

@ObjectType()
export class ItemIdsResponse {
    @Field(() => [String]!)
    itemIds: string[];

    @Field(() => Int)
    count: number;
}

@ObjectType()
export class ItemResponse {
    @Field()
    itemId: string;

    @Field(() => String)
    url: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    brand: string;

    @Field(() => Boolean)
    isStared: boolean;

    @Field(() => String)
    category: string;

    @Field(() => String)
    subCategory: string;

    @Field(() => Inventory)
    inventory: Inventory;
}

@InputType({ description: "add Item" })
@ArgsType()
export class AddItemInput implements Partial<ItemResponse> {
    @Field(() => String)
    url: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    category: string;

    @Field(() => String)
    subCategory: string;

    @Field(() => InventoryImput)
    inventoryInfo: InventoryImput;
}


export enum AddOrRemove {
    ADD = "ADD",
    REMOVE = "REMOVE",
}

registerEnumType(AddOrRemove, {
    name: "AddOrRemove",
    description: "add or remove item form wishlist",
});
@InputType({ description: "add or remove item form wishlist" })
@ArgsType()
export class AddRemoveItemToWishlist {
    @Field(() => String)
    itemId: string;

    @Field(() => AddOrRemove)
    action: AddOrRemove;
}

