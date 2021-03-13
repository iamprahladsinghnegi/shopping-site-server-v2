import { ObjectType, Field, Int, InputType, ArgsType, registerEnumType } from "type-graphql";
import { Inventory, InventoryImput } from './inventory.types';

@ObjectType()
export class ItemIdsResponse {
    @Field(() => [String]!)
    itemIds: string[];

    @Field(() => Int)
    count: number;
}


@InputType('DescriptionInput')
@ObjectType('DescriptionObject')
export class Description {
    @Field(() => String)
    details: string;

    @Field(() => String)
    size: string;

    @Field(() => String)
    fit: string;

    @Field(() => String)
    materials: string;

    @Field(() => String)
    care: string;
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
@InputType()
export class NameWithImageInput {
    @Field(() => String)
    name: string;

    @Field(() => String)
    image: string;
}
@InputType({ description: "add Item" })
@ArgsType()
export class AddItemInput implements Partial<ItemResponse> {

    @Field(() => String)
    name: string;

    @Field(() => String)
    brand: string;

    @Field(() => NameWithImageInput)
    categoryInfo: NameWithImageInput;

    @Field(() => NameWithImageInput)
    subCategoryInfo: NameWithImageInput;

    @Field(() => [String!])
    images: string[];

    @Field(() => InventoryImput)
    inventoryInfo: InventoryImput;

    @Field(() => Description)
    description: Description;
}

@ObjectType()
export class ItemDetailsResponse implements Partial<ItemResponse>{
    @Field()
    itemId: string;

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

    @Field(() => [String!])
    images: string[];

    @Field(() => Description)
    description: Description

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

// ["What's New", "Popularity", "Better Discount", "Price: High to Low", "Price: Low to High"]
export enum SortFilter {
    NEW = "What's New",
    POPULARITY = "Popularity",
    DISCOUNT = "Popularity",
    COSTLY = "Price: High to Low",
    BUDGET = "Price: Low to High"
}

registerEnumType(SortFilter, {
    name: "Sort Filter",
    description: "For Sort the item",
});

@InputType()
export class FilterOptions {
    @Field(() => SortFilter)
    sort: SortFilter;

    @Field(() => [String])
    price: string[];

    @Field(() => [String])
    category: string[];

    @Field(() => [String])
    discount: string[];
}

@InputType()
@ArgsType()
export class GetItemIdsBySubCategoryWithFilter {
    @Field(() => String)
    subCategory: string;

    @Field(() => FilterOptions)
    filterOptions: FilterOptions;
}
