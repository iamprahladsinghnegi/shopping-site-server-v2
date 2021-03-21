import { ItemDocument, ItemModel } from "../../database/model/item.model";
import { Resolver, Query, Args, Arg, Mutation, Ctx } from "type-graphql";
import { AddItemInput, AddOrRemove, AddRemoveItemToWishlist, SortFilter, GetItemIdsBySubCategoryWithFilter, ItemDetailsResponse, ItemIdsResponse, ItemResponse } from "../types/item.types";
import { InventoryDocument, InventoryModel } from "../../database/model/inventory.model";
import { generateRendomString } from "../../utils/generateId";
import { CategoryDocument, CategoryModel, SubCategoryDocument, SubCategoryModel } from "../../database/model/category.model";
import { CategoryAndSubCategory, SubCategoryWithCategoryResponse } from "../types/category.types";
import { Context } from "../types/context";
import { verify } from "jsonwebtoken";
import { UserDocument, UserModel } from "../../database/model/user.model";
//https://stackoverflow.com/questions/31180455/mongoose-sort-by-populated-field?rq=1

@Resolver()
export class ItemResolver {
    // constructor(
    //     private readonly itemCollection : typeof ItemModel,
    // ){}

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
        const item: ItemDocument = await ItemModel.findOne({ itemId }, { description: 0 }).populate('inventory');
        if (!item) {
            throw new Error('Unable to get item by Id');
        }

        let itemResponse: ItemResponse = {
            itemId: item.itemId,
            brand: item.brand,
            category: item.category,
            subCategory: item.subCategory,
            name: item.name,
            url: item.images[0], // temp -> first image
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

    @Query(() => ItemDetailsResponse)
    async getItemDetails(
        @Ctx() context: Context,
        @Arg('itemId') itemId: string
    ): Promise<ItemDetailsResponse> {
        const item: ItemDocument = await ItemModel.findOne({ itemId }).populate('inventory');
        if (!item) {
            throw new Error('Unable to get item by Id');
        }

        let itemResponse: ItemDetailsResponse = {
            itemId: item.itemId,
            brand: item.brand,
            category: item.category,
            subCategory: item.subCategory,
            name: item.name,
            images: item.images,
            inventory: item.inventory,
            description: item.description,
            isStared: false,
        };

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
        @Args() { name, categoryInfo, subCategoryInfo, inventoryInfo, brand, images, description }: AddItemInput
    ): Promise<string> {

        //create inventory for item
        const inventoryId: string = generateRendomString();
        const isInventoryAdded: InventoryDocument = await InventoryModel.create({ inventoryId, ...inventoryInfo })
        if (!isInventoryAdded) {
            throw new Error('Unbale to add Inventory!')
        }

        //create item add link inventory
        const itemId: string = generateRendomString();
        const isItemAdded: ItemDocument = await ItemModel.create({ itemId, name, brand, category: categoryInfo.name, subCategory: subCategoryInfo.name, images, description, inventory: isInventoryAdded._id })
        if (!isItemAdded) {
            throw new Error('Unbale to add Item!')
        }

        const isSubCategoryExists: SubCategoryDocument = await SubCategoryModel.findOne({ name: subCategoryInfo.name })
        let isSubCategoryAdded: SubCategoryDocument;
        const subCategoryId: string = generateRendomString();
        if (isSubCategoryExists) {
            isSubCategoryAdded = await SubCategoryModel.findOneAndUpdate({ name: subCategoryInfo.name }, { $addToSet: { itemRefs: isItemAdded._id } }, { new: true }) //to return the updated document
        }
        else {
            isSubCategoryAdded = await SubCategoryModel.create({ subCategoryId, name: subCategoryInfo.name, image: subCategoryInfo.image, itemRefs: [isItemAdded._id] })
        }
        if (!isSubCategoryAdded) {
            throw new Error('Unbale to add Subcategory!')
        }

        const isCategoryExists: CategoryDocument = await CategoryModel.findOne({ name: categoryInfo.name })
        let isCategoryAdded: CategoryDocument;
        const categoryId: string = generateRendomString();
        if (isCategoryExists) {
            isCategoryAdded = await CategoryModel.updateOne({ name: categoryInfo.name }, { $addToSet: { subCategoryRefs: isSubCategoryAdded._id } }, { new: true })
        }
        else {
            isCategoryAdded = await CategoryModel.create({ categoryId, name: categoryInfo.name, image: categoryInfo.image, subCategoryRefs: [isSubCategoryAdded._id] })
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
        //TODO: unable to sort based on filter(nested population)
        const allItemsBySubCategory: SubCategoryDocument = await SubCategoryModel.findOne({ name: subCategory }).populate(
            {
                path: 'itemRefs',
                model: 'items',
                select: {
                    itemId: 1,
                    // inventory: 1,
                    name: 1
                },
                options: {
                    sort: {
                        name: 1,
                    },
                },
                // populate: {
                //     path: 'inventory',
                //     model: 'inventories',
                //     select: {
                //         _id: 1,
                //         price: 1
                //     }
                // },
            })
        if (!allItemsBySubCategory) {
            throw new Error("Don't have items!")
        }
        response.itemIds = allItemsBySubCategory.itemRefs.map(element => {
            console.log(element)
            return element.itemId
        })
        response.count = response.itemIds.length
        const itemIds = await ItemModel.find({ subCategory }, { itemId: 1, _id: 0, name: 1 }).populate({
            path: 'inventory',
            model: 'inventories',
        }).sort({ "name": 1 })
        console.log(itemIds)
        return response;
    }

    @Query(() => ItemIdsResponse)
    async getAllItemIdsBySubCategoryWithFilter(
        @Args() { subCategory, filterOptions }: GetItemIdsBySubCategoryWithFilter,
    ): Promise<ItemIdsResponse | void> {
        let response: ItemIdsResponse = { itemIds: [], count: 0 };
        //TODO: after ppopulate cant peform sort https://github.com/Automattic/mongoose/issues/4481
        // const items = await ItemModel.find({ subCategory }, { itemId: 1, name: 1, _id: 0, inventory: 1 }).populate({
        //     path: 'inventory',
        //     model: 'inventories',
        // options: {
        //     sort: {
        //         price: 1
        //     }
        // }
        // }).sort('inventory.price')
        let pipeline: Array<any> = [{
            "$match": {
                subCategory
            }
        },
        {
            "$project": {
                'inventory': 1,
                'itemId': 1,
                'name': 1
            }
        },
        {
            "$lookup": {
                "from": "inventories",
                "localField": "inventory",
                "foreignField": "_id",
                "as": "inventory"
            }
        },
        {
            "$unwind": "$inventory"
        }
        ];
        switch (filterOptions.sort) {
            case SortFilter.NEW:
                break;
            case SortFilter.POPULARITY:
                break;
            case SortFilter.DISCOUNT:
                pipeline.push(
                    {
                        "$sort": {
                            "inventory.discount": -1
                        }
                    }
                )
                break;
            case SortFilter.COSTLY:
                pipeline.push(
                    {
                        "$sort": {
                            "inventory.price": -1
                        }
                    }
                )
                break;
            case SortFilter.BUDGET:
                pipeline.push(
                    {
                        "$sort": {
                            "inventory.price": 1
                        }
                    }
                )
                break;
            default:
                // it will never be hitten ;)
                break;
        }
        const items = await ItemModel.aggregate(pipeline);
        items.forEach((element: ItemDocument) => {
            response.itemIds.push(element.itemId);
        });
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


