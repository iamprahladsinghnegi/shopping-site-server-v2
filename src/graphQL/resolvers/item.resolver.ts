import { ItemDocument, ItemModel } from "../../database/model/item.model";
import { Resolver, Query, Args, Arg, Mutation } from "type-graphql";
import { AddItemInput, ItemIdsResponse, ItemResponse } from "../types/item.types";
import { InventoryDocument, InventoryModel } from "../../database/model/inventory.model";

@Resolver()
export class ItemResolver {
    //TODO -> research
    // private itemsCollection: Item[] = [];

    // @Query(() => [Item])
    // async getAllItems() {
    //     return await this.itemsCollection;
    // }

    // @Query(() => [Item])
    // async recipes(
    //     @Arg("title", { nullable: true }) title?: string,
    //     @Arg("servings", { defaultValue: 2 }) servings: number,
    // ): Promise<Item[]> {
    //     // ...
    // }

    @Query(() => ItemIdsResponse)
    async geAllItemsIds(): Promise<ItemIdsResponse> {
        let itemResponse: ItemIdsResponse = { itemIds: [], count: 0 };
        const itemIds: [ItemDocument] = await ItemModel.find({}, { projection: { _id: 1 } })
        if (!itemIds) {
            return itemResponse
        }
        itemIds.forEach(item => {
            itemResponse.itemIds.push(item._id)
        })
        itemResponse.count = itemResponse.itemIds.length
        return itemResponse
    }

    @Query(() => ItemResponse)
    async getItemDetailsById(
        @Arg('itemId') itemId: string
    ): Promise<ItemResponse> {
        //method 1
        // const item: ItemDocument = await ItemModel.findOne({ _id: itemId })
        // if (!item) {
        //     throw new Error('Unable to get item by Id')
        // }
        // const inventory = await InventoryModel.findOne({ _id: item.inventory })
        // if (!inventory) {
        //     throw new Error('Unable to get inventory by Id')
        // }
        // //constract item

        //method 2
        // populate({path: "blogs",populate: {path: "comments",select: { body: 1 }}}) -> for nested
        //.populate('inventory', { available: 1, price: 1 }) -> projection
        const item: ItemDocument = await ItemModel.findOne({ _id: itemId }).populate('inventory')
        if (!item) {
            throw new Error('Unable to get item by Id')
        }
        return item

    }

    @Mutation(() => Boolean)
    async addItem(
        @Args() { url, name, category, subCategory, inventory }: AddItemInput
    ): Promise<boolean> {
        const addInventory: InventoryDocument = new InventoryModel(inventory)

        const isInventoryAdded = await InventoryModel.create(addInventory)
        if (!isInventoryAdded) {
            throw new Error('Unbale to add Inventory!')
        }

        const item: ItemDocument = new ItemModel({ url, name, category, subCategory, inventory: isInventoryAdded._id })

        const isItemAdded = await ItemModel.create(item)

        if (!isItemAdded) {
            throw new Error('Unbale to add Item!')
        }

        return true
    }


}


