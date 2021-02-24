import { ItemDocument, ItemModel } from "../../database/model/item.model";
import { Resolver, Query, Args, Arg, Mutation } from "type-graphql";
import { AddItemInput, ItemIdsResponse, ItemResponse } from "../types/item.types";
import { InventoryDocument, InventoryModel } from "../../database/model/inventory.model";
import { generateRendomString } from "../../utils/generateId";
import { CategoryDocument, CategoryModel, SubCategoryDocument, SubCategoryModel } from "../../database/model/category.model";
import { CategoryAndSubCategory } from "../types/category.types";

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
        const itemIds: [ItemDocument] = await ItemModel.find({}, { itemId: 1 })
        if (!itemIds) {
            return itemResponse
        }
        itemIds.forEach(item => {
            itemResponse.itemIds.push(item.itemId)
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
        const item: ItemDocument = await ItemModel.findOne({ itemId }).populate('inventory')
        if (!item) {
            throw new Error('Unable to get item by Id')
        }
        return item

    }

    @Mutation(() => String)
    async addItem(
        @Args() { url, name, category, subCategory, inventoryInfo }: AddItemInput
    ): Promise<string> {

        //create inventory for item
        const inventoryId: string = generateRendomString();
        const isInventoryAdded: InventoryDocument = await InventoryModel.create({ inventoryId, ...inventoryInfo })
        if (!isInventoryAdded) {
            throw new Error('Unbale to add Inventory!')
        }

        //create item add link inventory
        const itemId: string = generateRendomString();
        const isItemAdded: ItemDocument = await ItemModel.create({ itemId, url, name, category, subCategory, inventory: isInventoryAdded._id })
        if (!isItemAdded) {
            throw new Error('Unbale to add Item!')
        }

        const isSubCategoryExists: SubCategoryDocument = await SubCategoryModel.findOne({ name: subCategory })
        let isSubCategoryAdded: SubCategoryDocument;
        const subCategoryId: string = generateRendomString();
        if (isSubCategoryExists) {
            isSubCategoryAdded = await SubCategoryModel.findOneAndUpdate({ name: subCategory }, { $addToSet: { itemRefs: isItemAdded._id } }, { new: true }) //to return the updated document
        }
        else {
            isSubCategoryAdded = await SubCategoryModel.create({ subCategoryId, name: subCategory, image: "img1", itemRefs: [isItemAdded._id] })
        }
        if (!isSubCategoryAdded) {
            throw new Error('Unbale to add Subcategory!')
        }

        const isCategoryExists: CategoryDocument = await CategoryModel.findOne({ name: category })
        let isCategoryAdded: CategoryDocument;
        const categoryId: string = generateRendomString();
        if (isCategoryExists) {
            isCategoryAdded = await CategoryModel.updateOne({ name: category }, { $addToSet: { subCategoryRefs: isSubCategoryAdded._id } }, { new: true })
        }
        else {
            isCategoryAdded = await CategoryModel.create({ categoryId, name: category, image: "img2", subCategoryRefs: [isSubCategoryAdded._id] })
        }
        if (!isCategoryAdded) {
            throw new Error('Unbale to add Category!')
        }
        return itemId
    }

    @Query(() => [CategoryAndSubCategory])
    async geAllItemCategories(): Promise<Array<CategoryAndSubCategory> | void> {
        // let response: CategoryAndSubCategory[];
        const categorywithSubCategories: [CategoryDocument] = await CategoryModel.find().populate(
            {
                path: 'subCategoryRefs',
                model: 'subCategories',
                // select: {
                //     name: 1,
                //     itemRefs: 1,
                //     _id: 0
                // },
                populate: {
                    path: 'subCategoryRefs.itemRefs',
                    model: 'items'
                }
            })
        if (!categorywithSubCategories) {
            throw new Error("Don't have inventory!")
        }
        categorywithSubCategories.forEach((element: CategoryDocument, _index: number) => {
            // element.subCategoryRefs.forEach((ele: SubCategoryDocument) => {
            //     console.log(ele.populate({
            //         path: 'itemRefs',
            //         model: 'items'
            //     }))
            // })
            console.log(element)
        })

    }
}


