import { ItemDocument, ItemModel } from "../../database/model/item.model";
import { Resolver, Query, Args, Arg, Mutation, Ctx } from "type-graphql";
import { AddItemInput, AddOrRemove, AddRemoveItemToWishlist, ItemIdsResponse, ItemResponse } from "../types/item.types";
import { InventoryDocument, InventoryModel } from "../../database/model/inventory.model";
import { generateRendomString } from "../../utils/generateId";
import { CategoryDocument, CategoryModel, SubCategoryDocument, SubCategoryModel } from "../../database/model/category.model";
import { CategoryAndSubCategory, SubCategoryWithCategoryResponse } from "../types/category.types";
import { Context } from "../types/context";
import { verify } from "jsonwebtoken";
import { UserDocument, UserModel } from "../../database/model/user.model";

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
        @Ctx() context: Context,
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

        //method 2
        const item: ItemDocument = await ItemModel.findOne({ itemId }).populate('inventory');
        if (!item) {
            throw new Error('Unable to get item by Id');
        }

        let itemResponse: ItemResponse = {
            itemId: item.itemId,
            brand: item.brand,
            category: item.category,
            subCategory: item.subCategory,
            name: item.name,
            url: item.url,
            inventory: item.inventory,
            isStared: false,
        };

        // verify user
        // check itemId in user's wishlist
        const authorization = context.req.headers['authorization'];
        if (!authorization) {
            return itemResponse;
        }
        try {
            const token = authorization.split(' ')[1];
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
            const isItemStared: UserDocument = await UserModel.findOne({ userId: payload.userId }).populate(
                {
                    path: 'staredItems',
                    model: 'items',
                    match: { itemId },
                    select: {
                        _id: 1
                    }
                })
            console.log(isItemStared)
            if (!isItemStared || isItemStared.staredItems.length == 0) {
                return itemResponse;
            }
            return { ...itemResponse, isStared: true };
        } catch (err) {
            return itemResponse;
        }

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
    async getAllCategoryAndSubCategoryName(): Promise<Array<CategoryAndSubCategory>> {
        let response: CategoryAndSubCategory[] = [];
        const categorywithSubCategories: [CategoryDocument] = await CategoryModel.find().populate(
            {
                path: 'subCategoryRefs',
                model: 'subCategories',
                select: {
                    name: 1,
                    itemRefs: 1,
                    subCategoryId: 1,
                    _id: 0
                },
                // populate: {
                //     path: 'itemRefs',
                //     model: 'items',
                //     select: {
                //         _id: 0,
                //         itemId: 1
                //     },
                // }
            })
        if (!categorywithSubCategories) {
            throw new Error("Don't have item!")
        }
        categorywithSubCategories.forEach((element: CategoryDocument, _index: number) => {
            response.push({
                category: element.name,
                subCategory: []
            })
            element.subCategoryRefs.forEach((ele: SubCategoryDocument) => {
                response[_index].subCategory.push(ele.name)
            })
        })
        return response;
    }

    @Query(() => [SubCategoryWithCategoryResponse])
    async getAllSubCategoriesWithCategory(): Promise<Array<SubCategoryWithCategoryResponse>> {
        let response: SubCategoryWithCategoryResponse[] = [];
        const categorywithSubCategories: [CategoryDocument] = await CategoryModel.find().populate(
            {
                path: 'subCategoryRefs',
                model: 'subCategories',
                select: {
                    name: 1,
                    itemRefs: 1,
                    subCategoryId: 1,
                    image: 1,
                    _id: 0
                }
            })
        if (!categorywithSubCategories) {
            throw new Error("Don't have items!")
        }
        categorywithSubCategories.forEach((element: CategoryDocument, _index: number) => {
            element.subCategoryRefs.forEach((ele: SubCategoryDocument) => {
                response.push({
                    category: element.name,
                    subCategory: ele.name,
                    image: ele.image
                })
            })
        })
        return response;
    }

    @Query(() => ItemIdsResponse)
    async getAllItemIdsBySubCategory(
        @Arg('subCategory') subCategory: string
    ): Promise<ItemIdsResponse | void> {
        let response: ItemIdsResponse = { itemIds: [], count: 0 };
        const allItemsBySubCategory: SubCategoryDocument = await SubCategoryModel.findOne({ name: subCategory }).populate(
            {
                path: 'itemRefs',
                model: 'items',
                select: {
                    itemId: 1
                }
            })
        if (!allItemsBySubCategory) {
            throw new Error("Don't have items!")
        }
        response.itemIds = allItemsBySubCategory.itemRefs.map(element => {
            return element.itemId
        })
        response.count = response.itemIds.length
        return response;
    }

    @Mutation(() => Boolean)
    async addRemoveItemToWishlist(
        @Ctx() context: Context,
        @Args() { itemId, action }: AddRemoveItemToWishlist
    ): Promise<boolean> {
        const authorization = context.req.headers['authorization'];
        if (!authorization) {
            return false;
        }
        try {
            const token = authorization.split(' ')[1];
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
            const item = await ItemModel.findOne({ itemId });
            if (!item) {
                throw new Error("Unable to get Item");
            }
            let isStaredUpdated: any;
            switch (action) {
                case AddOrRemove.ADD:
                    isStaredUpdated = await UserModel.updateOne({ userId: payload.userId }, { $addToSet: { staredItems: item._id } });
                    break;
                case AddOrRemove.REMOVE:
                    isStaredUpdated = await UserModel.updateOne({ userId: payload.userId }, { $pull: { staredItems: item._id } });
                    break;
                default:
                    // it will never be hitten ;)
                    return false;
            }
            if (isStaredUpdated && isStaredUpdated.nModified === 1) {
                return true
            }
            throw new Error(`Unbale to ${action} item!`);
        } catch (err) {
            throw new Error(`Unbale to ${action} item!`);
        }

    }


}


